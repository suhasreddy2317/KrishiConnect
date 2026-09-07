"""Tests for Phase 3D.3: Offers & Counteroffers lifecycle."""
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
from app.models.offer import Offer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.services.offers import OfferError, counter_offer, accept_offer
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "offerspass"
BUYER1_USER_PHONE = "+919900000711"
BUYER1_BUYER_PHONE = "+919900000712"
BUYER2_USER_PHONE = "+919900000721"
BUYER2_BUYER_PHONE = "+919900000722"
BUYER3_USER_PHONE = "+919900000751"
BUYER3_BUYER_PHONE = "+919900000752"
FARMER1_USER_PHONE = "+919900000731"
FARMER1_PHONE = "+919900000732"
FARMER2_USER_PHONE = "+919900000741"
FARMER2_PHONE = "+919900000742"


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
        b2u = User(name="Buyer Two", role=UserRole.buyer, phone=BUYER2_USER_PHONE, is_active=True, password_hash=pw)
        b3u = User(name="Buyer Three", role=UserRole.buyer, phone=BUYER3_USER_PHONE, is_active=True, password_hash=pw)
        f1u = User(name="Farmer One", phone=FARMER1_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f2u = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        db_session.add_all([b1u, b2u, b3u, f1u, f2u])
        db_session.flush()

        from app.models.buyer import Buyer
        from app.models.enums import BuyerStatus
        buyer1 = Buyer(user_id=b1u.id, business_name="B1 Verified", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        buyer2 = Buyer(user_id=b2u.id, business_name="B2 Verified", phone=BUYER2_BUYER_PHONE, status=BuyerStatus.verified)
        buyer3 = Buyer(user_id=b3u.id, business_name="B3 Unverified", phone=BUYER3_BUYER_PHONE, status=BuyerStatus.unverified)
        farmer1 = Farmer(user_id=f1u.id, name="Farmer One", phone=FARMER1_PHONE, village="Nashik", district="Nashik", state="MH", latitude=19.99, longitude=73.78)
        farmer2 = Farmer(user_id=f2u.id, name="Farmer Two", phone=FARMER2_PHONE, village="Pune", district="Pune", state="MH", latitude=18.52, longitude=73.85)
        db_session.add_all([buyer1, buyer2, buyer3, farmer1, farmer2])
        db_session.flush()

        today = datetime.utcnow().date()
        lot_onion = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade A", harvest_date=today, location="Nashik", status=LotStatus.published)
        lot_onion_low = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade B", harvest_date=today, location="Nashik", status=LotStatus.published)
        lot_soy = ProduceLot(farmer_id=farmer1.id, commodity_id=soybean.id, crop="Soybean", quantity_kg=6000, quality_grade="Grade A", harvest_date=today, location="Solapur", status=LotStatus.published)
        db_session.add_all([lot_onion, lot_onion_low, lot_soy])
        db_session.flush()

        demand_onion = Demand(buyer_id=buyer1.id, commodity_id=onion.id, required_quantity=4000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
        db_session.add(demand_onion)
        db_session.commit()

        yield SimpleNamespace(
            db=db_session,
            onion=onion, soybean=soybean,
            buyer1=buyer1, buyer2=buyer2,
            farmer1=farmer1, farmer2=farmer2,
            lot_onion=lot_onion, lot_onion_low=lot_onion_low, lot_soy=lot_soy,
            demand_onion=demand_onion,
            b1u=b1u, b2u=b2u, f1u=f1u, f2u=f2u,
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


def test_authentication_required():
    assert client.post("/api/offers/", json=_offer_payload(1, 1)).status_code == 401
    assert client.get("/api/offers/").status_code == 401
    assert client.get("/api/offers/1").status_code == 401


def test_create_offer(data):
    token = _login(BUYER1_USER_PHONE)
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["buyer_id"] == data.buyer1.id
    assert body["farmer_id"] == data.farmer1.id
    assert body["demand_id"] == data.demand_onion.id
    assert body["lot_id"] == data.lot_onion.id
    assert body["round"] == 1
    assert body["status"] == "submitted"
    assert body["expires_at"]
    assert body["quantity"] == 4000
    assert body["offered_price"] == 28.0


def test_buyer_verification_requirement(data):
    token = _login(BUYER3_USER_PHONE)  # unverified
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_buyer_cannot_offer_on_others_demand(data):
    # buyer2 is verified but demand_onion belongs to buyer1 -> 403 (ownership).
    token = _login(BUYER2_USER_PHONE)
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_invalid_commodity_mismatch(data):
    token = _login(BUYER1_USER_PHONE)
    # demand is onion; lot is soybean -> 400
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_soy.id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_invalid_grade_incompatible(data):
    token = _login(BUYER1_USER_PHONE)
    # demand minimum Grade A; lot is Grade B -> incompatible -> 400
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion_low.id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_invalid_quantity_exceeds_lot(data):
    token = _login(BUYER1_USER_PHONE)
    # lot qty 4000; offer 5000 -> 400
    response = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id, qty=5000),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_object_level_authorization_farmer(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    # farmer2 does not own lot_onion -> cannot accept
    token_f2 = _login(FARMER2_USER_PHONE)
    response = client.post(
        f"/api/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 403


def test_counteroffer_and_round_increment(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]

    token_f = _login(FARMER1_USER_PHONE)
    response = client.post(
        f"/api/offers/{offer_id}/counter",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id, qty=4000, price=26.0),
        headers={"Authorization": f"Bearer {token_f}"},
    )
    assert response.status_code == 200
    counter = response.json()
    assert counter["round"] == 2
    assert counter["status"] == "submitted"
    assert counter["parent_offer_id"] == offer_id

    parent = client.get(f"/api/offers/{offer_id}", headers={"Authorization": f"Bearer {token_f}"}).json()
    assert parent["status"] == "countered"


def test_maximum_rounds(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id, price=30),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]

    token_f = _login(FARMER1_USER_PHONE)
    current = offer_id
    # rounds 2,3,4,5 (4 successful counters), alternating farmer/buyer
    for actor in (token_f, token_b, token_f, token_b):
        response = client.post(
            f"/api/offers/{current}/counter",
            json=_offer_payload(data.demand_onion.id, data.lot_onion.id, price=29),
            headers={"Authorization": f"Bearer {actor}"},
        )
        assert response.status_code == 200, response.json()
        current = response.json()["id"]
        assert response.json()["round"] in (2, 3, 4, 5)

    # 6th counter attempt blocked (round 5 is at the maximum)
    response = client.post(
        f"/api/offers/{current}/counter",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id, price=28),
        headers={"Authorization": f"Bearer {token_f}"},
    )
    assert response.status_code == 400


def test_accept_offer(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f = _login(FARMER1_USER_PHONE)
    response = client.post(f"/api/offers/{offer_id}/accept", headers={"Authorization": f"Bearer {token_f}"})
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"


def test_reject_offer(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f = _login(FARMER1_USER_PHONE)
    response = client.post(
        f"/api/offers/{offer_id}/reject",
        json={"reason": "Price too low"},
        headers={"Authorization": f"Bearer {token_f}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"


def test_expired_offer_cannot_be_accepted(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]

    # Force expiry.
    db_session = _Session()
    try:
        offer = db_session.get(Offer, offer_id)
        offer.expires_at = datetime.utcnow() - timedelta(hours=1)
        db_session.commit()
    finally:
        db_session.close()

    token_f = _login(FARMER1_USER_PHONE)
    response = client.post(f"/api/offers/{offer_id}/accept", headers={"Authorization": f"Bearer {token_f}"})
    assert response.status_code == 409


def test_immutable_accepted_terms(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f = _login(FARMER1_USER_PHONE)
    client.post(f"/api/offers/{offer_id}/accept", headers={"Authorization": f"Bearer {token_f}"})

    # After acceptance, counter/accept/reject must be blocked.
    for action in ("counter", "accept", "reject"):
        response = client.post(
            f"/api/offers/{offer_id}/{action}",
            json=_offer_payload(data.demand_onion.id, data.lot_onion.id, price=25),
            headers={"Authorization": f"Bearer {token_f}"},
        )
        assert response.status_code == 409, (action, response.status_code, response.text)


def test_offer_history(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f = _login(FARMER1_USER_PHONE)
    counter_id = client.post(
        f"/api/offers/{offer_id}/counter",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id, price=26.0),
        headers={"Authorization": f"Bearer {token_f}"},
    ).json()["id"]
    client.post(f"/api/offers/{counter_id}/accept", headers={"Authorization": f"Bearer {token_b}"})

    response = client.get(f"/api/offers/{offer_id}/history", headers={"Authorization": f"Bearer {token_f}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    actions = {entry["action"] for entry in body["items"]}
    assert {"submitted", "countered", "accepted"} <= actions


def test_valid_authenticated_list(data):
    token_b = _login(BUYER1_USER_PHONE)
    client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    )
    response = client.get("/api/offers/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_buyer_scoped_from_other_buyers(data):
    token_b2 = _login(BUYER2_USER_PHONE)
    response = client.get("/api/offers/", headers={"Authorization": f"Bearer {token_b2}"})
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_missing_offer_404(data):
    token_b = _login(BUYER1_USER_PHONE)
    assert client.get("/api/offers/999999", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404
    assert client.get("/api/offers/999999/history", headers={"Authorization": f"Bearer {token_b}"}).status_code == 404


def test_deterministic(data):
    token_b = _login(BUYER1_USER_PHONE)
    p = _offer_payload(data.demand_onion.id, data.lot_onion.id, price=33.0)
    a = client.post("/api/offers/", json=p, headers={"Authorization": f"Bearer {token_b}"}).json()
    b = client.post("/api/offers/", json=p, headers={"Authorization": f"Bearer {token_b}"}).json()
    for field in ("quantity", "offered_price", "round", "status", "buyer_id", "lot_id", "demand_id"):
        assert a[field] == b[field]


def test_service_counter_offer_round_increment(data):
    db_session = _Session()
    try:
        offer = db_session.query(Offer).first()
        assert offer is None  # baseline: no pre-existing offers in this test
        db_session.rollback()
    finally:
        db_session.close()

    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/", json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]

    # Service-level: counter as the lot-owning farmer increases round and records history.
    db_session = _Session()
    try:
        counter = counter_offer(
            db_session,
            offer_id=offer_id,
            quantity=4000,
            offered_price=26.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 3 days",
            message="Counter",
            actor_user_id=data.f1u.id,
            actor_role=UserRole.farmer,
        )
        assert counter.round == 2
        assert counter.parent_offer_id == offer_id
        from app.services.offers import get_offer_history
        history = get_offer_history(db_session, counter.id)
        assert any(h.action == "submitted" for h in history)
        db_session.commit()
    finally:
        db_session.close()
