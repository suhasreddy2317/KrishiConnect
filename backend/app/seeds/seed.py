"""Deterministic seed script for KrishiConnect development database.

Usage:
    python -m app.seeds.seed
"""
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.enums import UserRole, BuyerStatus, FPOStatus, MembershipStatus, LotStatus, DemandStatus, OfferStatus, TransactionStatus, DisputeStatus
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
from app.models.demand import Demand
from app.models.offer import Offer, OfferHistory
from app.models.transaction import Transaction
from app.models.shipment import Shipment
from app.models.payment import Payment
from app.models.dispute import Dispute
from app.models.dispute_evidence import DisputeEvidence
from app.utils.auth import hash_password


DEMO_PHONES = {
    "farmer_1": "+919876543210",
    "fpo_manager_1": "+919876543211",
    "buyer_1": "+919876543212",
    "buyer_2": "+919876543215",
    "field_agent_1": "+919876543213",
    "admin_1": "+919876543214",
}


def _delete_existing_seed_data(db: Session) -> None:
    db.execute(__import__('sqlalchemy').text('DELETE FROM dispute_evidences'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM disputes'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM payments'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM shipments'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM transactions'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM offer_histories'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM offers'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM fpo_members'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM market_prices'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM produce_lots'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM demands'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM storage_options'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM markets'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM commodities'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM buyers'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM fpos'))
    db.execute(__import__('sqlalchemy').text('DELETE FROM farmers'))
    for phone in DEMO_PHONES.values():
        db.execute(__import__('sqlalchemy').text('DELETE FROM users WHERE phone = :p'), {'p': phone})
    db.flush()


def seed_users(db: Session) -> dict[str, User]:
    _delete_existing_seed_data(db)

    demo_password = hash_password("demo-password")
    users = {
        "farmer_1": User(name="Ramesh Patil", phone=DEMO_PHONES["farmer_1"], role=UserRole.farmer, is_active=True, password_hash=demo_password),
        "fpo_manager_1": User(name="Sunita Jadhav", phone=DEMO_PHONES["fpo_manager_1"], role=UserRole.fpo_manager, is_active=True, password_hash=demo_password),
        "buyer_1": User(name="Anand Kumar", phone=DEMO_PHONES["buyer_1"], role=UserRole.buyer, is_active=True, password_hash=demo_password),
        "buyer_2": User(name="Neha Traders", phone=DEMO_PHONES["buyer_2"], role=UserRole.buyer, is_active=True, password_hash=demo_password),
        "field_agent_1": User(name="Priya Deshmukh", phone=DEMO_PHONES["field_agent_1"], role=UserRole.field_agent, is_active=True, password_hash=demo_password),
        "admin_1": User(name="Admin User", phone=DEMO_PHONES["admin_1"], role=UserRole.admin, is_active=True, password_hash=demo_password),
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
        "buyer_2": Buyer(user_id=users["buyer_2"].id, business_name="Neha Traders", contact_person="Neha Shah", phone="+919876543215", email="neha@example.com", business_type="Wholesaler", location="Pune", status=BuyerStatus.unverified),
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
            seed_hash = hash(market_key + commodity_key)
            base_price = 1500 + (seed_hash % 3000)

            trend_type = seed_hash % 6
            if trend_type == 0:
                daily_drift = 80.0
            elif trend_type == 1:
                daily_drift = -70.0
            elif trend_type == 2:
                daily_drift = 0.0
            elif trend_type == 3:
                daily_drift = 50.0
            elif trend_type == 4:
                daily_drift = -45.0
            else:
                daily_drift = 0.0

            current_base = base_price
            for days_ago in range(0, 21):
                d = today - timedelta(days=days_ago)
                noise = ((seed_hash * (days_ago + 1)) % 100) - 50
                current_base = base_price + (daily_drift * (21 - days_ago))
                modal = current_base + noise
                min_p = modal - 120
                max_p = modal + 120
                prices.append(MarketPrice(
                    market_id=market.id,
                    commodity_id=commodity.id,
                    price_date=d,
                    min_price=float(max(min_p, 100)),
                    max_price=float(max(max_p, 200)),
                    modal_price=float(max(modal, 100)),
                    arrival_volume=float(80 + (seed_hash % 180) + (days_ago * 2)),
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


def seed_lots(db: Session, farmers: dict[str, Farmer], commodities: dict[str, Commodity]) -> dict[str, ProduceLot]:
    lots = [
        ProduceLot(farmer_id=farmers["farmer_1"].id, commodity_id=commodities["onion"].id, crop="Red Onion", quantity_kg=4000, unit="kg", quality_grade="Grade A", moisture_percent=12.5, harvest_date=date(2026, 8, 28), location="Nashik", expected_price_per_kg=28.0, status=LotStatus.published),
        ProduceLot(farmer_id=farmers["farmer_2"].id, commodity_id=commodities["soybean"].id, crop="Soybean", quantity_kg=6000, unit="kg", quality_grade="Grade B", moisture_percent=11.0, harvest_date=date(2026, 9, 1), location="Solapur", expected_price_per_kg=45.0, status=LotStatus.published),
        ProduceLot(farmer_id=farmers["farmer_3"].id, commodity_id=commodities["tomato"].id, crop="Tomato", quantity_kg=2500, unit="kg", quality_grade="Grade A", moisture_percent=14.0, harvest_date=date(2026, 9, 2), location="Pune", expected_price_per_kg=22.0, status=LotStatus.matched),
        ProduceLot(farmer_id=farmers["farmer_1"].id, commodity_id=commodities["wheat"].id, crop="Wheat", quantity_kg=8000, unit="kg", quality_grade="Grade A", moisture_percent=10.5, harvest_date=date(2026, 8, 15), location="Nashik", expected_price_per_kg=24.0, status=LotStatus.sold),
    ]
    db.add_all(lots)
    db.flush()
    return {"lot_onion": lots[0], "lot_soybean": lots[1], "lot_tomato": lots[2], "lot_wheat": lots[3]}


def seed_demands(db: Session, buyers: dict, commodities: dict) -> dict[str, Demand]:
    today = date.today()
    # Demo demands designed to exercise the Phase 3D.2 matching engine.
    # Eligible published lots (see seed_lots):
    #   lot1 -> onion, Grade A, qty 4000, Nashik
    #   lot2 -> soybean, Grade B, qty 6000, Solapur
    onion_strong = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["onion"].id, required_quantity=4000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=3), status=DemandStatus.active)
    onion_partial = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["onion"].id, required_quantity=9000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=10), status=DemandStatus.active)
    onion_compat = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["onion"].id, required_quantity=4000, unit="kg", minimum_grade="Grade B", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
    soy_incompat = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["soybean"].id, required_quantity=6000, unit="kg", minimum_grade="Grade A", delivery_location="Solapur", required_by=today + timedelta(days=7), status=DemandStatus.active)
    soy_strong = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["soybean"].id, required_quantity=6000, unit="kg", minimum_grade="Grade B", delivery_location="Solapur", required_by=today + timedelta(days=4), status=DemandStatus.active)
    onion_unverified = Demand(buyer_id=buyers["buyer_2"].id, commodity_id=commodities["onion"].id, required_quantity=4000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=2), status=DemandStatus.active)
    tomato_expired = Demand(buyer_id=buyers["buyer_1"].id, commodity_id=commodities["tomato"].id, required_quantity=3000, unit="kg", minimum_grade="Grade A", delivery_location="Pune", required_by=today - timedelta(days=2), status=DemandStatus.expired, notes="Previously matched lot.")
    tomato_demand = Demand(buyer_id=buyers["buyer_2"].id, commodity_id=commodities["tomato"].id, required_quantity=2500, unit="kg", minimum_grade="Grade A", delivery_location="Pune", required_by=today + timedelta(days=2), status=DemandStatus.active)
    demands = [onion_strong, onion_partial, onion_compat, soy_incompat, soy_strong, onion_unverified, tomato_expired, tomato_demand]
    db.add_all(demands)
    db.flush()
    return {
        "onion_strong": onion_strong, "onion_partial": onion_partial,
        "onion_compat": onion_compat, "soy_incompat": soy_incompat,
        "soy_strong": soy_strong, "onion_unverified": onion_unverified,
        "tomato_expired": tomato_expired, "tomato_demand": tomato_demand,
    }


