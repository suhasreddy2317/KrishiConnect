from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.market import Market
from app.schemas.market import MarketResponse
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[MarketResponse])
def list_markets(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return db.query(Market).order_by(Market.name.asc()).all()
