from typing import List

from pydantic import BaseModel, ConfigDict


class MatchResultResponse(BaseModel):
    demand_id: int
    buyer_id: int
    lot_id: int
    match_score: float
    grade_compatibility: str
    commodity_id: int
    lot_grade: str
    lot_quantity: float
    lot_location: str | None
    quantity_fit: float
    location_fit: float
    urgency: float
    buyer_confidence: float
    reasons: List[str]
    limitations: List[str]

    model_config = ConfigDict(from_attributes=True)


class MatchListResponse(BaseModel):
    items: List[MatchResultResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
