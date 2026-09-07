from pydantic import BaseModel, ConfigDict


class VoiceQueryRequest(BaseModel):
    query: str
    language: str = "en"
    lot_id: int | None = None
    commodity_id: int | None = None
    market_id: int | None = None


class VoiceQueryResponse(BaseModel):
    intent: str
    text: str
    data: dict | None = None
    action_hint: str | None = None

    model_config = ConfigDict(from_attributes=True)
