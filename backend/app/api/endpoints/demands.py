from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.buyer import Buyer
from app.models.commodity import Commodity
from app.models.demand import Demand
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.demand import DemandCreate, DemandUpdate, DemandResponse, DemandListResponse
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _get_user_buyer(db: Session, user: User) -> Buyer:
    buyer = db.query(Buyer).filter(Buyer.user_id == user.id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No buyer profile associated with this user; buyer verification is required to create demands.",
        )
    return buyer


@router.post("/", response_model=DemandResponse, status_code=status.HTTP_201_CREATED)
def create_demand(
    demand_data: DemandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer)),
):
    buyer = _get_user_buyer(db, current_user)
    commodity = db.query(Commodity).filter(Commodity.id == demand_data.commodity_id).first()
    if not commodity:
        raise HTTPException(status_code=400, detail="Commodity not found")

    demand = Demand(
        buyer_id=buyer.id,
        commodity_id=demand_data.commodity_id,
        required_quantity=demand_data.required_quantity,
        unit=demand_data.unit,
        minimum_grade=demand_data.minimum_grade,
        delivery_location=demand_data.delivery_location,
        required_by=demand_data.required_by,
        notes=demand_data.notes,
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand


@router.get("/", response_model=DemandListResponse)
def list_demands(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.fpo_manager, UserRole.admin)),
):
    query = db.query(Demand)
    if current_user.role == UserRole.buyer:
        buyer = _get_user_buyer(db, current_user)
        query = query.filter(Demand.buyer_id == buyer.id)
    items = query.all()
    return DemandListResponse(items=items, total=len(items))


@router.get("/{demand_id}", response_model=DemandResponse)
def get_demand(
    demand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.fpo_manager, UserRole.admin)),
):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if current_user.role == UserRole.buyer:
        buyer = _get_user_buyer(db, current_user)
        if demand.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this demand")
    return demand


@router.patch("/{demand_id}", response_model=DemandResponse)
def update_demand(
    demand_id: int,
    demand_data: DemandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.buyer, UserRole.fpo_manager, UserRole.admin)),
):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if current_user.role == UserRole.buyer:
        buyer = _get_user_buyer(db, current_user)
        if demand.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this demand")
    update = demand_data.model_dump(exclude_unset=True)
    for field, value in update.items():
        setattr(demand, field, value)
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand
