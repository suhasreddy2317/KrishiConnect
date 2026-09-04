from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.db.session import Base


class StorageOption(Base):
    __tablename__ = "storage_options"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    location = Column(String(200), nullable=True)
    capacity_kg = Column(Float, nullable=True)
    commodity_suitability = Column(String(200), nullable=True)
    cost_per_quintal = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
