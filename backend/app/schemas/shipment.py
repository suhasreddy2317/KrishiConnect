from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ShipmentBase(BaseModel):
    transaction_id: int
    pickup_location: str
    delivery_location: str
    transporter_name: Optional[str] = None
    vehicle_number: Optional[str] = None
    estimated_pickup: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None
    actual_pickup: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    status: str = "pending"


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(BaseModel):
    status: Optional[str] = None
    actual_pickup: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None


class ShipmentResponse(ShipmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
