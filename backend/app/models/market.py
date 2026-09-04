from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base


class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    location = Column(String(200), nullable=True)
    region = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
