from pydantic import BaseModel, ConfigDict


class FarmerCreate(BaseModel):
    name: str
    phone: str
    village: str | None = None
    district: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class FarmerResponse(FarmerCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)