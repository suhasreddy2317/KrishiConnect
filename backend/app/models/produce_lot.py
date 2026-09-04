from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.session import Base


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(Integer, primary_key=True, index=True)

    farmer_id = Column(
        Integer,
        ForeignKey("farmers.id"),
        nullable=False,
        index=True
    )

    crop = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)

    quality_grade = Column(String(20), nullable=False)
    moisture_percent = Column(Float, nullable=True)

    harvest_date = Column(String(20), nullable=True)

    expected_price_per_kg = Column(Float, nullable=True)

    status = Column(
        String(30),
        default="available",
        nullable=False
    )