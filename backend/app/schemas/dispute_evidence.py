from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DisputeEvidenceBase(BaseModel):
    evidence_type: str
    file_name: str
    file_path: Optional[str] = None
    description: Optional[str] = None


class DisputeEvidenceCreate(DisputeEvidenceBase):
    pass


class DisputeEvidenceResponse(DisputeEvidenceBase):
    id: int
    uploaded_by_user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DisputeEvidenceListResponse(BaseModel):
    items: list[DisputeEvidenceResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
