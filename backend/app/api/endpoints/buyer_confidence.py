from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.buyer import Buyer
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.buyer import BuyerResponse
from app.schemas.buyer_confidence import BuyerConfidenceResponse
from app.services.buyer_confidence import compute_buyer_confidence
from app.utils.dependencies import require_roles, get_current_user

router = APIRouter()


@router.get("/me", response_model=BuyerResponse)
def get_my_buyer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer)),
):
    buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No buyer profile associated with this user",
        )
    return buyer


@router.get("/", response_model=list[BuyerResponse])
def list_buyers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Buyer).all()


@router.get("/{buyer_id}/confidence", response_model=BuyerConfidenceResponse)
def get_buyer_confidence(
    buyer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer,
        UserRole.farmer,
        UserRole.fpo_manager,
        UserRole.field_agent,
        UserRole.admin,
    )),
):
    buyer = db.get(Buyer, buyer_id)
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    # A buyer may only view their own confidence.
    if current_user.role == UserRole.buyer:
        user_buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not user_buyer or user_buyer.id != buyer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this buyer's confidence",
            )

    return compute_buyer_confidence(db, buyer_id)
