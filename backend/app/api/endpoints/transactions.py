from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import TransactionStatus, UserRole
from app.models.farmer import Farmer
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
)
from app.services.transactions import TransactionError, create_transaction, update_transaction_status
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _user_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _transactions_visible_to(db: Session, current_user: User):
    query = db.query(Transaction)
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer:
            return query.filter(Transaction.id == -1)
        query = query.filter(Transaction.buyer_id == buyer.id)
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer:
            return query.filter(Transaction.id == -1)
        query = query.filter(Transaction.farmer_id == farmer.id)
    return query


def _assert_transaction_visible(db: Session, transaction: Transaction, current_user: User) -> None:
    if current_user.role in (UserRole.fpo_manager, UserRole.field_agent, UserRole.admin):
        return
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer or transaction.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this transaction")
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer or transaction.farmer_id != farmer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this transaction")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this transaction")


@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction_endpoint(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.farmer, UserRole.admin)),
):
    try:
        transaction = create_transaction(
            db,
            offer_id=payload.offer_id,
            quantity=payload.quantity,
            agreed_price=payload.agreed_price,
            total_amount=payload.total_amount,
            actor_user_id=current_user.id,
        )
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return transaction


@router.get("/", response_model=TransactionListResponse)
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
    skip: int = 0,
    limit: int = 100,
):
    query = _transactions_visible_to(db, current_user).order_by(Transaction.created_at.desc())
    transactions = query.offset(skip).limit(limit).all()
    return TransactionListResponse(items=transactions, total=query.count())


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    _assert_transaction_visible(db, transaction, current_user)
    return transaction


@router.patch("/{transaction_id}/status", response_model=TransactionResponse)
def update_transaction_status_endpoint(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    _assert_transaction_visible(db, transaction, current_user)
    if payload.status is None:
        raise HTTPException(status_code=400, detail="status is required")
    try:
        transaction = update_transaction_status(db, transaction_id, payload.status, actor_user_id=current_user.id)
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return transaction
