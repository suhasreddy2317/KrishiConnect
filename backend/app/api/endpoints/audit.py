from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse, AuditLogListResponse
from app.services.audit import record_audit
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


@router.get("/", response_model=AuditLogListResponse)
def list_audit_logs(
    entity_type: str | None = None,
    entity_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    query = db.query(AuditLog)
    if entity_type is not None:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id is not None:
        query = query.filter(AuditLog.entity_id == entity_id)
    logs = query.order_by(AuditLog.created_at.desc()).limit(500).all()
    items = [AuditLogResponse.model_validate(log) for log in logs]
    return AuditLogListResponse(items=items, total=len(items))
