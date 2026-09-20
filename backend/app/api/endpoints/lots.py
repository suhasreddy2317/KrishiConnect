from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import LotStatus, UserRole
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.schemas.produce_lot import ProduceLotCreate, ProduceLotResponse
from app.utils.auth import hash_password
from app.utils.dependencies import require_roles, get_current_user

router = APIRouter()


@router.post("/", response_model=ProduceLotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(
    lot_data: ProduceLotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farmer_id = lot_data.farmer_id

    if current_user.role == UserRole.farmer:
        farmer = db.query(Farmer).filter(Farmer.user_id == current_user.id).first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        farmer_id = farmer.id
    elif current_user.role not in (UserRole.fpo_manager, UserRole.admin):
        raise HTTPException(status_code=403, detail="Insufficient permissions to create lots")

    if lot_data.quantity_kg < 50:
        raise HTTPException(status_code=422, detail="Minimum lot quantity is 50 kg.")

    resolved_farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not resolved_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    lot = ProduceLot(
        **lot_data.model_dump(exclude={"farmer_id"}),
        farmer_id=farmer_id,
    )

    if current_user.role == UserRole.farmer:
        lot.status = LotStatus.published.value

    db.add(lot)
    db.commit()
    db.refresh(lot)

    return lot


@router.get("/", response_model=list[ProduceLotResponse])
def get_lots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ProduceLot)
    if current_user.role == UserRole.buyer:
        query = query.filter(ProduceLot.status == LotStatus.published.value)
    elif current_user.role == UserRole.farmer:
        farmer = db.query(Farmer).filter(Farmer.user_id == current_user.id).first()
        if not farmer:
            return []
        query = query.filter(ProduceLot.farmer_id == farmer.id)
    return query.all()


@router.get("/{lot_id}", response_model=ProduceLotResponse)
def get_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lot = (
        db.query(ProduceLot)
        .filter(ProduceLot.id == lot_id)
        .first()
    )

    if not lot:
        raise HTTPException(
            status_code=404,
            detail="Produce lot not found",
        )

    if lot.status == LotStatus.published.value:
        return lot

    if current_user.role in (UserRole.admin, UserRole.fpo_manager, UserRole.field_agent):
        return lot

    farmer = db.query(Farmer).filter(Farmer.user_id == current_user.id).first()
    if farmer and lot.farmer_id == farmer.id:
        return lot

    raise HTTPException(status_code=403, detail="Not authorized to view this lot")
