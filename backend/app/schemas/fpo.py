from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FPOCreate(BaseModel):
    name: str
    registration_number: str | None = None
    district: str | None = None
    state: str | None = None
    collection_center: str | None = None
    status: str = "active"


class FPOResponse(FPOCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
