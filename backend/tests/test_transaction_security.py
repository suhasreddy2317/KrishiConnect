"""Security tests for transactions."""
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
from app.models.enums import DemandStatus, LotStatus, OfferStatus, TransactionStatus, UserRole
from app.models.farmer import Farmer
from app.models.offer import Offer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.services.offers import accept_offer, create_offer
from app.services.transactions import TransactionError, create_transaction
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "txnsecpass"
BUYER1_USER_PHONE = "+919910000311"
BUYER1_BUYER_PHONE = "+919910000312"
BUYER2_USER_PHONE = "+919910000313"
BUYER2_BUYER_PHONE = "+919910000314"
FARMER1_USER_PHONE = "+919910000315"
FARMER1_PHONE = "+919910000316"
FARMER2_USER_PHONE = "+919910000317"
FARMER2_PHONE = "+919910000318"


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
        f1u = User(name="Farmer One", phone=FARMER1_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f2u = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        db_session.add_all([b1u, b2u, f1u, f2u])
        db_session.flush()

        from app.models.buyer import Buyer
        from app.models.enums import BuyerStatus
        buyer1 = Buyer(user_id=b1u.id, business_name="B1 Verified", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        buyer2 = Buyer(user_id=b2u.id, business_name="B2 Verified", phone=BUYER2_BUYER_PHONE, status=BuyerStatus.verified)
        farmer1 = Farmer(user_id=f1u.id, name="Farmer One", phone=FARMER1_PHONE, village="Nashik", district="Nashik", state="MH", latitude=19.99, longitude=73.78)
        farmer2 = Farmer(user_id=f2u.id, name="Farmer Two", phone=FARMER2_PHONE, village="Pune", district="Pune", state="MH", latitude=18.52, longitude=73.85)
        db_session.add_all([buyer1, buyer2, farmer1, farmer2])
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
            buyer1=buyer1, buyer2=buyer2,
            farmer1=farmer1, farmer2=farmer2,
            lot_onion=lot_onion, lot_soy=lot_soy,
            demand_onion=demand_onion, demand_soy=demand_soy,
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


def test_unauthenticated_transaction_creation_rejected(data):
    response = client.post("/api/transactions/", json={"offer_id": 1, "quantity": 100, "agreed_price": 10.0, "total_amount": 100.0})
    assert response.status_code in (401, 403)


def test_unauthorized_buyer_cannot_create_transaction_for_another_buyer_offer(data):
    token_b1 = _login(BUYER1_USER_PHONE)
    offer = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_soy.id, data.lot_soy.id, qty=6000, price=45.0),
        headers={"Authorization": f"Bearer {token_b1}"},
    ).json()
    offer_id = offer["id"]

    token_b2 = _login(BUYER2_USER_PHONE)
    response = client.post(
        "/api/transactions/",
        json={
            "offer_id": offer_id,
            "lot_id": data.lot_soy.id,
            "buyer_id": data.buyer2.id,
            "farmer_id": data.farmer2.id,
            "quantity": 6000,
            "agreed_price": 45.0,
            "total_amount": 2700.0,
        },
        headers={"Authorization": f"Bearer {token_b2}"},
    )
    assert response.status_code == 403