def seed_offers(db: Session, users: dict[str, User], buyers: dict[str, Buyer], farmers: dict[str, Farmer], lots: dict[str, ProduceLot], demands: dict[str, Demand]) -> dict:
    """Small deterministic demo scenario: 1 active offer, 1 counteroffer, 2 accepted offers."""
    now = datetime.utcnow()
    expiry = now + timedelta(hours=48)

    # Thread A (onion, farmer_1 owns lot1): buyer_1 offer -> farmer_1 counter.
    offer_main = Offer(
        demand_id=demands["onion_strong"].id, lot_id=lots["lot_onion"].id,
        buyer_id=buyers["buyer_1"].id, farmer_id=farmers["farmer_1"].id,
        quantity=4000, offered_price=28.0, pickup_window="2026-09-10 to 2026-09-12",
        payment_terms="Net 3 days", message="Initial offer at market benchmark.",
        status=OfferStatus.countered, parent_offer_id=None, round=1, expires_at=expiry,
    )
    db.add(offer_main)
    db.flush()
    counter = Offer(
        demand_id=demands["onion_strong"].id, lot_id=lots["lot_onion"].id,
        buyer_id=buyers["buyer_1"].id, farmer_id=farmers["farmer_1"].id,
        quantity=4000, offered_price=26.0, pickup_window="2026-09-10 to 2026-09-12",
        payment_terms="Net 3 days", message="Counter: 26/kg, same terms.",
        status=OfferStatus.submitted, parent_offer_id=offer_main.id, round=2, expires_at=expiry,
    )
    db.add(counter)
    db.flush()

    # Thread B (soybean, farmer_2 owns lot2): buyer_1 offer accepted by farmer_2.
    offer_accepted = Offer(
        demand_id=demands["soy_strong"].id, lot_id=lots["lot_soybean"].id,
        buyer_id=buyers["buyer_1"].id, farmer_id=farmers["farmer_2"].id,
        quantity=6000, offered_price=45.0, pickup_window="2026-09-09 to 2026-09-11",
        payment_terms="Net 5 days", message="Firm offer at benchmark.",
        status=OfferStatus.accepted, parent_offer_id=None, round=1, expires_at=expiry,
    )
    db.add(offer_accepted)
    db.flush()

    # Thread C (tomato, farmer_3 owns lot3): buyer_2 offer accepted by farmer_3 for dispute demo.
    offer_accepted_dispute = Offer(
        demand_id=demands["tomato_demand"].id, lot_id=lots["lot_tomato"].id,
        buyer_id=buyers["buyer_2"].id, farmer_id=farmers["farmer_3"].id,
        quantity=2500, offered_price=22.0, pickup_window="2026-09-12 to 2026-09-14",
        payment_terms="Net 3 days", message="Dispute demo offer.",
        status=OfferStatus.accepted, parent_offer_id=None, round=1, expires_at=expiry,
    )
    db.add(offer_accepted_dispute)
    db.flush()

    # Append-only audit history mirroring the service flow.
    buyer_user = users["buyer_1"].id
    buyer2_user = users["buyer_2"].id
    f1_user = users["farmer_1"].id
    f2_user = farmers["farmer_2"].user_id or users["farmer_1"].id
    f3_user = farmers["farmer_3"].user_id or users["farmer_1"].id
    histories = [
        OfferHistory(offer_id=offer_main.id, actor_user_id=buyer_user, action="submitted", from_status=None, to_status=OfferStatus.submitted, quantity=offer_main.quantity, offered_price=offer_main.offered_price, pickup_window=offer_main.pickup_window, payment_terms=offer_main.payment_terms, message=offer_main.message),
        OfferHistory(offer_id=offer_main.id, actor_user_id=f1_user, action="countered", from_status=OfferStatus.submitted, to_status=OfferStatus.countered, quantity=offer_main.quantity, offered_price=offer_main.offered_price, pickup_window=offer_main.pickup_window, payment_terms=offer_main.payment_terms, message=offer_main.message),
        OfferHistory(offer_id=counter.id, actor_user_id=f1_user, action="submitted", from_status=None, to_status=OfferStatus.submitted, quantity=counter.quantity, offered_price=counter.offered_price, pickup_window=counter.pickup_window, payment_terms=counter.payment_terms, message=counter.message),
        OfferHistory(offer_id=offer_accepted.id, actor_user_id=buyer_user, action="submitted", from_status=None, to_status=OfferStatus.submitted, quantity=offer_accepted.quantity, offered_price=offer_accepted.offered_price, pickup_window=offer_accepted.pickup_window, payment_terms=offer_accepted.payment_terms, message=offer_accepted.message),
        OfferHistory(offer_id=offer_accepted.id, actor_user_id=f2_user, action="accepted", from_status=OfferStatus.submitted, to_status=OfferStatus.accepted, quantity=offer_accepted.quantity, offered_price=offer_accepted.offered_price, pickup_window=offer_accepted.pickup_window, payment_terms=offer_accepted.payment_terms, message=offer_accepted.message),
        OfferHistory(offer_id=offer_accepted_dispute.id, actor_user_id=buyer2_user, action="submitted", from_status=None, to_status=OfferStatus.submitted, quantity=offer_accepted_dispute.quantity, offered_price=offer_accepted_dispute.offered_price, pickup_window=offer_accepted_dispute.pickup_window, payment_terms=offer_accepted_dispute.payment_terms, message=offer_accepted_dispute.message),
        OfferHistory(offer_id=offer_accepted_dispute.id, actor_user_id=f3_user, action="accepted", from_status=OfferStatus.submitted, to_status=OfferStatus.accepted, quantity=offer_accepted_dispute.quantity, offered_price=offer_accepted_dispute.offered_price, pickup_window=offer_accepted_dispute.pickup_window, payment_terms=offer_accepted_dispute.payment_terms, message=offer_accepted_dispute.message),
    ]
    db.add_all(histories)
    db.flush()

    return {"offer_accepted": offer_accepted, "offer_accepted_dispute": offer_accepted_dispute}


