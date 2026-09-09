"""Tests for the admin system health endpoint."""
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.enums import DisputeStatus, TransactionStatus, UserRole
from app.models.user import User
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

HEALTH_RESPONSE_FIELDS = {"status", "api", "database", "market_data", "users", "transactions", "payments", "shipments", "disputes", "audit"}


def _create_user(db_session, role: UserRole, phone: str = "+919900000001", is_active: bool = True) -> User:
    user = User(
        name=f"Test {role.value}",
        phone=phone,
        role=role,
        password_hash=hash_password("testpassword"),
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _get_token(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_gets_200():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000301")
        token = _get_token("+919900000301")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
    finally:
        db_session.close()


def test_unauthenticated_returns_401():
    response = client.get("/api/admin/health")
    assert response.status_code == 401


def test_non_admin_returns_403():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000302")
        token = _get_token("+919900000302")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 403
    finally:
        db_session.close()


def test_response_has_expected_structure():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000303")
        token = _get_token("+919900000303")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert set(data.keys()) == HEALTH_RESPONSE_FIELDS
        assert data["status"] in ("healthy", "degraded")
        assert data["api"]["status"] == "operational"
        assert data["database"]["status"] in ("connected", "error")
        assert data["market_data"]["status"] in ("fresh", "stale", "no_data")
        assert "latest_timestamp" in data["market_data"]
        assert isinstance(data["users"]["total"], int)
        assert isinstance(data["users"]["active"], int)
        assert isinstance(data["transactions"]["total"], int)
        assert isinstance(data["transactions"]["pending"], int)
        assert isinstance(data["payments"]["total"], int)
        assert isinstance(data["payments"]["pending"], int)
        assert isinstance(data["shipments"]["total"], int)
        assert isinstance(data["shipments"]["pending"], int)
        assert isinstance(data["disputes"]["total"], int)
        assert isinstance(data["disputes"]["open"], int)
        assert isinstance(data["audit"]["events_last_24h"], int)
    finally:
        db_session.close()


def test_user_counts_are_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000304")
        _create_user(db_session, UserRole.farmer, "+919900000305", is_active=True)
        _create_user(db_session, UserRole.buyer, "+919900000306", is_active=False)
        token = _get_token("+919900000304")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["users"]["total"] == 3
        assert data["users"]["active"] == 2
    finally:
        db_session.close()


def test_transaction_counts_are_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000307")
        from app.models.transaction import Transaction
        txn1 = Transaction(
            offer_id=1,
            lot_id=1,
            buyer_id=1,
            farmer_id=1,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.pending,
        )
        txn2 = Transaction(
            offer_id=2,
            lot_id=2,
            buyer_id=2,
            farmer_id=2,
            quantity=200,
            agreed_price=40.0,
            total_amount=8000.0,
            status=TransactionStatus.completed,
        )
        db_session.add_all([txn1, txn2])
        db_session.commit()
        token = _get_token("+919900000307")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["transactions"]["total"] == 2
        assert data["transactions"]["pending"] == 1
    finally:
        db_session.close()


def test_payment_counts_are_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000308")
        from app.models.payment import Payment
        from app.models.transaction import Transaction
        txn1 = Transaction(
            offer_id=3,
            lot_id=3,
            buyer_id=3,
            farmer_id=3,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.completed,
        )
        txn2 = Transaction(
            offer_id=4,
            lot_id=4,
            buyer_id=4,
            farmer_id=4,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.completed,
        )
        db_session.add_all([txn1, txn2])
        db_session.commit()
        db_session.refresh(txn1)
        db_session.refresh(txn2)
        p1 = Payment(transaction_id=txn1.id, amount=5000.0, status="pending")
        p2 = Payment(transaction_id=txn2.id, amount=5000.0, status="confirmed")
        db_session.add_all([p1, p2])
        db_session.commit()
        token = _get_token("+919900000308")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["payments"]["total"] == 2
        assert data["payments"]["pending"] == 1
    finally:
        db_session.close()


def test_shipment_counts_are_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000309")
        from app.models.shipment import Shipment
        from app.models.transaction import Transaction
        txn1 = Transaction(
            offer_id=5,
            lot_id=5,
            buyer_id=5,
            farmer_id=5,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.completed,
        )
        txn2 = Transaction(
            offer_id=6,
            lot_id=6,
            buyer_id=6,
            farmer_id=6,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.completed,
        )
        db_session.add_all([txn1, txn2])
        db_session.commit()
        db_session.refresh(txn1)
        db_session.refresh(txn2)
        s1 = Shipment(transaction_id=txn1.id, pickup_location="A", delivery_location="B", status="pending")
        s2 = Shipment(transaction_id=txn2.id, pickup_location="A", delivery_location="B", status="delivered")
        db_session.add_all([s1, s2])
        db_session.commit()
        token = _get_token("+919900000309")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["shipments"]["total"] == 2
        assert data["shipments"]["pending"] == 1
    finally:
        db_session.close()


def test_dispute_counts_are_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000310")
        from app.models.dispute import Dispute
        from app.models.transaction import Transaction
        txn = Transaction(
            offer_id=5,
            lot_id=5,
            buyer_id=5,
            farmer_id=5,
            quantity=100,
            agreed_price=50.0,
            total_amount=5000.0,
            status=TransactionStatus.completed,
        )
        db_session.add(txn)
        db_session.commit()
        db_session.refresh(txn)
        d1 = Dispute(transaction_id=txn.id, opened_by_user_id=1, reason="quality", status=DisputeStatus.open)
        d2 = Dispute(transaction_id=txn.id, opened_by_user_id=1, reason="quality", status=DisputeStatus.resolved)
        db_session.add_all([d1, d2])
        db_session.commit()
        token = _get_token("+919900000310")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["disputes"]["total"] == 2
        assert data["disputes"]["open"] == 1
    finally:
        db_session.close()


def test_audit_last_24h_count_is_real():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000311")
        from app.models.audit_log import AuditLog
        now = datetime.utcnow()
        old_log = AuditLog(action="old.action", entity_type="test", entity_id=1, created_at=now - timedelta(days=2))
        new_log = AuditLog(action="new.action", entity_type="test", entity_id=2, created_at=now - timedelta(hours=1))
        db_session.add_all([old_log, new_log])
        db_session.commit()
        token = _get_token("+919900000311")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["audit"]["events_last_24h"] == 1
    finally:
        db_session.close()


def test_market_data_no_data():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000312")
        token = _get_token("+919900000312")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["market_data"]["status"] == "no_data"
        assert data["market_data"]["latest_timestamp"] is None
    finally:
        db_session.close()


def test_market_data_freshness():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000313")
        from app.models.market_price import MarketPrice
        now = datetime.utcnow()
        fresh_price = MarketPrice(
            market_id=1,
            commodity_id=1,
            price_date=now.date(),
            min_price=10.0,
            max_price=20.0,
            modal_price=15.0,
            source="test",
            created_at=now - timedelta(days=1),
        )
        stale_price = MarketPrice(
            market_id=1,
            commodity_id=1,
            price_date=(now - timedelta(days=30)).date(),
            min_price=10.0,
            max_price=20.0,
            modal_price=15.0,
            source="test",
            created_at=now - timedelta(days=30),
        )
        db_session.add_all([fresh_price, stale_price])
        db_session.commit()
        token = _get_token("+919900000313")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["market_data"]["status"] == "fresh"
        assert data["market_data"]["latest_timestamp"] is not None
    finally:
        db_session.close()


def test_market_data_stale():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000314")
        from app.models.market_price import MarketPrice
        now = datetime.utcnow()
        stale_price = MarketPrice(
            market_id=1,
            commodity_id=1,
            price_date=(now - timedelta(days=30)).date(),
            min_price=10.0,
            max_price=20.0,
            modal_price=15.0,
            source="test",
            created_at=now - timedelta(days=30),
        )
        db_session.add(stale_price)
        db_session.commit()
        token = _get_token("+919900000314")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["market_data"]["status"] == "stale"
        assert data["market_data"]["latest_timestamp"] is not None
    finally:
        db_session.close()


def test_no_sensitive_fields_returned():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000315")
        token = _get_token("+919900000315")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/health", headers=headers)
        assert response.status_code == 200
        data = response.json()
        sensitive_fields = {"password_hash", "jwt_secret", "database_url", "sql_errors", "phone", "email"}
        response_text = str(data)
        for field in sensitive_fields:
            assert field not in response_text
    finally:
        db_session.close()
