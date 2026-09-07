from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.payment import Payment
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentListResponse, PaymentUpdate, PaymentResponse
from app.services.transactions import TransactionError, create_payment, update_payment_status
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _user_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _payments_visible_to(db: Session, current_user: User):
    query = db.query(Payment).join(Transaction)
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer:
            return query.filter(Payment.id == -1)
        query = query.filter(Transaction.buyer_id == buyer.id)
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer:
            return query.filter(Payment.id == -1)
        query = query.filter(Transaction.farmer_id == farmer.id)
    return query


def _assert_payment_visible(db: Session, payment: Payment, current_user: User) -> None:
    if current_user.role in (UserRole.fpo_manager, UserRole.field_agent, UserRole.admin):
        return
    transaction = db.get(Transaction, payment.transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer or transaction.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer or transaction.farmer_id != farmer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")


@router.get("/", response_model=PaymentListResponse)
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
    skip: int = 0,
    limit: int = 100,
):
    query = _payments_visible_to(db, current_user).order_by(Payment.created_at.desc())
    payments = query.offset(skip).limit(limit).all()
    return PaymentListResponse(items=payments, total=query.count())


@router.post("/", response_model=PaymentResponse, status_code=201)
def create_payment_endpoint(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    try:
        payment = create_payment(
            db,
            transaction_id=payload.transaction_id,
            amount=payload.amount,
            payment_method=payload.payment_method,
            reference=payload.reference,
            actor_user_id=current_user.id,
        )
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    _assert_payment_visible(db, payment, current_user)
    return payment


@router.patch("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status_endpoint(
    payment_id: int,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    _assert_payment_visible(db, payment, current_user)
    if payload.status is None:
        raise HTTPException(status_code=400, detail="status is required")
    try:
        payment = update_payment_status(
            db,
            payment_id=payment_id,
            status=payload.status,
            reference=payload.reference,
            confirmed_at=payload.confirmed_at,
            actor_user_id=current_user.id,
        )
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return payment
