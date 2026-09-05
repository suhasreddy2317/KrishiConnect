from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserLogin(BaseModel):
    identifier: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserMeResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
