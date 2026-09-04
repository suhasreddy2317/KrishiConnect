from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from app.db.session import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id"), nullable=False, index=True)
    price_date = Column(Date, nullable=False, index=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    arrival_volume = Column(Float, nullable=True)
    source = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
