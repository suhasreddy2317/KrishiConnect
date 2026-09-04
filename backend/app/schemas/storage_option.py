from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StorageOptionCreate(BaseModel):
    name: str
    location: str | None = None
    capacity_kg: float | None = None
    commodity_suitability: str | None = None
    cost_per_quintal: float | None = None
    is_available: bool = True


class StorageOptionResponse(StorageOptionCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
