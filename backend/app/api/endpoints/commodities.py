from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.commodity import Commodity
from app.schemas.commodity import CommodityResponse
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[CommodityResponse])
def list_commodities(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return db.query(Commodity).all()
