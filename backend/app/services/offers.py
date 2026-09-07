"""Deterministic Offer / negotiation service (no ML).

Lifecycle: a buyer submits an offer against an eligible (published lot, active
demand, grade-compatible) pair. The farmer (or buyer, alternating by round)
may accept, reject, or counter. Counters start a new ``Offer`` row linked via
``parent_offer_id`` and increment ``round``. Every action is recorded in the
append-only ``OfferHistory`` audit log.

All policy constants are module-level for easy inspection/tuning.
"""
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.demand import Demand
from app.models.enums import BuyerStatus, DemandStatus, LotStatus, OfferStatus, UserRole
from app.models.offer import Offer, OfferHistory
from app.models.produce_lot import ProduceLot
from app.services.grade_matching import evaluate_grade_compatibility
from app.services.transactions import TransactionError, create_transaction


# --- Policy constants --------------------------------------------------------
OFFER_EXPIRY_HOURS = 48
MAX_NEGOTIATION_ROUNDS = 5
TERMINAL_STATUSES = {OfferStatus.accepted, OfferStatus.rejected, OfferStatus.expired}


class OfferError(Exception):
    """Raised for any offer business-rule violation; carries an HTTP status code."""
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


def _responder_side(round_number: int) -> str:
    """Which side responds to the current offer: odd round -> farmer, even -> buyer."""
    return "farmer" if round_number % 2 == 1 else "buyer"


def _has_child(db: Session, offer_id: int) -> bool:
    return db.query(Offer).filter(Offer.parent_offer_id == offer_id).first() is not None


def _record_history(
    db: Session,
    offer: Offer,
    action: str,
    actor_user_id: int,
    from_status: Optional[OfferStatus],
    to_status: Optional[OfferStatus],
    reason: Optional[str] = None,
) -> None:
    db.add(
        OfferHistory(
            offer_id=offer.id,
            actor_user_id=actor_user_id,
            action=action,
            from_status=from_status,
            to_status=to_status,
            quantity=offer.quantity,
            offered_price=offer.offered_price,
            pickup_window=offer.pickup_window,
            payment_terms=offer.payment_terms,
            message=offer.message,
            reason=reason,
        )
    )


def _validate_eligible_pair(db: Session, demand_id: int, lot_id: int) -> tuple[Demand, ProduceLot]:
    demand = db.get(Demand, demand_id)
    lot = db.get(ProduceLot, lot_id)

    if demand is None:
        raise OfferError("Demand not found", status_code=404)
    if lot is None:
        raise OfferError("Lot not found", status_code=404)
    if demand.status != DemandStatus.active:
        raise OfferError("Demand is not active", status_code=400)
    if lot.status != LotStatus.published.value:
        raise OfferError("Lot is not eligible (must be published)", status_code=400)
    if lot.commodity_id != demand.commodity_id:
        raise OfferError("Lot and demand commodity must match", status_code=400)
    compatibility = evaluate_grade_compatibility(lot.quality_grade, demand.minimum_grade)
    if compatibility.compatibility.value == "incompatible":
        raise OfferError(
            f"Lot grade '{lot.quality_grade}' does not meet demand minimum '{demand.minimum_grade}'",
            status_code=400,
        )
    return demand, lot


def _require_verified_buyer(db: Session, user_id: int) -> "int":
    from app.models.buyer import Buyer
    buyer = db.query(Buyer).filter(Buyer.user_id == user_id).first()
    if not buyer:
        raise OfferError("No buyer profile associated with this user", status_code=403)
    if buyer.status != BuyerStatus.verified:
        raise OfferError(
            f"Buyer account is '{buyer.status.value}'; verified buyer status is required to submit offers",
            status_code=403,
        )
    return buyer.id


