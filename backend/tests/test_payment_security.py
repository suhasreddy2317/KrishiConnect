"""Security tests for payment status transitions."""
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.commodity import Commodity
from app.models.demand import Demand
from app.models.enums import DemandStatus, LotStatus, UserRole
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "paysecpass"
BUYER1_USER_PHONE = "+919910000411"
BUYER1_BUYER_PHONE = "+919910000412"
FARMER1_USER_PHONE = "+919910000413"
FARMER1_PHONE = "+919910000414"
FARMER2_USER_PHONE = "+919910000415"
FARMER2_PHONE = "+919910000416"


def _login(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": DEMO_PASS})
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture()
def data():
    db_session = _Session()
    try:
        pw = hash_password(DEMO_PASS)
        onion = Commodity(name="Red Onion", variety="Local", unit="kg", is_perishable=True)
        soybean = Commodity(name="Soybean", variety="Yellow", unit="kg", is_perishable=False)
        db_session.add_all([onion, soybean])
        db_session.flush()

        b1u = User(name="Buyer One", phone=BUYER1_USER_PHONE, role=UserRole.buyer, is_active=True, password_hash=pw)
        f1u = User(name="Farmer One", phone=FARMER1_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f2u = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        db_session.add_all([b1u, f1u, f2u])
        db_session.flush()

        from app.models.buyer import Buyer
        from app.models.enums import BuyerStatus
        buyer1 = Buyer(user_id=b1u.id, business_name="B1 Verified", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        farmer1 = Farmer(user_id=f1u.id, name="Farmer One", phone=FARMER1_PHONE, village="Nashik", district="Nashik", state="MH", latitude=19.99, longitude=73.78)
        farmer2 = Farmer(user_id=f2u.id, name="Farmer Two", phone=FARMER2_PHONE, village="Pune", district="Pune", state="MH", latitude=18.52, longitude=73.85)
        db_session.add_all([buyer1, farmer1, farmer2])
        db_session.flush()

        today = datetime.utcnow().date()
        lot_onion = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade A", harvest_date=today, location="Nashik", status=LotStatus.published)
        lot_soy = ProduceLot(farmer_id=farmer2.id, commodity_id=soybean.id, crop="Soybean", quantity_kg=6000, quality_grade="Grade B", harvest_date=today, location="Solapur", status=LotStatus.published)
        db_session.add_all([lot_onion, lot_soy])
        db_session.flush()

        demand_onion = Demand(buyer_id=buyer1.id, commodity_id=onion.id, required_quantity=4000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
        demand_soy = Demand(buyer_id=buyer1.id, commodity_id=soybean.id, required_quantity=6000, unit="kg", minimum_grade="Grade B", delivery_location="Solapur", required_by=today + timedelta(days=4), status=DemandStatus.active)
        db_session.add_all([demand_onion, demand_soy])
        db_session.commit()

        yield SimpleNamespace(
            db=db_session,
            onion=onion, soybean=soybean,
            buyer1=buyer1, farmer1=farmer1, farmer2=farmer2,
            lot_onion=lot_onion, lot_soy=lot_soy,
            demand_onion=demand_onion, demand_soy=demand_soy,
            b1u=b1u, f1u=f1u, f2u=f2u,
        )
    finally:
        db_session.close()


from types import SimpleNamespace


def _offer_payload(demand_id, lot_id, qty=4000, price=28.0):
    return {
        "demand_id": demand_id,
        "lot_id": lot_id,
        "quantity": qty,
        "offered_price": price,
        "pickup_window": "2026-09-10 to 2026-09-12",
        "payment_terms": "Net 3 days",
        "message": "Market benchmark offer.",
    }


def _create_accepted_offer(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_soy.id, data.lot_soy.id, qty=6000, price=45.0),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f2 = _login(FARMER2_USER_PHONE)
    client.post(
        f"/api/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    token_b = _login(BUYER1_USER_PHONE)
    txn = client.get("/api/transactions/", headers={"Authorization": f"Bearer {token_b}"}).json()["items"][0]
    return offer_id, txn


def test_buyer_can_set_payment_initiated(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    payment = client.post(
        "/api/payments/",
        json={"transaction_id": txn["id"], "amount": 2700.0},
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    payment_id = payment["id"]

    response = client.patch(
        f"/api/payments/{payment_id}/status",
        json={"status": "initiated"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "initiated"


def test_buyer_cannot_set_payment_confirmed(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    payment = client.post(
        "/api/payments/",
        json={"transaction_id": txn["id"], "amount": 2700.0},
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    payment_id = payment["id"]

    response = client.patch(
        f"/api/payments/{payment_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 403


def test_buyer_cannot_set_payment_completed(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    payment = client.post(
        "/api/payments/",
        json={"transaction_id": txn["id"], "amount": 2700.0},
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    payment_id = payment["id"]

    response = client.patch(
        f"/api/payments/{payment_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 403


def test_farmer_can_set_own_payment_processing(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    token_b = _login(BUYER1_USER_PHONE)
    payment = client.post(
        "/api/payments/",
        json={"transaction_id": txn_id, "amount": 2700.0},
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    payment_id = payment["id"]

    response = client.patch(
        f"/api/payments/{payment_id}/status",
        json={"status": "processing"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 200, f"Failed at processing: {response.text}"
    assert response.json()["status"] == "processing"


def test_unrelated_farmer_cannot_set_another_farmers_payment_processing(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]

    payment = client.post(
        "/api/payments/",
        json={"transaction_id": txn_id, "amount": 2700.0},
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    payment_id = payment["id"]

    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.patch(
        f"/api/payments/{payment_id}/status",
        json={"status": "processing"},
        headers={"Authorization": f"Bearer {token_f1}"},
    )
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()
