from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.shipment import Shipment
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from app.services.transactions import TransactionError, create_shipment, update_shipment_status
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _user_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _shipments_visible_to(db: Session, current_user: User):
    query = db.query(Shipment).join(Transaction)
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer:
            return query.filter(Shipment.id == -1)
        query = query.filter(Transaction.buyer_id == buyer.id)
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer:
            return query.filter(Shipment.id == -1)
        query = query.filter(Transaction.farmer_id == farmer.id)
    return query


def _assert_shipment_visible(db: Session, shipment: Shipment, current_user: User) -> None:
    if current_user.role in (UserRole.fpo_manager, UserRole.field_agent, UserRole.admin):
        return
    transaction = db.get(Transaction, shipment.transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer or transaction.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this shipment")
    elif current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer or transaction.farmer_id != farmer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this shipment")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this shipment")


@router.post("/", response_model=ShipmentResponse, status_code=201)
def create_shipment_endpoint(
    payload: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    try:
        shipment = create_shipment(
            db,
            transaction_id=payload.transaction_id,
            pickup_location=payload.pickup_location,
            delivery_location=payload.delivery_location,
            transporter_name=payload.transporter_name,
            vehicle_number=payload.vehicle_number,
            estimated_pickup=payload.estimated_pickup,
            estimated_delivery=payload.estimated_delivery,
            actor_user_id=current_user.id,
        )
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return shipment


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    _assert_shipment_visible(db, shipment, current_user)
    return shipment


@router.patch("/{shipment_id}/status", response_model=ShipmentResponse)
def update_shipment_status_endpoint(
    shipment_id: int,
    payload: ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    _assert_shipment_visible(db, shipment, current_user)
    if payload.status is None:
        raise HTTPException(status_code=400, detail="status is required")
    try:
        shipment = update_shipment_status(
            db,
            shipment_id=shipment_id,
            status=payload.status,
            actual_pickup=payload.actual_pickup,
            actual_delivery=payload.actual_delivery,
            actor_user_id=current_user.id,
        )
    except TransactionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return shipment
