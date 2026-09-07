from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DemandStatus


class DemandCreate(BaseModel):
    commodity_id: int
    required_quantity: float = Field(..., gt=0)
    unit: str = "kg"
    minimum_grade: Optional[str] = None
    delivery_location: Optional[str] = None
    required_by: Optional[date] = None
    notes: Optional[str] = None


class DemandUpdate(BaseModel):
    required_quantity: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = None
    minimum_grade: Optional[str] = None
    delivery_location: Optional[str] = None
    required_by: Optional[date] = None
    status: Optional[DemandStatus] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DemandResponse(BaseModel):
    id: int
    buyer_id: int
    commodity_id: int
    required_quantity: float
    unit: str
    minimum_grade: Optional[str] = None
    delivery_location: Optional[str] = None
    required_by: Optional[date] = None
    status: DemandStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DemandListResponse(BaseModel):
    items: List[DemandResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
