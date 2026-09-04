from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FPOMemberCreate(BaseModel):
    fpo_id: int
    farmer_id: int
    membership_status: str = "active"
    notes: str | None = None


class FPOMemberResponse(FPOMemberCreate):
    id: int
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)
