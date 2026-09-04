from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from app.db.session import Base
from app.models.enums import MembershipStatus


class FPOMember(Base):
    __tablename__ = "fpo_members"

    id = Column(Integer, primary_key=True, index=True)
    fpo_id = Column(Integer, ForeignKey("fpos.id"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    membership_status = Column(Enum(MembershipStatus), default=MembershipStatus.active, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(String(200), nullable=True)
