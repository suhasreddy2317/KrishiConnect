from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import TransactionStatus


class TransactionBase(BaseModel):
    offer_id: int
    lot_id: int
    buyer_id: int
    farmer_id: int
    quantity: float
    agreed_price: float
    total_amount: float
    status: TransactionStatus = TransactionStatus.accepted


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None


class TransactionResponse(TransactionBase):
    id: int
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
