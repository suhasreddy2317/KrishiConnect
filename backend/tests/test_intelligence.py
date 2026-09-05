"""Tests for price intelligence and sale window score."""
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.commodity import Commodity
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.models.storage_option import StorageOption
from app.services.price_intelligence import get_price_intelligence
from app.services.sale_window import calculate_sale_window_score
from app.utils.auth import hash_password

# Ensure tables exist
_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _create_user(db_session, role, phone="+919900000101"):
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


def _seed_price_data(db_session, commodity_id, market_id, days=10):
    today = date.today()
    prices = []
    for i in range(days):
        d = today - timedelta(days=i)
        base = 2000 + (i % 5) * 50
        prices.append(MarketPrice(
            market_id=market_id,
            commodity_id=commodity_id,
            price_date=d,
            min_price=float(base),
            max_price=float(base + 200),
            modal_price=float(base + 100),
            arrival_volume=float(100 + i * 10),
            source="seeded_demo",
        ))
    db_session.add_all(prices)
    db_session.commit()


def test_price_intelligence_latest_and_average():
    db_session = _Session()
    try:
        commodity = Commodity(name="Test Crop", unit="kg", is_perishable=True)
        market = Market(name="Test Market", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        _seed_price_data(db_session, commodity.id, market.id, days=10)
        result = get_price_intelligence(db_session, commodity.id, market.id)

        assert result["latest_modal_price"] is not None
        assert result["recent_avg_price"] is not None
        assert result["previous_avg_price"] is not None
        assert result["trend"] in ("rising", "falling", "flat", "insufficient_data", "unknown")
        assert result["confidence"] in ("high", "medium", "low")
    finally:
        db_session.close()


def test_price_intelligence_insufficient_data():
    db_session = _Session()
    try:
        commodity = Commodity(name="Test Crop 2", unit="kg", is_perishable=True)
        market = Market(name="Test Market 2", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        _seed_price_data(db_session, commodity.id, market.id, days=2)
        result = get_price_intelligence(db_session, commodity.id, market.id)

        assert result["trend"] == "insufficient_data"
        assert result["confidence"] == "low"
    finally:
        db_session.close()


def test_price_intelligence_missing_commodity():
    db_session = _Session()
    try:
        result = get_price_intelligence(db_session, 99999, 99999)
        assert "error" in result
        assert result["trend"] == "unknown"
    finally:
        db_session.close()


def test_sale_window_score_rising_trend():
    db_session = _Session()
    try:
        commodity = Commodity(name="Red Onion", unit="kg", is_perishable=True, perishability_profile="2-3 weeks")
        market = Market(name="Lasalgaon APMC", state="Maharashtra")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 2500 + i * 100
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(base),
                max_price=float(base + 200),
                modal_price=float(base + 100),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        result = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert 0 <= result["score"] <= 100
        assert result["verdict"] in ("SELL_NOW", "SELL_SOON", "WAIT", "STORE")
        assert len(result["reasons"]) >= 1
        assert len(result["factors"]) >= 4
        assert result["algorithm"]["weights"]["price_trend"] == 40
    finally:
        db_session.close()


def test_sale_window_score_falling_trend():
    db_session = _Session()
    try:
        commodity = Commodity(name="Tomato", unit="kg", is_perishable=True, perishability_profile="7-10 days")
        market = Market(name="Pune APMC", state="Maharashtra")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 3000 - i * 150
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(max(0, base - 200)),
                max_price=float(base + 200),
                modal_price=float(base),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        result = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert 0 <= result["score"] <= 100
        assert result["verdict"] in ("SELL_NOW", "SELL_SOON", "WAIT", "STORE")
    finally:
        db_session.close()


def test_sale_window_score_non_perishable():
    db_session = _Session()
    try:
        commodity = Commodity(name="Wheat", unit="kg", is_perishable=False, perishability_profile="12+ months")
        market = Market(name="Ahmednagar APMC", state="Maharashtra")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 2000
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(base - 100),
                max_price=float(base + 100),
                modal_price=float(base),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        result = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert 0 <= result["score"] <= 100
        perishable_factors = [f for f in result["factors"] if f["name"] == "Perishability"]
        assert len(perishable_factors) == 1
        assert perishable_factors[0]["contribution"] <= 10
    finally:
        db_session.close()


def test_sale_window_score_storage_available():
    db_session = _Session()
    try:
        commodity = Commodity(name="Soybean", unit="kg", is_perishable=False)
        market = Market(name="Solapur APMC", state="Maharashtra")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 4000
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(base - 100),
                max_price=float(base + 100),
                modal_price=float(base),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)

        storage = StorageOption(name="Pune Warehouse", location="Pune", commodity_suitability="Soybean, Wheat", cost_per_quintal=80, is_available=True)
        db_session.add(storage)
        db_session.commit()

        result = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert 0 <= result["score"] <= 100
        storage_factors = [f for f in result["factors"] if f["name"] == "Storage Access"]
        assert len(storage_factors) == 1
        assert storage_factors[0]["contribution"] >= 10
    finally:
        db_session.close()


def test_sale_window_score_bounded():
    db_session = _Session()
    try:
        commodity = Commodity(name="Test Bounded", unit="kg", is_perishable=True)
        market = Market(name="Test Market Bounded", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=1000000.0,
                max_price=1000000.0,
                modal_price=1000000.0,
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        result = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert 0 <= result["score"] <= 100
    finally:
        db_session.close()


def test_sale_window_score_deterministic():
    db_session = _Session()
    try:
        commodity = Commodity(name="Test Deterministic", unit="kg", is_perishable=True)
        market = Market(name="Test Market Deterministic", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 2000 + (i % 3) * 100
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(base),
                max_price=float(base + 200),
                modal_price=float(base + 100),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        result1 = calculate_sale_window_score(db_session, commodity.id, market.id)
        result2 = calculate_sale_window_score(db_session, commodity.id, market.id)
        assert result1["score"] == result2["score"]
        assert result1["verdict"] == result2["verdict"]
    finally:
        db_session.close()


def test_api_sale_window_requires_auth():
    response = client.get("/api/recommendations/sale-window?commodity_id=1&market_id=1")
    assert response.status_code == 401


def test_api_sale_window_authenticated():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.farmer)
        token = _get_token(user.phone)

        commodity = Commodity(name="API Test Crop", unit="kg", is_perishable=True)
        market = Market(name="API Test Market", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(10):
            d = today - timedelta(days=i)
            base = 2000 + i * 50
            prices.append(MarketPrice(
                market_id=market.id,
                commodity_id=commodity.id,
                price_date=d,
                min_price=float(base),
                max_price=float(base + 200),
                modal_price=float(base + 100),
                arrival_volume=float(100),
                source="seeded_demo",
            ))
        db_session.add_all(prices)
        db_session.commit()

        response = client.get(
            f"/api/recommendations/sale-window?commodity_id={commodity.id}&market_id={market.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "score" in data
        assert "verdict" in data
        assert "reasons" in data
        assert data["verdict"] in ("SELL_NOW", "SELL_SOON", "WAIT", "STORE")
    finally:
        db_session.close()


def test_api_price_history_requires_auth():
    response = client.get("/api/market-prices/history?commodity_id=1&market_id=1")
    assert response.status_code == 401


def test_api_price_history_authenticated():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.farmer)
        token = _get_token(user.phone)

        commodity = Commodity(name="History Test Crop", unit="kg", is_perishable=True)
        market = Market(name="History Test Market", state="Test")
        db_session.add_all([commodity, market])
        db_session.flush()

        today = date.today()
        prices = []
        for i in range(5):
            d = today - timedelta(days=i)
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
    finally:
        db_session.close()


def test_api_price_history_invalid_days():
    db_session = _Session()
    try:
        from app.models.enums import UserRole
        user = _create_user(db_session, UserRole.farmer)
        token = _get_token(user.phone)

        response = client.get(
            "/api/market-prices/history?commodity_id=1&market_id=1&days=200",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 400
    finally:
        db_session.close()
