from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class DemandSignalResponse(BaseModel):
    commodity_id: int
    score: float
    demand_quantity: float
    num_demands: int
    num_buyers: int
    urgency: float
    reasons: List[str]
    freshness: str
    limitations: List[str]
    generated_at: str
    location_filter: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DemandRadarResponse(BaseModel):
    signals: List[DemandSignalResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
