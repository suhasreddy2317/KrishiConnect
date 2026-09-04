from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BuyerCreate(BaseModel):
    business_name: str
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    business_type: str | None = None
    location: str | None = None
    status: str = "unverified"


class BuyerResponse(BuyerCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
