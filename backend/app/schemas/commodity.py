from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CommodityCreate(BaseModel):
    name: str
    variety: str | None = None
    unit: str = "kg"
    is_perishable: bool = True
    perishability_profile: str | None = None
    grading_parameters: str | None = None
    is_active: bool = True


class CommodityResponse(CommodityCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
