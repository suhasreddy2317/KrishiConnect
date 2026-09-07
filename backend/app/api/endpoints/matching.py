from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.buyer import Buyer
from app.models.demand import Demand
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.schemas.matching import MatchListResponse
from app.services.lot_matching import find_lots_for_demand, find_matches_for_lot
from app.utils.dependencies import require_roles

router = APIRouter()


@router.get("/lots/{lot_id}", response_model=MatchListResponse)
def get_matches_for_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.farmer, UserRole.fpo_manager, UserRole.admin)),
):
    lot = db.get(ProduceLot, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    # Farmers may only view matches for their own lots.
    if current_user.role == UserRole.farmer:
        farmer = db.query(Farmer).filter(Farmer.id == lot.farmer_id).first()
        if not farmer or farmer.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view matches for this lot",
            )

    matches = find_matches_for_lot(db, lot_id)
    if matches is None:
        raise HTTPException(status_code=404, detail="Lot not found")
    return MatchListResponse(items=matches, total=len(matches))


@router.get("/demands/{demand_id}", response_model=MatchListResponse)
def get_lots_for_demand(
    demand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.fpo_manager, UserRole.admin)),
):
    demand = db.get(Demand, demand_id)
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")

    # A buyer may only view matches for their own demand.
    if current_user.role == UserRole.buyer:
        user_buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not user_buyer or user_buyer.id != demand.buyer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view matches for this demand",
            )

    matches = find_lots_for_demand(db, demand_id)
    if matches is None:
        raise HTTPException(status_code=404, detail="Demand not found")
    return MatchListResponse(items=matches, total=len(matches))
