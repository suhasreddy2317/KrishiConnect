from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from app.db.session import Base


class TimestampMixin:
    """Reusable mixin providing created_at and updated_at timestamps for future models."""
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