def test_race_condition_two_competing_purchases_cannot_oversell(data):
    token_b = _login(BUYER1_USER_PHONE)
    token_f2 = _login(FARMER2_USER_PHONE)

    from app.services.offers import create_offer, accept_offer
    from app.models.enums import OfferStatus
    from app.services.transactions import TransactionError

    db_session = _Session()
    try:
        small_lot = ProduceLot(
            farmer_id=data.farmer2.id,
            commodity_id=data.soybean.id,
            crop="Soybean",
            quantity_kg=1000,
            quality_grade="Grade B",
            harvest_date=datetime.utcnow().date(),
            location="Solapur",
            status=LotStatus.published,
        )
        db_session.add(small_lot)
        db_session.commit()
        db_session.refresh(small_lot)

        offer1 = create_offer(
            db_session,
            demand_id=data.demand_soy.id,
            lot_id=small_lot.id,
            quantity=1000,
            offered_price=45.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 5 days",
            message="First competing offer",
            buyer_user_id=data.b1u.id,
        )
        db_session.commit()
        db_session.refresh(offer1)

        offer2 = create_offer(
            db_session,
            demand_id=data.demand_soy.id,
            lot_id=small_lot.id,
            quantity=1000,
            offered_price=45.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 5 days",
            message="Second competing offer",
            buyer_user_id=data.b1u.id,
        )
        db_session.commit()
        db_session.refresh(offer2)
        offer2_id = offer2.id

        accept_offer(db_session, offer_id=offer1.id, actor_user_id=data.f2u.id, actor_role=UserRole.farmer)
        db_session.commit()

        with pytest.raises(TransactionError):
            accept_offer(db_session, offer_id=offer2.id, actor_user_id=data.f2u.id, actor_role=UserRole.farmer)
        db_session.commit()

        db_session.refresh(small_lot)
        assert small_lot.quantity_kg >= 0
    finally:
        db_session.close()

    response = client.post(
        "/api/transactions/",
        json={
            "offer_id": offer2_id,
            "quantity": 1000,
            "agreed_price": 45.0,
            "total_amount": 450.0,
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 400
    assert "Insufficient quantity available" in response.json()["detail"]


def test_lot_becomes_unavailable_after_transaction(data):
    token_b = _login(BUYER1_USER_PHONE)

    from app.services.offers import create_offer, accept_offer
    from app.models.enums import OfferStatus
    from app.services.transactions import TransactionError

    db_session = _Session()
    try:
        small_lot = ProduceLot(
            farmer_id=data.farmer2.id,
            commodity_id=data.soybean.id,
            crop="Soybean",
            quantity_kg=1000,
            quality_grade="Grade B",
            harvest_date=datetime.utcnow().date(),
            location="Solapur",
            status=LotStatus.published,
        )
        db_session.add(small_lot)
        db_session.commit()
        db_session.refresh(small_lot)

        first_offer = create_offer(
            db_session,
            demand_id=data.demand_soy.id,
            lot_id=small_lot.id,
            quantity=1000,
            offered_price=45.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 5 days",
            message="First offer",
            buyer_user_id=data.b1u.id,
        )
        db_session.commit()
        db_session.refresh(first_offer)

        accept_offer(db_session, offer_id=first_offer.id, actor_user_id=data.f2u.id, actor_role=UserRole.farmer)
        db_session.commit()

        second_offer = create_offer(
            db_session,
            demand_id=data.demand_soy.id,
            lot_id=small_lot.id,
            quantity=1000,
            offered_price=45.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 5 days",
            message="Second offer",
            buyer_user_id=data.b1u.id,
        )
        db_session.commit()
        db_session.refresh(second_offer)

        with pytest.raises(TransactionError):
            accept_offer(db_session, offer_id=second_offer.id, actor_user_id=data.f2u.id, actor_role=UserRole.farmer)
        db_session.commit()

        second_offer_id = second_offer.id
    finally:
        db_session.close()

    response = client.post(
        "/api/transactions/",
        json={
            "offer_id": second_offer_id,
            "quantity": 1000,
            "agreed_price": 45.0,
            "total_amount": 450.0,
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 400
    assert "Insufficient quantity available" in response.json()["detail"]


def test_unrelated_farmer_cannot_confirm_another_farmers_transaction(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f1 = _login(FARMER1_USER_PHONE)
    txn_id = txn["id"]
    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f1}"},
    )
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()


def test_farmer_can_confirm_own_accepted_transaction(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]
    assert txn["status"] == "accepted"

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 200, f"Failed at confirmed: {response.text}"
    assert response.json()["status"] == "confirmed"


def test_farmer_cannot_jump_accepted_to_dispatched(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409


def test_farmer_can_mark_own_in_transit_transaction_delivered(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    admin_pw = hash_password(DEMO_PASS)
    admin_user = User(name="Admin User", phone="+919910000301", role=UserRole.admin, is_active=True, password_hash=admin_pw)
    data.db.add(admin_user)
    data.db.commit()

    token_admin = client.post("/api/auth/login", json={"identifier": "+919910000301", "password": DEMO_PASS}).json()["access_token"]
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "in_transit"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 200, f"Failed at delivered: {response.text}"
    assert response.json()["status"] == "delivered"


def test_unrelated_farmer_cannot_mark_another_farmers_transaction_delivered(data):
    offer_id, txn = _create_accepted_offer(data)
    txn_id = txn["id"]

    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_f1}"},
    )
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()


def test_farmer_cannot_jump_accepted_to_delivered(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409


def test_farmer_cannot_jump_confirmed_to_delivered(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409


def test_farmer_cannot_jump_dispatched_to_delivered(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409


def test_farmer_can_mark_own_delivered_transaction_payment_pending(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )

    admin_pw = hash_password(DEMO_PASS)
    admin_user = User(name="Admin User", phone="+919910000302", role=UserRole.admin, is_active=True, password_hash=admin_pw)
    data.db.add(admin_user)
    data.db.commit()

    token_admin = client.post("/api/auth/login", json={"identifier": "+919910000302", "password": DEMO_PASS}).json()["access_token"]
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "in_transit"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "payment_pending"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 200, f"Failed at payment_pending: {response.text}"
    assert response.json()["status"] == "payment_pending"


def test_unrelated_farmer_cannot_mark_another_farmers_delivered_transaction_payment_pending(data):
    offer_id, txn = _create_accepted_offer(data)
    txn_id = txn["id"]

    admin_pw = hash_password(DEMO_PASS)
    admin_user = User(name="Admin User", phone="+919910000303", role=UserRole.admin, is_active=True, password_hash=admin_pw)
    data.db.add(admin_user)
    data.db.commit()

    token_admin = client.post("/api/auth/login", json={"identifier": "+919910000303", "password": DEMO_PASS}).json()["access_token"]
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "in_transit"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )

    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "payment_pending"},
        headers={"Authorization": f"Bearer {token_f1}"},
    )
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()


def test_farmer_cannot_jump_delivered_to_completed(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    admin_pw = hash_password(DEMO_PASS)
    admin_user = User(name="Admin User", phone="+919910000304", role=UserRole.admin, is_active=True, password_hash=admin_pw)
    data.db.add(admin_user)
    data.db.commit()

    token_admin = client.post("/api/auth/login", json={"identifier": "+919910000304", "password": DEMO_PASS}).json()["access_token"]
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "in_transit"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token_f2}"},
    )
    assert response.status_code == 409
