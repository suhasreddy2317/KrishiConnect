"""Tests for database models, relationships, and core domain entities."""
from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.models.enums import UserRole, LotStatus, BuyerStatus, FPOStatus, MembershipStatus
from app.models.user import User
from app.models.farmer import Farmer
from app.models.fpo import FPO
from app.models.fpo_member import FPOMember
from app.models.buyer import Buyer
from app.models.commodity import Commodity
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.models.produce_lot import ProduceLot
from app.models.storage_option import StorageOption
from app.utils.auth import hash_password


def test_database_connection(db: Session):
    from sqlalchemy import text
    result = db.execute(text("SELECT 1")).scalar()
    assert result == 1


def test_user_creation(db: Session):
    user = User(name="Test Farmer", phone="+919000000001", role=UserRole.farmer, is_active=True, password_hash=hash_password("testpassword"))
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.name == "Test Farmer"
    assert user.phone == "+919000000001"
    assert user.role == UserRole.farmer
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None


def test_user_role_representation(db: Session):
    roles = [UserRole.farmer, UserRole.fpo_manager, UserRole.buyer, UserRole.field_agent, UserRole.admin]
    for role in roles:
        user = User(name=f"Test {role.value}", phone=f"+9190000000{roles.index(role) + 1}", role=role, password_hash=hash_password("testpassword"))
        db.add(user)
    db.commit()

    for idx, role in enumerate(roles):
        user = db.query(User).filter(User.role == role).first()
        assert user is not None
        assert user.role == role


def test_farmer_creation(db: Session):
    user = User(name="Farmer User", phone="+919000000010", role=UserRole.farmer, password_hash=hash_password("testpassword"))
    db.add(user)
    db.flush()

    farmer = Farmer(user_id=user.id, name="Ramesh Patil", phone="+919876543210", village="Nashik", district="Nashik", state="Maharashtra", latitude=19.9975, longitude=73.7898)
    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    assert farmer.id is not None
    assert farmer.user_id == user.id
    assert farmer.name == "Ramesh Patil"
    assert farmer.village == "Nashik"


def test_farmer_user_relationship(db: Session):
    user = User(name="Farmer", phone="+919000000011", role=UserRole.farmer, password_hash=hash_password("testpassword"))
    db.add(user)
    db.flush()

    farmer = Farmer(user_id=user.id, name="Farmer One", phone="+919000000011")
    db.add(farmer)
    db.commit()

    loaded_user = db.query(User).filter(User.id == user.id).first()
    assert loaded_user.farmer is not None  # type: ignore[attr-defined]
    assert loaded_user.farmer.name == "Farmer One"  # type: ignore[attr-defined]


def test_fpo_creation(db: Session):
    fpo = FPO(name="Test FPO", registration_number="MH-FPO-0001", district="Nashik", state="Maharashtra", collection_center="Nashik APMC", status=FPOStatus.active)
    db.add(fpo)
    db.commit()
    db.refresh(fpo)

    assert fpo.id is not None
    assert fpo.name == "Test FPO"
    assert fpo.status == FPOStatus.active


def test_fpo_member_relationship(db: Session):
    user = User(name="Member", phone="+919000000020", role=UserRole.farmer, password_hash=hash_password("testpassword"))
    db.add(user)
    db.flush()

    farmer = Farmer(user_id=user.id, name="Member Farmer", phone="+919000000020")
    db.add(farmer)
    db.flush()

    fpo = FPO(name="Test FPO", district="Nashik", state="Maharashtra")
    db.add(fpo)
    db.flush()

    member = FPOMember(fpo_id=fpo.id, farmer_id=farmer.id, membership_status=MembershipStatus.active)
    db.add(member)
    db.commit()

    assert member.id is not None
    assert member.fpo_id == fpo.id
    assert member.farmer_id == farmer.id
    assert member.membership_status == MembershipStatus.active


def test_buyer_creation(db: Session):
    buyer = Buyer(business_name="Test Buyer", contact_person="Test Contact", phone="+919000000030", business_type="Processor", location="Pune", status=BuyerStatus.verified)
    db.add(buyer)
    db.commit()
    db.refresh(buyer)

    assert buyer.id is not None
    assert buyer.business_name == "Test Buyer"
    assert buyer.status == BuyerStatus.verified


def test_commodity_creation(db: Session):
    commodity = Commodity(name="Red Onion", variety="Local", unit="kg", is_perishable=True, grading_parameters="Size, colour, sprouting")
    db.add(commodity)
    db.commit()
    db.refresh(commodity)

    assert commodity.id is not None
    assert commodity.name == "Red Onion"
    assert commodity.is_perishable is True


def test_market_creation(db: Session):
    market = Market(name="Lasalgaon APMC", location="Lasalgaon", region="North Maharashtra", state="Maharashtra", is_active=True)
    db.add(market)
    db.commit()
    db.refresh(market)

    assert market.id is not None
    assert market.name == "Lasalgaon APMC"


def test_market_price_creation(db: Session):
    market = Market(name="Test Market", state="Maharashtra")
    commodity = Commodity(name="Test Commodity", unit="kg")
    db.add_all([market, commodity])
    db.flush()

    price = MarketPrice(market_id=market.id, commodity_id=commodity.id, price_date=date(2026, 9, 4), min_price=100.0, max_price=150.0, modal_price=125.0, arrival_volume=100.0, source="seeded_demo")
    db.add(price)
    db.commit()
    db.refresh(price)

    assert price.id is not None
    assert price.market_id == market.id
    assert price.commodity_id == commodity.id
    assert price.modal_price == 125.0
    assert price.source == "seeded_demo"


def test_lot_creation(db: Session):
    farmer = Farmer(name="Lot Farmer", phone="+919000000040")
    db.add(farmer)
    db.flush()

    commodity = Commodity(name="Wheat", unit="kg")
    db.add(commodity)
    db.flush()

    lot = ProduceLot(farmer_id=farmer.id, commodity_id=commodity.id, crop="Wheat", quantity_kg=5000, unit="kg", quality_grade="Grade A", harvest_date=date(2026, 8, 15), location="Nashik", status=LotStatus.published)
    db.add(lot)
    db.commit()
    db.refresh(lot)

    assert lot.id is not None
    assert lot.farmer_id == farmer.id
    assert lot.commodity_id == commodity.id
    assert lot.crop == "Wheat"
    assert lot.harvest_date == date(2026, 8, 15)
    assert lot.status == LotStatus.published


def test_storage_option_creation(db: Session):
    storage = StorageOption(name="Test Storage", location="Pune", capacity_kg=50000, commodity_suitability="Wheat, Soybean", cost_per_quintal=100, is_available=True)
    db.add(storage)
    db.commit()
    db.refresh(storage)

    assert storage.id is not None
    assert storage.name == "Test Storage"
    assert storage.is_available is True
