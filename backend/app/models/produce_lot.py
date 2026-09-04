from datetime import date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from app.db.session import Base


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id"), nullable=True, index=True)
    crop = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")
    quality_grade = Column(String(20), nullable=False)
    moisture_percent = Column(Float, nullable=True)
    harvest_date = Column(Date, nullable=True)
    location = Column(String(200), nullable=True)
    expected_price_per_kg = Column(Float, nullable=True)
    status = Column(String(30), default="available", nullable=False)