def seed_transactions(db: Session, users: dict[str, User], buyers: dict[str, Buyer], farmers: dict[str, Farmer], lots: dict[str, ProduceLot], demands: dict[str, Demand], offers: dict) -> None:
    now = datetime.utcnow()
    confirmed_at = now - timedelta(hours=2)
    completed_at = now - timedelta(hours=1)

    transaction = Transaction(
        offer_id=offers["offer_accepted"].id,
        lot_id=lots["lot_soybean"].id,
        buyer_id=buyers["buyer_1"].id,
        farmer_id=farmers["farmer_2"].id,
        quantity=6000,
        agreed_price=45.0,
        total_amount=2700.0,
        status=TransactionStatus.completed,
        confirmed_at=confirmed_at,
        completed_at=completed_at,
    )
    db.add(transaction)
    db.flush()

    shipment = Shipment(
        transaction_id=transaction.id,
        pickup_location="Solapur Farm Gate",
        delivery_location="Pune Processing Unit",
        transporter_name="Maharashtra Logistics",
        vehicle_number="MH-12-AB-3456",
        estimated_pickup=now - timedelta(days=2),
        estimated_delivery=now - timedelta(days=1),
        actual_pickup=now - timedelta(days=2, hours=1),
        actual_delivery=now - timedelta(days=1, hours=3),
        status="delivered",
    )
    db.add(shipment)
    db.flush()

    payment = Payment(
        transaction_id=transaction.id,
        amount=270000.0,
        payment_method="bank_transfer",
        status="confirmed",
        reference="TXN-2026-001234",
        initiated_at=confirmed_at,
        confirmed_at=completed_at,
    )
    db.add(payment)
    db.flush()

    disputed_transaction = Transaction(
        offer_id=offers["offer_accepted_dispute"].id,
        lot_id=lots["lot_tomato"].id,
        buyer_id=buyers["buyer_2"].id,
        farmer_id=farmers["farmer_3"].id,
        quantity=2500,
        agreed_price=22.0,
        total_amount=550.0,
        status=TransactionStatus.disputed,
        confirmed_at=confirmed_at,
    )
    db.add(disputed_transaction)
    db.flush()

    dispute = Dispute(
        transaction_id=disputed_transaction.id,
        opened_by_user_id=farmers["farmer_3"].user_id or users["farmer_1"].id,
        reason="quality_disagreement",
        description="Buyer rejected lot at delivery citing quality mismatch.",
        status=DisputeStatus.under_review,
        priority="high",
    )
    db.add(dispute)
    db.flush()

    evidence = DisputeEvidence(
        dispute_id=dispute.id,
        uploaded_by_user_id=farmers["farmer_3"].user_id or users["farmer_1"].id,
        evidence_type="photo",
        file_name="lot_photo_001.jpg",
        file_path="/mock/evidence/lot_photo_001.jpg",
        description="Lot photo at time of pickup.",
    )
    db.add(evidence)
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
        lots = seed_lots(db, farmers, commodities)
        demands = seed_demands(db, buyers, commodities)
        offers = seed_offers(db, users, buyers, farmers, lots, demands)
        seed_transactions(db, users, buyers, farmers, lots, demands, offers)
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
