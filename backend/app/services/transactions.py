"""Transaction, Shipment, and Payment services.

Transaction lifecycle is anchored to an accepted Offer. Terms are immutable
once the transaction is created. Status progression is enforced strictly.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.enums import TransactionStatus, UserRole
from app.models.offer import Offer
from app.models.transaction import Transaction
from app.models.shipment import Shipment
from app.models.payment import Payment
from app.services.audit import record_audit


class TransactionError(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


VALID_TRANSITIONS = {
    TransactionStatus.accepted: {TransactionStatus.confirmed, TransactionStatus.disputed},
    TransactionStatus.confirmed: {TransactionStatus.dispatched, TransactionStatus.disputed},
    TransactionStatus.dispatched: {TransactionStatus.in_transit, TransactionStatus.disputed},
    TransactionStatus.in_transit: {TransactionStatus.delivered, TransactionStatus.disputed},
    TransactionStatus.delivered: {TransactionStatus.payment_pending, TransactionStatus.disputed},
    TransactionStatus.payment_pending: {TransactionStatus.completed, TransactionStatus.disputed},
    TransactionStatus.disputed: {TransactionStatus.accepted},
    TransactionStatus.completed: set(),
    TransactionStatus.pending: {TransactionStatus.accepted, TransactionStatus.disputed},
}


def _assert_valid_transition(current: TransactionStatus, next_status: TransactionStatus) -> None:
    allowed = VALID_TRANSITIONS.get(current, set())
    if next_status not in allowed:
        raise TransactionError(
            f"Invalid status transition from '{current.value}' to '{next_status.value}'",
            status_code=409,
        )


def _load_accepted_offer(db: Session, offer_id: int) -> Offer:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise TransactionError("Offer not found", status_code=404)
    if offer.status != TransactionStatus.accepted.value:
        raise TransactionError("Transaction can only be created from an accepted offer", status_code=400)
    return offer


def create_transaction(
    db: Session,
    offer_id: int,
    quantity: float,
    agreed_price: float,
    total_amount: float,
    actor_user_id: Optional[int] = None,
) -> Transaction:
    offer = _load_accepted_offer(db, offer_id)

    existing = db.query(Transaction).filter(Transaction.offer_id == offer_id).first()
    if existing:
        raise TransactionError("Transaction already exists for this offer", status_code=409)

    if quantity <= 0:
        raise TransactionError("Quantity must be positive", status_code=400)
    if agreed_price <= 0:
        raise TransactionError("Agreed price must be positive", status_code=400)
    if total_amount != quantity * agreed_price:
        raise TransactionError("Total amount must equal quantity * agreed_price", status_code=400)

    transaction = Transaction(
        offer_id=offer_id,
        lot_id=offer.lot_id,
        buyer_id=offer.buyer_id,
        farmer_id=offer.farmer_id,
        quantity=quantity,
        agreed_price=agreed_price,
        total_amount=total_amount,
        status=TransactionStatus.accepted,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    record_audit(
        db,
        action="transaction.created",
        entity_type="transaction",
        entity_id=transaction.id,
        actor_user_id=actor_user_id,
        details=f"offer_id={offer_id} amount={total_amount}",
    )
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction_status(
    db: Session,
    transaction_id: int,
    next_status: TransactionStatus,
    actor_user_id: Optional[int] = None,
) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise TransactionError("Transaction not found", status_code=404)

    _assert_valid_transition(transaction.status, next_status)

    previous_status = transaction.status
    transaction.status = next_status
    if next_status == TransactionStatus.confirmed:
        transaction.confirmed_at = datetime.utcnow()
    if next_status == TransactionStatus.completed:
        transaction.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(transaction)

    if next_status == TransactionStatus.delivered:
        existing_payment = db.query(Payment).filter(Payment.transaction_id == transaction.id).first()
        if existing_payment is None:
            payment = Payment(
                transaction_id=transaction.id,
                amount=transaction.total_amount,
                status="pending",
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)
            record_audit(
                db,
                action="payment.created",
                entity_type="payment",
                entity_id=payment.id,
                actor_user_id=actor_user_id,
                details=f"transaction_id={transaction.id} amount={transaction.total_amount}",
            )
            db.commit()

    record_audit(
        db,
        action="transaction.status.updated",
        entity_type="transaction",
        entity_id=transaction.id,
        actor_user_id=actor_user_id,
        details=f"status {previous_status.value} -> {next_status.value}",
    )
    db.commit()
    db.refresh(transaction)
    return transaction


def create_shipment(
    db: Session,
    transaction_id: int,
    pickup_location: str,
    delivery_location: str,
    transporter_name: Optional[str] = None,
    vehicle_number: Optional[str] = None,
    estimated_pickup: Optional[datetime] = None,
    estimated_delivery: Optional[datetime] = None,
    actor_user_id: Optional[int] = None,
) -> Shipment:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise TransactionError("Transaction not found", status_code=404)

    existing = db.query(Shipment).filter(Shipment.transaction_id == transaction_id).first()
    if existing:
        raise TransactionError("Shipment already exists for this transaction", status_code=409)

    shipment = Shipment(
        transaction_id=transaction_id,
        pickup_location=pickup_location,
        delivery_location=delivery_location,
        transporter_name=transporter_name,
        vehicle_number=vehicle_number,
        estimated_pickup=estimated_pickup,
        estimated_delivery=estimated_delivery,
        status="pending",
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)

    record_audit(
        db,
        action="shipment.created",
        entity_type="shipment",
        entity_id=shipment.id,
        actor_user_id=actor_user_id,
        details=f"transaction_id={transaction_id}",
    )
    db.commit()
    db.refresh(shipment)
    return shipment


def update_shipment_status(
    db: Session,
    shipment_id: int,
    status: str,
    actual_pickup: Optional[datetime] = None,
    actual_delivery: Optional[datetime] = None,
    actor_user_id: Optional[int] = None,
) -> Shipment:
    shipment = db.get(Shipment, shipment_id)
    if shipment is None:
        raise TransactionError("Shipment not found", status_code=404)

    previous_status = shipment.status
    shipment.status = status
    if actual_pickup is not None:
        shipment.actual_pickup = actual_pickup
    if actual_delivery is not None:
        shipment.actual_delivery = actual_delivery

    db.commit()
    db.refresh(shipment)

    record_audit(
        db,
        action="shipment.status.updated",
        entity_type="shipment",
        entity_id=shipment.id,
        actor_user_id=actor_user_id,
        details=f"status {previous_status} -> {status}",
    )
    db.commit()
    db.refresh(shipment)
    return shipment


def create_payment(
    db: Session,
    transaction_id: int,
    amount: float,
    payment_method: Optional[str] = None,
    reference: Optional[str] = None,
    actor_user_id: Optional[int] = None,
) -> Payment:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise TransactionError("Transaction not found", status_code=404)

    existing = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
    if existing:
        raise TransactionError("Payment already exists for this transaction", status_code=409)

    if amount <= 0:
        raise TransactionError("Payment amount must be positive", status_code=400)

    payment = Payment(
        transaction_id=transaction_id,
        amount=amount,
        payment_method=payment_method,
        status="pending",
        reference=reference,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    record_audit(
        db,
        action="payment.created",
        entity_type="payment",
        entity_id=payment.id,
        actor_user_id=actor_user_id,
        details=f"transaction_id={transaction_id} amount={amount}",
    )
    db.commit()
    db.refresh(payment)
    return payment


def update_payment_status(
    db: Session,
    payment_id: int,
    status: str,
    reference: Optional[str] = None,
    confirmed_at: Optional[datetime] = None,
    actor_user_id: Optional[int] = None,
) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise TransactionError("Payment not found", status_code=404)

    previous_status = payment.status
    payment.status = status
    if reference is not None:
        payment.reference = reference
    if confirmed_at is not None:
        payment.confirmed_at = confirmed_at
    if status == "initiated" and payment.initiated_at is None:
        payment.initiated_at = datetime.utcnow()
    if status == "confirmed":
        payment.confirmed_at = confirmed_at or datetime.utcnow()

    db.commit()
    db.refresh(payment)

    record_audit(
        db,
        action="payment.status.updated",
        entity_type="payment",
        entity_id=payment.id,
        actor_user_id=actor_user_id,
        details=f"status {previous_status} -> {status}",
    )
    db.commit()
    db.refresh(payment)
    return payment


def reconcile_missing_payments(db: Session, actor_user_id: Optional[int] = None) -> list[Payment]:
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.status.in_(
                [TransactionStatus.delivered, TransactionStatus.payment_pending, TransactionStatus.completed]
            )
        )
        .all()
    )
    created = []
    for transaction in transactions:
        existing = db.query(Payment).filter(Payment.transaction_id == transaction.id).first()
        if existing is None:
            payment = Payment(
                transaction_id=transaction.id,
                amount=transaction.total_amount,
                status="pending",
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)
            record_audit(
                db,
                action="payment.created",
                entity_type="payment",
                entity_id=payment.id,
                actor_user_id=actor_user_id,
                details=f"transaction_id={transaction.id} amount={transaction.total_amount}",
            )
            db.commit()
            created.append(payment)
    return created

