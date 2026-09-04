from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(120), nullable=True, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.farmer)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    farmer = relationship("Farmer", back_populates="user", uselist=False)
