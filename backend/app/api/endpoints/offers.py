from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.buyer import Buyer
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.offer import Offer
from app.models.user import User
from app.schemas.offer import (
    OfferCreate,
    OfferResponse,
    OfferListResponse,
    CounterOfferRequest,
    RejectRequest,
    OfferHistoryResponse,
    OfferHistoryEntryResponse,
)
from app.services.offers import OfferError, create_offer, counter_offer, accept_offer, reject_offer, get_offer_history
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _user_buyer(db: Session, user: User) -> Buyer | None:
    return db.query(Buyer).filter(Buyer.user_id == user.id).first()


def _user_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _offers_visible_to(db: Session, current_user: User):
    query = db.query(Offer)
    if current_user.role == UserRole.buyer:
        buyer = _user_buyer(db, current_user)
        if not buyer:
            return query.filter(Offer.id == -1)  # no buyer profile -> empty
        query = query.filter(Offer.buyer_id == buyer.id)
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer:
            return query.filter(Offer.id == -1)
        query = query.filter(Offer.farmer_id == farmer.id)
    # fpo_manager, field_agent, admin: full visibility
    return query


def _assert_offer_visible(db: Session, offer: Offer, current_user: User) -> None:
    if current_user.role in (UserRole.fpo_manager, UserRole.field_agent, UserRole.admin):
        return
    if current_user.role == UserRole.buyer:
        buyer = _user_buyer(db, current_user)
        if not buyer or offer.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this offer")
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer or offer.farmer_id != farmer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this offer")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this offer")


@router.post("/", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer_endpoint(
    payload: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer)),
):
    try:
        offer = create_offer(
            db,
            demand_id=payload.demand_id,
            lot_id=payload.lot_id,
            quantity=payload.quantity,
            offered_price=payload.offered_price,
            pickup_window=payload.pickup_window,
            payment_terms=payload.payment_terms,
            message=payload.message,
            buyer_user_id=current_user.id,
        )
    except OfferError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return offer


@router.get("/", response_model=OfferListResponse)
def list_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
    skip: int = 0,
    limit: int = 100,
):
    query = _offers_visible_to(db, current_user).order_by(Offer.created_at.desc())
    offers = query.offset(skip).limit(limit).all()
    return OfferListResponse(items=offers, total=query.count())


@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    _assert_offer_visible(db, offer, current_user)
    return offer


@router.post("/{offer_id}/counter", response_model=OfferResponse)
def post_counter(
    offer_id: int,
    payload: CounterOfferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.farmer, UserRole.admin)),
):
    try:
        return counter_offer(
            db,
            offer_id=offer_id,
            quantity=payload.quantity,
            offered_price=payload.offered_price,
            pickup_window=payload.pickup_window,
            payment_terms=payload.payment_terms,
            message=payload.message,
            actor_user_id=current_user.id,
            actor_role=current_user.role,
        )
    except OfferError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.post("/{offer_id}/accept", response_model=OfferResponse)
def post_accept(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.farmer, UserRole.admin)),
):
    try:
        return accept_offer(db, offer_id=offer_id, actor_user_id=current_user.id, actor_role=current_user.role)
    except OfferError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.post("/{offer_id}/reject", response_model=OfferResponse)
def post_reject(
    offer_id: int,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.farmer, UserRole.admin)),
):
    try:
        return reject_offer(
            db,
            offer_id=offer_id,
            actor_user_id=current_user.id,
            actor_role=current_user.role,
            reason=payload.reason,
        )
    except OfferError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.get("/{offer_id}/history", response_model=OfferHistoryResponse)
def get_offer_history_endpoint(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    _assert_offer_visible(db, offer, current_user)
    history = get_offer_history(db, offer_id)
    return OfferHistoryResponse(
        items=[OfferHistoryEntryResponse.model_validate(h) for h in history],
        total=len(history),
    )
