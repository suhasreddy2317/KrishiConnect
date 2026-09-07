from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PaymentBase(BaseModel):
    transaction_id: int
    amount: float
    payment_method: Optional[str] = None
    status: str = "pending"
    reference: Optional[str] = None
    initiated_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    reference: Optional[str] = None
    confirmed_at: Optional[datetime] = None


class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
