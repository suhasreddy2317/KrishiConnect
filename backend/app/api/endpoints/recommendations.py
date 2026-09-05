from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.recommendation import SaleWindowResponse
from app.services.sale_window import calculate_sale_window_score
from app.utils.dependencies import require_roles

router = APIRouter()


@router.get("/sale-window", response_model=SaleWindowResponse)
def get_sale_window_recommendation(
    commodity_id: int,
    market_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.farmer,
        UserRole.fpo_manager,
        UserRole.buyer,
        UserRole.field_agent,
        UserRole.admin,
    )),
):
    result = calculate_sale_window_score(db, commodity_id, market_id)
    if "error" in result and result.get("error"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"],
        )
    return result
