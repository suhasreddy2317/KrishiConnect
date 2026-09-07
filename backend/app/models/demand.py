from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum, Date
from app.db.session import Base
from app.models.enums import DemandStatus


class Demand(Base):
    __tablename__ = "demands"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id"), nullable=False, index=True)
    required_quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")
    minimum_grade = Column(String(20), nullable=True)
    delivery_location = Column(String(200), nullable=True)
    required_by = Column(Date, nullable=True)
    status = Column(Enum(DemandStatus), default=DemandStatus.active, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=True, onupdate=datetime.utcnow)
