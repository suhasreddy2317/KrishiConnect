from pydantic import BaseModel, ConfigDict


class ProduceLotCreate(BaseModel):
    farmer_id: int
    crop: str
    quantity_kg: float
    quality_grade: str
    moisture_percent: float | None = None
    harvest_date: str | None = None
    expected_price_per_kg: float | None = None


class ProduceLotResponse(ProduceLotCreate):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)