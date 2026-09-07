"""Append-only audit logging service."""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditError(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


def record_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: int,
    actor_user_id: Optional[int] = None,
    details: Optional[str] = None,
) -> AuditLog:
    audit = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit
