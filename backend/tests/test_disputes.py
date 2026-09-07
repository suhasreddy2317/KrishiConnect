"""Tests for Phase 3D.5: Dispute workflow and append-only audit logging."""
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
from app.models.enums import DemandStatus, DisputeStatus, LotStatus, OfferStatus, TransactionStatus, UserRole
from app.models.farmer import Farmer
from app.models.offer import Offer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.services.offers import accept_offer, create_offer
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "disputepass"
BUYER1_USER_PHONE = "+919920000111"
BUYER1_BUYER_PHONE = "+919920000112"
BUYER2_USER_PHONE = "+919920000121"
BUYER2_BUYER_PHONE = "+919920000122"
FARMER1_USER_PHONE = "+919920000131"
FARMER1_PHONE = "+919920000132"
FARMER2_USER_PHONE = "+919920000141"
FARMER2_PHONE = "+919920000142"
FARMER3_USER_PHONE = "+919920000151"
FARMER3_PHONE = "+919920000152"


ADMIN_USER_PHONE = "+919920000161"


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
        tomato = Commodity(name="Tomato", variety="Hybrid", unit="kg", is_perishable=True)
        db_session.add_all([onion, soybean, tomato])
        db_session.flush()

        b1u = User(name="Buyer One", phone=BUYER1_USER_PHONE, role=UserRole.buyer, is_active=True, password_hash=pw)
        b2u = User(name="Buyer Two", role=UserRole.buyer, phone=BUYER2_USER_PHONE, is_active=True, password_hash=pw)
        f1u = User(name="Farmer One", phone=FARMER1_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f2u = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f3u = User(name="Farmer Three", phone=FARMER3_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        admin_u = User(name="Admin User", phone=ADMIN_USER_PHONE, role=UserRole.admin, is_active=True, password_hash=pw)
        db_session.add_all([b1u, b2u, f1u, f2u, f3u, admin_u])
        db_session.flush()

        from app.models.buyer import Buyer
        from app.models.enums import BuyerStatus
        buyer1 = Buyer(user_id=b1u.id, business_name="B1 Verified", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        buyer2 = Buyer(user_id=b2u.id, business_name="B2 Verified", phone=BUYER2_BUYER_PHONE, status=BuyerStatus.verified)
        farmer1 = Farmer(user_id=f1u.id, name="Farmer One", phone=FARMER1_PHONE, village="Nashik", district="Nashik", state="MH", latitude=19.99, longitude=73.78)
        farmer2 = Farmer(user_id=f2u.id, name="Farmer Two", phone=FARMER2_PHONE, village="Pune", district="Pune", state="MH", latitude=18.52, longitude=73.85)
        farmer3 = Farmer(user_id=f3u.id, name="Farmer Three", phone=FARMER3_PHONE, village="Solapur", district="Solapur", state="MH", latitude=17.66, longitude=75.91)
        db_session.add_all([buyer1, buyer2, farmer1, farmer2, farmer3])
        db_session.flush()

        today = datetime.utcnow().date()
        lot_onion = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade A", harvest_date=today, location="Nashik", status=LotStatus.published)
        lot_soy = ProduceLot(farmer_id=farmer2.id, commodity_id=soybean.id, crop="Soybean", quantity_kg=6000, quality_grade="Grade B", harvest_date=today, location="Solapur", status=LotStatus.published)
        lot_tomato = ProduceLot(farmer_id=farmer3.id, commodity_id=tomato.id, crop="Tomato", quantity_kg=2500, quality_grade="Grade A", harvest_date=today, location="Pune", status=LotStatus.published)
        db_session.add_all([lot_onion, lot_soy, lot_tomato])
        db_session.flush()

        demand_onion = Demand(buyer_id=buyer1.id, commodity_id=onion.id, required_quantity=4000, unit="kg", minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
        demand_soy = Demand(buyer_id=buyer1.id, commodity_id=soybean.id, required_quantity=6000, unit="kg", minimum_grade="Grade B", delivery_location="Solapur", required_by=today + timedelta(days=4), status=DemandStatus.active)
        demand_tomato = Demand(buyer_id=buyer2.id, commodity_id=tomato.id, required_quantity=2500, unit="kg", minimum_grade="Grade A", delivery_location="Pune", required_by=today + timedelta(days=2), status=DemandStatus.active)
        db_session.add_all([demand_onion, demand_soy, demand_tomato])
        db_session.commit()

        yield SimpleNamespace(
            db=db_session,
            onion=onion, soybean=soybean, tomato=tomato,
            buyer1=buyer1, buyer2=buyer2,
            farmer1=farmer1, farmer2=farmer2, farmer3=farmer3,
            lot_onion=lot_onion, lot_soy=lot_soy, lot_tomato=lot_tomato,
            demand_onion=demand_onion, demand_soy=demand_soy, demand_tomato=demand_tomato,
            b1u=b1u, b2u=b2u, f1u=f1u, f2u=f2u, f3u=f3u, admin_u=admin_u,
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


def _create_accepted_offer(data, demand_id, lot_id, qty, price, farmer_phone, farmer_user):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/",
        json=_offer_payload(demand_id, lot_id, qty=qty, price=price),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    token_f = _login(farmer_phone)
    client.post(
        f"/api/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {token_f}"},
    )
    token_b = _login(BUYER1_USER_PHONE)
    txn = client.get("/api/transactions/", headers={"Authorization": f"Bearer {token_b}"}).json()["items"][0]
    return offer_id, txn


def test_dispute_creation_by_farmer(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    response = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
            "description": "Quality not as agreed.",
            "priority": "medium",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "open"
    assert body["reason"] == "quality_disagreement"


def test_dispute_creation_by_buyer(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_b1 = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    response = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "payment_delay",
            "description": "Payment delayed.",
        },
        headers={"Authorization": f"Bearer {token_b1}"},
    )
    assert response.status_code == 201


def test_dispute_unauthorized_access(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_b1 = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    dispute_id = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
        },
        headers={"Authorization": f"Bearer {token_b1}"},
    ).json()["id"]

    token_f1 = _login(FARMER1_USER_PHONE)
    assert client.get(f"/api/disputes/{dispute_id}", headers={"Authorization": f"Bearer {token_f1}"}).status_code == 403


def test_dispute_status_transitions(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    dispute = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    ).json()
    dispute_id = dispute["id"]

    progression = ["under_review", "awaiting_evidence", "escalated", "resolved"]
    for status in progression:
        response = client.patch(
            f"/api/disputes/{dispute_id}/status",
            json={"status": status, "resolution_notes": "Resolved." if status == "resolved" else None},
            headers={"Authorization": f"Bearer {token_f2}"},
        )
        assert response.status_code == 200, f"Failed at {status}: {response.text}"
        assert response.json()["status"] == status


def test_dispute_invalid_transition(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    dispute = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    ).json()
    dispute_id = dispute["id"]

    response = client.patch(
        f"/api/disputes/{dispute_id}/status",
        json={"status": "resolved"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409


def test_dispute_evidence_creation_and_listing(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    dispute = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "short_weight",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    ).json()
    dispute_id = dispute["id"]

    response = client.post(
        f"/api/disputes/{dispute_id}/evidence",
        json={
            "evidence_type": "photo",
            "file_name": "weight_slip.jpg",
            "description": "Weighbridge slip.",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["evidence_type"] == "photo"

    list_response = client.get(
        f"/api/disputes/{dispute_id}/evidence",
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1


def test_transaction_becomes_disputed_on_dispute_open(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    assert txn["status"] == "accepted"

    client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    updated = client.get(f"/api/transactions/{txn_id}", headers={"Authorization": f"Bearer {token_f2}"}).json()
    assert updated["status"] == "disputed"


def test_dispute_resolution(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    dispute = client.post(
        "/api/disputes/",
        json={
            "transaction_id": txn_id,
            "reason": "quality_disagreement",
        },
        headers={"Authorization": f"Bearer {token_f2}"},
    ).json()
    dispute_id = dispute["id"]

    client.patch(
        f"/api/disputes/{dispute_id}/status",
        json={"status": "under_review"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    client.patch(
        f"/api/disputes/{dispute_id}/status",
        json={"status": "awaiting_evidence"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    client.patch(
        f"/api/disputes/{dispute_id}/status",
        json={"status": "escalated"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    resolved = client.patch(
        f"/api/disputes/{dispute_id}/status",
        json={"status": "resolved", "resolution_notes": "Compensation agreed."},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert resolved.status_code == 200
    body = resolved.json()
    assert body["status"] == "resolved"
    assert body["resolution_notes"] == "Compensation agreed."
    assert body["resolved_by_user_id"] == data.f2u.id
    assert body["resolved_at"] is not None


def test_audit_records_created(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    token_admin = _login(ADMIN_USER_PHONE)
    response = client.get("/api/audit/", headers={"Authorization": f"Bearer {token_admin}"})
    assert response.status_code == 200
    body = response.json()
    actions = {entry["action"] for entry in body["items"]}
    assert "transaction.created" in actions
    assert "transaction.status.updated" in actions


def test_audit_log_append_only(data):
    offer_id, txn = _create_accepted_offer(data, data.demand_soy.id, data.lot_soy.id, 6000, 45.0, FARMER2_USER_PHONE, data.f2u)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    token_admin = _login(ADMIN_USER_PHONE)
    first = client.get("/api/audit/", headers={"Authorization": f"Bearer {token_admin}"}).json()
    first_total = first["total"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    second = client.get("/api/audit/", headers={"Authorization": f"Bearer {token_admin}"}).json()
    second_total = second["total"]
    assert second_total == first_total + 1
    assert second["items"][0]["action"] == "transaction.status.updated"
