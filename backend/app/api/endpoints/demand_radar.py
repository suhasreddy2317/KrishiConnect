from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.demand_radar import DemandRadarResponse
from app.services.demand_radar import calculate_demand_radar
from app.utils.dependencies import require_roles

router = APIRouter()


@router.get("/", response_model=DemandRadarResponse)
def get_demand_radar(
    commodity_id: Optional[int] = Query(default=None),
    location: Optional[str] = Query(default=None),
    market_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.farmer,
        UserRole.fpo_manager,
        UserRole.buyer,
        UserRole.field_agent,
        UserRole.admin,
    )),
):
    signals = calculate_demand_radar(db, commodity_id, market_id, location)
    return DemandRadarResponse(signals=signals, total=len(signals))
