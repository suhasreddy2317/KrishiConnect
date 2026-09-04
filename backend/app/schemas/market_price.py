from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class MarketPriceCreate(BaseModel):
    market_id: int
    commodity_id: int
    price_date: date
    min_price: float | None = None
    max_price: float | None = None
    modal_price: float | None = None
    arrival_volume: float | None = None
    source: str | None = None


class MarketPriceResponse(MarketPriceCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
