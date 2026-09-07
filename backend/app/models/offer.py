from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from app.db.session import Base
from app.models.enums import OfferStatus


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    demand_id = Column(Integer, ForeignKey("demands.id"), nullable=False, index=True)
    lot_id = Column(Integer, ForeignKey("produce_lots.id"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    offered_price = Column(Float, nullable=False)
    pickup_window = Column(String(200), nullable=False)
    payment_terms = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(Enum(OfferStatus), default=OfferStatus.submitted, nullable=False)
    parent_offer_id = Column(Integer, ForeignKey("offers.id"), nullable=True, index=True)
    round = Column(Integer, default=1, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=True, onupdate=datetime.utcnow)


class OfferHistory(Base):
    """Append-only audit log for every offer lifecycle action."""
    __tablename__ = "offer_histories"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    from_status = Column(Enum(OfferStatus), nullable=True)
    to_status = Column(Enum(OfferStatus), nullable=True)
    quantity = Column(Float, nullable=True)
    offered_price = Column(Float, nullable=True)
    pickup_window = Column(String(200), nullable=True)
    payment_terms = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
