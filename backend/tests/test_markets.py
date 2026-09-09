"""Tests for markets API endpoint and admin market data access."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.commodity import Commodity
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _create_user(db_session, role, phone="+919900000301"):
    from app.models.enums import UserRole
    from app.models.user import User
    user = User(name=f"Test {role.value}", phone=phone, role=role, password_hash=hash_password("testpassword"), is_active=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _get_token(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_list_markets_requires_auth():
    response = client.get("/api/markets/")
    assert response.status_code == 401


def test_list_markets_authenticated():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.admin)
        token = _get_token(user.phone)

        market = Market(name="Test Market", location="Test Location", region="Test Region", state="Test State", is_active=True)
        db_session.add(market)
        db_session.commit()

        response = client.get("/api/markets/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(m["name"] == "Test Market" for m in data)
    finally:
        db_session.close()


def test_list_markets_returns_ordered():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.admin)
        token = _get_token(user.phone)

        db_session.add_all([
            Market(name="Z Market", state="Test"),
            Market(name="A Market", state="Test"),
        ])
        db_session.commit()

        response = client.get("/api/markets/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data[0]["name"] == "A Market"
        assert data[1]["name"] == "Z Market"
    finally:
        db_session.close()


def test_api_market_price_history_admin_access():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.admin)
        token = _get_token(user.phone)

        commodity = Commodity(name="Admin Test Crop", unit="kg", is_perishable=True)
        market = Market(name="Admin Test Market", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = __import__('datetime').date.today()
        prices = []
        for i in range(5):
            d = today - __import__('datetime').timedelta(days=i)
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=100.0,
                max_price=200.0,
                modal_price=150.0,
                arrival_volume=100.0,
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        response = client.get(
            f"/api/market-prices/history?commodity_id={commodity.id}&market_id={market.id}&days=7",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 5
        assert len(data["history"]) == 5
        assert data["history"][0]["modal_price"] == 150.0
    finally:
        db_session.close()
