from datetime import date
from typing import List

from pydantic import BaseModel, ConfigDict


class ConfidenceFactor(BaseModel):
    name: str
    contribution: float
    weight: int
    detail: str

    model_config = ConfigDict(from_attributes=True)


class BuyerConfidenceResponse(BaseModel):
    buyer_id: int
    business_name: str
    status: str
    score: float
    confidence_level: str
    factors: List[ConfidenceFactor]
    top_reasons: List[str]
    limitations: List[str]
    generated_at: str

    model_config = ConfigDict(from_attributes=True)
