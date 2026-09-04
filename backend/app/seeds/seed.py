"""Deterministic seed script for KrishiConnect development database.

Usage:
    python -m app.seeds.seed
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.enums import UserRole, BuyerStatus, FPOStatus, MembershipStatus, LotStatus
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


def seed_users(db: Session) -> dict[str, User]:
    users = {
        "farmer_1": User(name="Ramesh Patil", phone="+919876543210", role=UserRole.farmer, is_active=True),
        "fpo_manager_1": User(name="Sunita Jadhav", phone="+919876543211", role=UserRole.fpo_manager, is_active=True),
        "buyer_1": User(name="Anand Kumar", phone="+919876543212", role=UserRole.buyer, is_active=True),
        "field_agent_1": User(name="Priya Deshmukh", phone="+919876543213", role=UserRole.field_agent, is_active=True),
        "admin_1": User(name="Admin User", phone="+919876543214", role=UserRole.admin, is_active=True),
    }
    db.add_all(list(users.values()))
    db.flush()
    return users


def seed_farmers(db: Session, users: dict[str, User]) -> dict[str, Farmer]:
    farmers = {
        "farmer_1": Farmer(user_id=users["farmer_1"].id, name="Ramesh Patil", phone="+919876543210", village="Nashik", district="Nashik", state="Maharashtra", latitude=19.9975, longitude=73.7898),
        "farmer_2": Farmer(user_id=None, name="Arun Kulkarni", phone="+919876543220", village="Solapur", district="Solapur", state="Maharashtra", latitude=17.6599, longitude=75.9064),
        "farmer_3": Farmer(user_id=None, name="Vijay Pawar", phone="+919876543230", village="Pune", district="Pune", state="Maharashtra", latitude=18.5204, longitude=73.8567),
    }
    db.add_all(list(farmers.values()))
    db.flush()
    return farmers


def seed_fpos(db: Session) -> dict[str, FPO]:
    fpos = {
        "fpo_1": FPO(name="Krishi Mitra FPO", registration_number="MH-FPO-0001", district="Nashik", state="Maharashtra", collection_center="Nashik APMC", status=FPOStatus.active),
    }
    db.add_all(list(fpos.values()))
    db.flush()
    return fpos


def seed_fpo_members(db: Session, fpos: dict[str, FPO], farmers: dict[str, Farmer]) -> None:
    members = [
        FPOMember(fpo_id=fpos["fpo_1"].id, farmer_id=farmers["farmer_1"].id, membership_status=MembershipStatus.active),
        FPOMember(fpo_id=fpos["fpo_1"].id, farmer_id=farmers["farmer_2"].id, membership_status=MembershipStatus.active),
        FPOMember(fpo_id=fpos["fpo_1"].id, farmer_id=farmers["farmer_3"].id, membership_status=MembershipStatus.pending),
    ]
    db.add_all(members)
    db.flush()


def seed_buyers(db: Session, users: dict[str, User]) -> dict[str, Buyer]:
    buyers = {
        "buyer_1": Buyer(user_id=users["buyer_1"].id, business_name="Anand Agro Foods", contact_person="Anand Kumar", phone="+919876543212", email="anand@example.com", business_type="Processor", location="Nashik", status=BuyerStatus.verified),
    }
    db.add_all(list(buyers.values()))
    db.flush()
    return buyers


def seed_commodities(db: Session) -> dict[str, Commodity]:
    commodities = {
        "onion": Commodity(name="Red Onion", variety="Local", unit="kg", is_perishable=True, perishability_profile="2-3 weeks at cool dry storage", grading_parameters="Size, colour, sprouting"),
        "soybean": Commodity(name="Soybean", variety="Yellow", unit="kg", is_perishable=False, perishability_profile="6+ months dry storage", grading_parameters="Moisture, foreign matter"),
        "wheat": Commodity(name="Wheat", variety="Sharbati", unit="kg", is_perishable=False, perishability_profile="12+ months dry storage", grading_parameters="Protein, moisture, broken grains"),
        "tomato": Commodity(name="Tomato", variety="Hybrid", unit="kg", is_perishable=True, perishability_profile="7-10 days refrigerated", grading_parameters="Size, colour, firmness"),
    }
    db.add_all(list(commodities.values()))
    db.flush()
    return commodities


def seed_markets(db: Session) -> dict[str, Market]:
    markets = {
        "lasalgaon": Market(name="Lasalgaon APMC", location="Lasalgaon", region="North Maharashtra", state="Maharashtra", is_active=True),
        "pune": Market(name="Pune APMC", location="Pune", region="Western Maharashtra", state="Maharashtra", is_active=True),
        "solapur": Market(name="Solapur APMC", location="Solapur", region="South Maharashtra", state="Maharashtra", is_active=True),
        "ahmednagar": Market(name="Ahmednagar APMC", location="Ahmednagar", region="Western Maharashtra", state="Maharashtra", is_active=True),
    }
    db.add_all(list(markets.values()))
    db.flush()
    return markets


def seed_market_prices(db: Session, markets: dict[str, Market], commodities: dict[str, Commodity]) -> None:
    today = date.today()
    prices = []
    for market_key, market in markets.items():
        for commodity_key, commodity in commodities.items():
            base_price = 1500 + (hash(market_key + commodity_key) % 3000)
            for days_ago in range(0, 5):
                d = today - timedelta(days=days_ago)
                variation = (days_ago * 25) + (hash(f"{market_key}-{commodity_key}-{d}") % 100)
                prices.append(MarketPrice(
                    market_id=market.id,
                    commodity_id=commodity.id,
                    price_date=d,
                    min_price=float(base_price + variation),
                    max_price=float(base_price + variation + 200),
                    modal_price=float(base_price + variation + 100),
                    arrival_volume=float(50 + (hash(f"vol-{market_key}-{commodity_key}-{d}") % 200)),
                    source="seeded_demo",
                ))
    db.add_all(prices)
    db.flush()


def seed_storage_options(db: Session) -> None:
    options = [
        StorageOption(name="Nashik Cold Storage", location="Nashik", capacity_kg=50000, commodity_suitability="Red Onion, Tomato", cost_per_quintal=120, is_available=True),
        StorageOption(name="Pune Warehouse", location="Pune", capacity_kg=80000, commodity_suitability="Soybean, Wheat", cost_per_quintal=90, is_available=True),
        StorageOption(name="Solapur Godown", location="Solapur", capacity_kg=40000, commodity_suitability="Onion, Turmeric", cost_per_quintal=100, is_available=False),
    ]
    db.add_all(options)
    db.flush()


def seed_lots(db: Session, farmers: dict[str, Farmer], commodities: dict[str, Commodity]) -> None:
    lots = [
        ProduceLot(farmer_id=farmers["farmer_1"].id, commodity_id=commodities["onion"].id, crop="Red Onion", quantity_kg=4000, unit="kg", quality_grade="Grade A", moisture_percent=12.5, harvest_date=date(2026, 8, 28), location="Nashik", expected_price_per_kg=28.0, status=LotStatus.published),
        ProduceLot(farmer_id=farmers["farmer_2"].id, commodity_id=commodities["soybean"].id, crop="Soybean", quantity_kg=6000, unit="kg", quality_grade="Grade B", moisture_percent=11.0, harvest_date=date(2026, 9, 1), location="Solapur", expected_price_per_kg=45.0, status=LotStatus.published),
        ProduceLot(farmer_id=farmers["farmer_3"].id, commodity_id=commodities["tomato"].id, crop="Tomato", quantity_kg=2500, unit="kg", quality_grade="Grade A", moisture_percent=14.0, harvest_date=date(2026, 9, 2), location="Pune", expected_price_per_kg=22.0, status=LotStatus.matched),
        ProduceLot(farmer_id=farmers["farmer_1"].id, commodity_id=commodities["wheat"].id, crop="Wheat", quantity_kg=8000, unit="kg", quality_grade="Grade A", moisture_percent=10.5, harvest_date=date(2026, 8, 15), location="Nashik", expected_price_per_kg=24.0, status=LotStatus.sold),
    ]
    db.add_all(lots)
    db.flush()


def run() -> None:
    db = SessionLocal()
    try:
        users = seed_users(db)
        farmers = seed_farmers(db, users)
        fpos = seed_fpos(db)
        seed_fpo_members(db, fpos, farmers)
        buyers = seed_buyers(db, users)
        commodities = seed_commodities(db)
        markets = seed_markets(db)
        seed_market_prices(db, markets, commodities)
        seed_storage_options(db)
        seed_lots(db, farmers, commodities)
        db.commit()
        print("Seed data loaded successfully.")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