def _require_lot_owner_farmer(db: Session, user_id: int, lot_id: int) -> None:
    from app.models.farmer import Farmer
    farmer = db.query(Farmer).filter(Farmer.user_id == user_id).first()
    lot = db.get(ProduceLot, lot_id)
    if not farmer or not lot or farmer.id != lot.farmer_id:
        raise OfferError("You may only respond to offers on your own lots", status_code=403)


def create_offer(
    db: Session,
    demand_id: int,
    lot_id: int,
    quantity: float,
    offered_price: float,
    pickup_window: str,
    payment_terms: str,
    message: Optional[str],
    buyer_user_id: int,
) -> Offer:
    demand, lot = _validate_eligible_pair(db, demand_id, lot_id)
    buyer_id = _require_verified_buyer(db, buyer_user_id)
    if buyer_id != demand.buyer_id:
        raise OfferError("You may only submit offers against your own demand", status_code=403)
    if quantity <= 0:
        raise OfferError("Quantity must be positive", status_code=400)
    if offered_price <= 0:
        raise OfferError("Offered price must be positive", status_code=400)
    if quantity > lot.quantity_kg:
        raise OfferError("Offer quantity exceeds the lot's available quantity", status_code=400)
    if quantity > demand.required_quantity:
        raise OfferError("Offer quantity exceeds the demand's required quantity", status_code=400)

    offer = Offer(
        demand_id=demand_id,
        lot_id=lot_id,
        buyer_id=buyer_id,
        farmer_id=lot.farmer_id,
        quantity=quantity,
        offered_price=offered_price,
        pickup_window=pickup_window,
        payment_terms=payment_terms,
        message=message,
        status=OfferStatus.submitted,
        parent_offer_id=None,
        round=1,
        expires_at=datetime.utcnow() + timedelta(hours=OFFER_EXPIRY_HOURS),
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    _record_history(db, offer, "submitted", buyer_user_id, None, OfferStatus.submitted)
    db.commit()
    db.refresh(offer)
    return offer


def _load_actionable_offer(db: Session, offer_id: int) -> Offer:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise OfferError("Offer not found", status_code=404)
    if offer.status in TERMINAL_STATUSES:
        raise OfferError(f"Offer cannot be modified (status={offer.status.value})", status_code=409)
    if offer.expires_at < datetime.utcnow():
        offer.status = OfferStatus.expired
        db.commit()
        db.refresh(offer)
        raise OfferError("Offer has expired", status_code=409)
    return offer


def counter_offer(
    db: Session,
    offer_id: int,
    quantity: float,
    offered_price: float,
    pickup_window: str,
    payment_terms: str,
    message: Optional[str],
    actor_user_id: int,
    actor_role: UserRole,
) -> Offer:
    parent = _load_actionable_offer(db, offer_id)

    if _has_child(db, parent.id):
        raise OfferError("Offer already has a counteroffer", status_code=409)

    if parent.round >= MAX_NEGOTIATION_ROUNDS:
        raise OfferError(f"Maximum of {MAX_NEGOTIATION_ROUNDS} negotiation rounds reached", status_code=400)

    expected_side = _responder_side(parent.round)  # who may counter this offer
    allowed_roles = {UserRole.admin}
    if expected_side == "farmer":
        allowed_roles.add(UserRole.farmer)
        _require_lot_owner_farmer(db, actor_user_id, parent.lot_id)
    else:
        allowed_roles.add(UserRole.buyer)
        user_buyer_id = _require_verified_buyer(db, actor_user_id)
        if user_buyer_id != parent.buyer_id:
            raise OfferError("You may only counter offers on your own demand", status_code=403)
    if actor_role not in allowed_roles:
        raise OfferError("Not authorized to counter this offer", status_code=403)

    if quantity <= 0:
        raise OfferError("Quantity must be positive", status_code=400)
    if offered_price <= 0:
        raise OfferError("Offered price must be positive", status_code=400)

    # Counter quantities must still respect the lot availability and demand.
    lot = db.get(ProduceLot, parent.lot_id)
    demand = db.get(Demand, parent.demand_id)
    if lot and quantity > lot.quantity_kg:
        raise OfferError("Counter quantity exceeds the lot's available quantity", status_code=400)
    if demand and quantity > demand.required_quantity:
        raise OfferError("Counter quantity exceeds the demand's required quantity", status_code=400)

    previous_status = parent.status
    parent.status = OfferStatus.countered
    _record_history(
        db, parent, "countered", actor_user_id,
        from_status=previous_status, to_status=OfferStatus.countered,
    )

    new_offer = Offer(
        demand_id=parent.demand_id,
        lot_id=parent.lot_id,
        buyer_id=parent.buyer_id,
        farmer_id=parent.farmer_id,
        quantity=quantity,
        offered_price=offered_price,
        pickup_window=pickup_window,
        payment_terms=payment_terms,
        message=message,
        status=OfferStatus.submitted,
        parent_offer_id=parent.id,
        round=parent.round + 1,
        expires_at=datetime.utcnow() + timedelta(hours=OFFER_EXPIRY_HOURS),
    )
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)
    _record_history(db, new_offer, "submitted", actor_user_id, None, OfferStatus.submitted)
    db.commit()
    db.refresh(new_offer)
    return new_offer


