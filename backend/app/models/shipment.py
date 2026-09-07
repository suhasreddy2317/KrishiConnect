from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.db.session import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False, unique=True, index=True)
    pickup_location = Column(String(200), nullable=False)
    delivery_location = Column(String(200), nullable=False)
    transporter_name = Column(String(120), nullable=True)
    vehicle_number = Column(String(40), nullable=True)
    estimated_pickup = Column(DateTime, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_pickup = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    status = Column(String(30), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
