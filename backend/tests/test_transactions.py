"""Tests for Phase 3D.4: Transaction, Shipment, and Payment lifecycle."""
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

DEMO_PASS = "txnpass"
BUYER1_USER_PHONE = "+919910000111"
BUYER1_BUYER_PHONE = "+919910000112"
BUYER2_USER_PHONE = "+919910000121"
BUYER2_BUYER_PHONE = "+919910000122"
FARMER1_USER_PHONE = "+919910000131"
FARMER1_PHONE = "+919910000132"
FARMER2_USER_PHONE = "+919910000141"
FARMER2_PHONE = "+919910000142"


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


def test_transaction_created_from_accepted_offer(data):
    offer_id, txn = _create_accepted_offer(data)
    assert txn["status"] == "accepted"
    assert txn["quantity"] == 6000
    assert txn["agreed_price"] == 45.0
    assert txn["total_amount"] == 270000.0


def test_transaction_rejected_from_non_accepted_offer(data):
    token_b = _login(BUYER1_USER_PHONE)
    offer_id = client.post(
        "/api/offers/",
        json=_offer_payload(data.demand_onion.id, data.lot_onion.id),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()["id"]
    response = client.post(
        "/api/transactions/",
        json={
            "offer_id": offer_id,
            "lot_id": data.lot_onion.id,
            "buyer_id": data.buyer1.id,
            "farmer_id": data.farmer1.id,
            "quantity": 4000,
            "agreed_price": 28.0,
            "total_amount": 112000.0,
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 400


def test_duplicate_transaction_prevention(data):
    offer_id, _ = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    payload = {
        "offer_id": offer_id,
        "lot_id": data.lot_soy.id,
        "buyer_id": data.buyer1.id,
        "farmer_id": data.farmer2.id,
        "quantity": 6000,
        "agreed_price": 45.0,
        "total_amount": 270000.0,
    }
    response = client.post("/api/transactions/", json=payload, headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 409


def test_transaction_rbac_buyer(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    assert client.get(f"/api/transactions/{txn_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 200


def test_transaction_rbac_farmer(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    token_f2 = _login(FARMER2_USER_PHONE)
    assert client.get(f"/api/transactions/{txn_id}", headers={"Authorization": f"Bearer {token_f2}"}).status_code == 200


def test_transaction_rbac_unrelated_farmer(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    token_f1 = _login(FARMER1_USER_PHONE)
    assert client.get(f"/api/transactions/{txn_id}", headers={"Authorization": f"Bearer {token_f1}"}).status_code == 403


def test_valid_transaction_status_progression(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    assert txn["status"] == "accepted"

    progression = ["confirmed", "dispatched", "in_transit", "delivered", "payment_pending", "completed"]
    for status in progression:
        response = client.patch(
            f"/api/transactions/{txn_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert response.status_code == 200, f"Failed at {status}: {response.text}"
        assert response.json()["status"] == status


def test_invalid_transaction_status_transition(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 409


def test_shipment_creation(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    response = client.post(
        "/api/shipments/",
        json={
            "transaction_id": txn_id,
            "pickup_location": "Solapur Farm Gate",
            "delivery_location": "Pune Processing Unit",
            "transporter_name": "Maharashtra Logistics",
            "vehicle_number": "MH-12-AB-3456",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["transaction_id"] == txn_id
    assert body["status"] == "pending"


def test_shipment_status_update(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    shipment = client.post(
        "/api/shipments/",
        json={
            "transaction_id": txn_id,
            "pickup_location": "Solapur Farm Gate",
            "delivery_location": "Pune Processing Unit",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    shipment_id = shipment["id"]
    response = client.patch(
        f"/api/shipments/{shipment_id}/status",
        json={"status": "dispatched"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "dispatched"


def test_payment_creation(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    response = client.post(
        "/api/payments/",
        json={
            "transaction_id": txn_id,
            "amount": 270000.0,
            "payment_method": "bank_transfer",
            "reference": "TXN-2026-001234",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["amount"] == 270000.0
    assert body["status"] == "pending"


def test_payment_status_update(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]
    payment = client.post(
        "/api/payments/",
        json={
            "transaction_id": txn_id,
            "amount": 270000.0,
        },
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


def test_transaction_total_calculation(data):
    offer_id, txn = _create_accepted_offer(data)
    assert txn["total_amount"] == 6000 * 45.0


def test_invalid_total_amount(data):
    db_session = _Session()
    try:
        offer = create_offer(
            db_session,
            demand_id=data.demand_soy.id,
            lot_id=data.lot_soy.id,
            quantity=6000,
            offered_price=45.0,
            pickup_window="2026-09-10 to 2026-09-12",
            payment_terms="Net 3 days",
            message="Test offer",
            buyer_user_id=data.b1u.id,
        )
        accept_offer(db_session, offer_id=offer.id, actor_user_id=data.f2u.id, actor_role=UserRole.farmer)
        from app.models.transaction import Transaction
        existing = db_session.query(Transaction).filter(Transaction.offer_id == offer.id).first()
        if existing:
            db_session.delete(existing)
            db_session.commit()
        with pytest.raises(TransactionError):
            create_transaction(
                db_session,
                offer_id=offer.id,
                quantity=6000,
                agreed_price=45.0,
                total_amount=123456.0,
                actor_user_id=data.b1u.id,
            )
    finally:
        db_session.close()


def test_deterministic_transaction(data):
    token_b = _login(BUYER1_USER_PHONE)
    token_f2 = _login(FARMER2_USER_PHONE)

    def make_accepted():
        offer_id = client.post(
            "/api/offers/",
            json=_offer_payload(data.demand_soy.id, data.lot_soy.id, qty=6000, price=45.0),
            headers={"Authorization": f"Bearer {token_b}"},
        ).json()["id"]
        client.post(
            f"/api/offers/{offer_id}/accept",
            headers={"Authorization": f"Bearer {token_f2}"},
        )
        txn = client.get("/api/transactions/", headers={"Authorization": f"Bearer {token_b}"}).json()["items"][0]
        return offer_id, txn

    offer_a, txn_a = make_accepted()
    offer_b, txn_b = make_accepted()
    assert txn_a["quantity"] == txn_b["quantity"]
    assert txn_a["agreed_price"] == txn_b["agreed_price"]
    assert txn_a["total_amount"] == txn_b["total_amount"]


def _create_accepted_txn_and_payment(data, buyer_profile, farmer_profile, buyer_phone, farmer_phone, demand, lot, qty=6000, price=45.0, amount=270000.0):
    token_b = _login(buyer_phone)
    offer = client.post(
        "/api/offers/",
        json=_offer_payload(demand.id, lot.id, qty=qty, price=price),
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    offer_id = offer["id"]
    token_f = _login(farmer_phone)
    client.post(
        f"/api/offers/{offer_id}/accept",
        headers={"Authorization": f"Bearer {token_f}"},
    )
    token_b = _login(buyer_phone)
    txn = client.get("/api/transactions/", headers={"Authorization": f"Bearer {token_b}"}).json()["items"][0]
    payment = client.post(
        "/api/payments/",
        json={
            "transaction_id": txn["id"],
            "amount": amount,
            "payment_method": "bank_transfer",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    ).json()
    return payment


def test_payment_list_authentication_required(data):
    response = client.get("/api/payments/")
    assert response.status_code in (401, 403)


def test_payment_list_buyer_sees_own_payments(data):
    payment = _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_b = _login(BUYER1_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert any(p["id"] == payment["id"] for p in body["items"])


def test_payment_list_buyer_scoped_from_other_buyers(data):
    _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_b2 = _login(BUYER2_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b2}"})
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_payment_list_farmer_sees_own_payments(data):
    payment = _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_f2 = _login(FARMER2_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_f2}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert any(p["id"] == payment["id"] for p in body["items"])


def test_payment_list_farmer_scoped_from_other_farmers(data):
    _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_f1}"})
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_payment_list_admin_sees_all_payments(data):
    pw = hash_password(DEMO_PASS)
    admin_user = User(name="Admin User", phone="+919910000001", role=UserRole.admin, is_active=True, password_hash=pw)
    data.db.add(admin_user)
    data.db.commit()
    _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer1, BUYER1_USER_PHONE, FARMER1_USER_PHONE,
        data.demand_onion, data.lot_onion, qty=4000, price=45.0, amount=180000.0,
    )
    _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_admin = _login("+919910000001")
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_admin}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 2


def test_payment_list_empty(data):
    token_b = _login(BUYER1_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 0
    assert body["items"] == []


def test_payment_list_deterministic(data):
    payment1 = _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer1, BUYER1_USER_PHONE, FARMER1_USER_PHONE,
        data.demand_onion, data.lot_onion, qty=4000, price=45.0, amount=180000.0,
    )
    payment2 = _create_accepted_txn_and_payment(
        data, data.buyer1, data.farmer2, BUYER1_USER_PHONE, FARMER2_USER_PHONE,
        data.demand_soy, data.lot_soy,
    )
    token_b = _login(BUYER1_USER_PHONE)
    response1 = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    response2 = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    assert response1.status_code == 200
    assert response2.status_code == 200
    body1 = response1.json()
    body2 = response2.json()
    assert body1["total"] == body2["total"]
    ids1 = [p["id"] for p in body1["items"]]
    ids2 = [p["id"] for p in body2["items"]]
    assert ids1 == ids2


def test_delivered_transition_succeeds(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]

    for status in ["confirmed", "dispatched", "in_transit", "delivered"]:
        response = client.patch(
            f"/api/transactions/{txn_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert response.status_code == 200, f"Failed at {status}: {response.text}"
        assert response.json()["status"] == status


def test_delivered_creates_payment_exactly_once(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]

    for status in ["confirmed", "dispatched", "in_transit", "delivered"]:
        client.patch(
            f"/api/transactions/{txn_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {token_b}"},
        )

    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    payment = body["items"][0]
    assert payment["transaction_id"] == txn_id
    assert payment["amount"] == txn["total_amount"]
    assert payment["status"] == "pending"


def test_repeating_delivered_does_not_duplicate_payment(data):
    offer_id, txn = _create_accepted_offer(data)
    token_b = _login(BUYER1_USER_PHONE)
    txn_id = txn["id"]

    for status in ["confirmed", "dispatched", "in_transit", "delivered"]:
        client.patch(
            f"/api/transactions/{txn_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {token_b}"},
        )

    response = client.patch(
        f"/api/transactions/{txn_id}/status",
        json={"status": "delivered"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 409

    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_farmer_sees_auto_created_payment_after_delivery(data):
    offer_id, txn = _create_accepted_offer(data)
    token_f2 = _login(FARMER2_USER_PHONE)
    txn_id = txn["id"]

    for status in ["confirmed", "dispatched", "in_transit", "delivered"]:
        client.patch(
            f"/api/transactions/{txn_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {token_f2}"},
        )

    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_f2}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    payment = body["items"][0]
    assert payment["transaction_id"] == txn_id
    assert payment["status"] == "pending"


def test_reconcile_missing_payment_for_seeded_completed_transaction(data):
    from app.models.transaction import Transaction
    from app.services.transactions import reconcile_missing_payments

    db_session = _Session()
    try:
        completed_txn = Transaction(
            offer_id=data.demand_onion.id,
            lot_id=data.lot_onion.id,
            buyer_id=data.buyer1.id,
            farmer_id=data.farmer1.id,
            quantity=4000,
            agreed_price=26.0,
            total_amount=104000.0,
            status=TransactionStatus.completed,
        )
        db_session.add(completed_txn)
        db_session.commit()
        db_session.refresh(completed_txn)

        reconcile_missing_payments(db_session)

        from app.models.payment import Payment
        payment = db_session.query(Payment).filter(Payment.transaction_id == completed_txn.id).first()
        assert payment is not None
        assert payment.amount == 104000.0
        assert payment.status == "pending"
    finally:
        db_session.close()

    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.get("/api/payments/", headers={"Authorization": f"Bearer {token_f1}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert any(p["transaction_id"] == completed_txn.id for p in body["items"])
