from datetime import date
from pydantic import BaseModel, ConfigDict


class FactorResponse(BaseModel):
    name: str
    contribution: float
    weight: int
    detail: str


class SaleWindowResponse(BaseModel):
    commodity_id: int
    commodity_name: str
    market_id: int
    market_name: str | None
    score: float
    verdict: str
    reasons: list[str]
    factors: list[FactorResponse]
    freshness: str
    generated_at: str
    limitations: list[str]
    algorithm: dict

    model_config = ConfigDict(from_attributes=True)
