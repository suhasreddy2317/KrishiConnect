from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.farmer import Farmer
from app.schemas.farmer import FarmerCreate, FarmerResponse


router = APIRouter()


@router.post("/", response_model=FarmerResponse, status_code=201)
def create_farmer(
    farmer_data: FarmerCreate,
    db: Session = Depends(get_db),
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
):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()

    if not farmer:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found",
        )

    return farmer