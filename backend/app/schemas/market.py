from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MarketCreate(BaseModel):
    name: str
    location: str | None = None
    region: str | None = None
    state: str | None = None
    is_active: bool = True


class MarketResponse(MarketCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
