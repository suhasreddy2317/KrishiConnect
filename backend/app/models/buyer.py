from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, ForeignKey
from app.db.session import Base
from app.models.enums import BuyerStatus


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    business_name = Column(String(120), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(120), nullable=True)
    business_type = Column(String(80), nullable=True)
    location = Column(String(200), nullable=True)
    status = Column(Enum(BuyerStatus), default=BuyerStatus.unverified, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