def _authorize_responder(db: Session, offer: Offer, actor_user_id: int, actor_role: UserRole) -> None:
    if actor_role == UserRole.admin:
        return
    expected_side = _responder_side(offer.round)
    if expected_side == "farmer":
        _require_lot_owner_farmer(db, actor_user_id, offer.lot_id)
    else:
        user_buyer_id = _require_verified_buyer(db, actor_user_id)
        if user_buyer_id != offer.buyer_id:
            raise OfferError("You may only respond to offers on your own demand", status_code=403)


def accept_offer(db: Session, offer_id: int, actor_user_id: int, actor_role: UserRole) -> Offer:
    offer = _load_actionable_offer(db, offer_id)
    if _has_child(db, offer.id):
        raise OfferError("Action the latest counteroffer instead", status_code=409)
    _authorize_responder(db, offer, actor_user_id, actor_role)
    previous_status = offer.status
    offer.status = OfferStatus.accepted
    _record_history(db, offer, "accepted", actor_user_id, from_status=previous_status, to_status=OfferStatus.accepted)
    db.commit()
    db.refresh(offer)
    create_transaction(
        db,
        offer_id=offer.id,
        quantity=offer.quantity,
        agreed_price=offer.offered_price,
        total_amount=offer.quantity * offer.offered_price,
        actor_user_id=actor_user_id,
    )
    current = db.get(Offer, offer.parent_offer_id) if offer.parent_offer_id else None
    while current is not None:
        if current.status != OfferStatus.accepted:
            prev_status = current.status
            current.status = OfferStatus.accepted
            _record_history(db, current, "accepted", actor_user_id, from_status=prev_status, to_status=OfferStatus.accepted)
            db.commit()
            db.refresh(current)
        current = db.get(Offer, current.parent_offer_id) if current.parent_offer_id else None
    return offer


def reject_offer(db: Session, offer_id: int, actor_user_id: int, actor_role: UserRole, reason: Optional[str] = None) -> Offer:
    offer = _load_actionable_offer(db, offer_id)
    if _has_child(db, offer.id):
        raise OfferError("Action the latest counteroffer instead", status_code=409)
    _authorize_responder(db, offer, actor_user_id, actor_role)
    previous_status = offer.status
    offer.status = OfferStatus.rejected
    _record_history(db, offer, "rejected", actor_user_id, from_status=previous_status, to_status=OfferStatus.rejected, reason=reason)
    db.commit()
    db.refresh(offer)
    return offer


def get_offer_history(db: Session, offer_id: int) -> list[OfferHistory]:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise OfferError("Offer not found", status_code=404)
    return db.query(OfferHistory).filter(OfferHistory.offer_id == offer_id).order_by(OfferHistory.created_at).all()
