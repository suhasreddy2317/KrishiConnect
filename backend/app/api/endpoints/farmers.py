from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.farmer import FarmerCreate, FarmerResponse
from app.utils.dependencies import require_roles, get_current_user

router = APIRouter()


@router.post("/", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def create_farmer(
    farmer_data: FarmerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin)),
):
    existing = (
        db.query(Farmer)
        .filter(Farmer.phone == farmer_data.phone)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Farmer with this phone number already exists",
        )

    farmer = Farmer(**farmer_data.model_dump())

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return farmer


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(
    farmer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()

    if not farmer:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found",
        )

    return farmer
