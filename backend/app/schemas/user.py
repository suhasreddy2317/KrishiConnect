from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    role: str = "farmer"
    is_active: bool = True


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
