from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OfferStatus


class OfferBase(BaseModel):
    quantity: float = Field(..., gt=0)
    offered_price: float = Field(..., gt=0)
    pickup_window: str = Field(..., min_length=1, max_length=200)
    payment_terms: str = Field(..., min_length=1, max_length=200)
    message: Optional[str] = None


class OfferCreate(OfferBase):
    demand_id: int
    lot_id: int


class CounterOfferRequest(OfferBase):
    pass


class RejectRequest(BaseModel):
    reason: Optional[str] = None


class OfferResponse(BaseModel):
    id: int
    demand_id: int
    lot_id: int
    buyer_id: int
    farmer_id: int
    quantity: float
    offered_price: float
    pickup_window: str
    payment_terms: str
    message: Optional[str] = None
    status: OfferStatus
    parent_offer_id: Optional[int] = None
    round: int
    expires_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OfferHistoryEntryResponse(BaseModel):
    id: int
    offer_id: int
    actor_user_id: int
    action: str
    from_status: Optional[OfferStatus] = None
    to_status: Optional[OfferStatus] = None
    quantity: Optional[float] = None
    offered_price: Optional[float] = None
    pickup_window: Optional[str] = None
    payment_terms: Optional[str] = None
    message: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OfferHistoryResponse(BaseModel):
    items: List[OfferHistoryEntryResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)


class OfferListResponse(BaseModel):
    items: List[OfferResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
