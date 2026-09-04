from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.schemas.produce_lot import (
    ProduceLotCreate,
    ProduceLotResponse,
)


router = APIRouter()


@router.post("/", response_model=ProduceLotResponse, status_code=201)
def create_lot(
    lot_data: ProduceLotCreate,
    db: Session = Depends(get_db),
):
    farmer = (
        db.query(Farmer)
        .filter(Farmer.id == lot_data.farmer_id)
        .first()
    )

    if not farmer:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found",
        )

    lot = ProduceLot(**lot_data.model_dump())

    db.add(lot)
    db.commit()
    db.refresh(lot)

    return lot


@router.get("/", response_model=list[ProduceLotResponse])
def get_lots(
    db: Session = Depends(get_db),
):
    return db.query(ProduceLot).all()


@router.get("/{lot_id}", response_model=ProduceLotResponse)
def get_lot(
    lot_id: int,
    db: Session = Depends(get_db),
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

    return lot