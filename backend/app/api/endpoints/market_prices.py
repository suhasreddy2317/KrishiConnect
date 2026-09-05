from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.services.price_intelligence import get_price_history
from app.utils.dependencies import require_roles

router = APIRouter()


@router.get("/history")
def get_market_price_history(
    commodity_id: int,
    market_id: int,
    days: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.farmer,
        UserRole.fpo_manager,
        UserRole.buyer,
        UserRole.field_agent,
        UserRole.admin,
    )),
):
    if days < 1 or days > 90:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days must be between 1 and 90.",
        )

    history = get_price_history(db, commodity_id, market_id, days)
    return {
        "commodity_id": commodity_id,
        "market_id": market_id,
        "days": days,
        "count": len(history),
        "history": history,
    }
