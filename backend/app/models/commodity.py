from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.db.session import Base


class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    variety = Column(String(100), nullable=True)
    unit = Column(String(20), nullable=False, default="kg")
    is_perishable = Column(Boolean, default=True, nullable=False)
    perishability_profile = Column(String(200), nullable=True)
    grading_parameters = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
