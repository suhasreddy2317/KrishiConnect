from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import DisputeStatus


class DisputeBase(BaseModel):
    transaction_id: int
    reason: str
    description: Optional[str] = None
    priority: str = "medium"


class DisputeCreate(DisputeBase):
    pass


class DisputeUpdate(BaseModel):
    status: Optional[DisputeStatus] = None
    resolution_notes: Optional[str] = None


class DisputeResponse(DisputeBase):
    id: int
    opened_by_user_id: int
    status: DisputeStatus
    resolution_notes: Optional[str] = None
    resolved_by_user_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DisputeListResponse(BaseModel):
    items: list[DisputeResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
