from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Enum, DateTime, ForeignKey
from app.db.session import Base
from app.models.enums import FPOStatus


class FPO(Base):
    __tablename__ = "fpos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    registration_number = Column(String(80), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    collection_center = Column(String(200), nullable=True)
    status = Column(Enum(FPOStatus), default=FPOStatus.active, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
