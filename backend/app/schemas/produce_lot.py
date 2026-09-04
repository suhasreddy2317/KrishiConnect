from datetime import date
from pydantic import BaseModel, ConfigDict


class ProduceLotCreate(BaseModel):
    farmer_id: int
    crop: str
    commodity_id: int | None = None
    quantity_kg: float
    unit: str = "kg"
    quality_grade: str
    moisture_percent: float | None = None
    harvest_date: date | None = None
    location: str | None = None
    expected_price_per_kg: float | None = None


class ProduceLotResponse(ProduceLotCreate):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)
