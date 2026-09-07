"""Tests for the voice assistant intent router endpoint."""
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.commodity import Commodity
from app.models.enums import UserRole
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.models.produce_lot import ProduceLot
from app.models.farmer import Farmer
from app.models.user import User
from app.models.buyer import Buyer
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _create_user(db_session, role, phone="+919900000801"):
    user = User(
        name=f"Voice Test {role.value}",
        phone=phone,
        role=role,
        password_hash=hash_password("testpassword"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _get_token(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def _create_farmer(db_session, user: User) -> Farmer:
    farmer = Farmer(user_id=user.id, name=user.name, phone=user.phone)
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)
    return farmer


def _seed_lot_and_prices(db_session, farmer_id, commodity_name="Tomato", market_name="Pune APMC"):
    commodity = Commodity(name=commodity_name, unit="kg", is_perishable=True, perishability_profile="7-10 days")
    market = Market(name=market_name, state="Maharashtra")
    db_session.add_all([commodity, market])
    db_session.flush()

    lot = ProduceLot(
        farmer_id=farmer_id,
        commodity_id=commodity.id,
        crop=commodity_name,
        quantity_kg=100,
        unit="kg",
        quality_grade="A",
        status="published",
        location=market_name,
    )
    db_session.add(lot)
    db_session.flush()

    today = date.today()
    prices = []
    for i in range(10):
        d = today - timedelta(days=i)
        base = 2000 + i * 100
        prices.append(MarketPrice(
            market_id=market.id,
            commodity_id=commodity.id,
            price_date=d,
            min_price=float(base),
            max_price=float(base + 200),
            modal_price=float(base + 100),
            arrival_volume=100.0,
            source="seeded_demo",
        ))
    db_session.add_all(prices)
    db_session.commit()

    return farmer_id, lot.id, commodity.id, market.id


class TestVoiceQueryAuth:
    def test_requires_auth(self):
        response = client.post(
            "/api/voice/query",
            json={"query": "When should I sell?"},
        )
        assert response.status_code == 401

    def test_rejects_buyer_role(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.buyer, "+919900000802")
            buyer = Buyer(user_id=user.id, business_name="Test Buyer", phone=user.phone)
            db_session.add(buyer)
            db_session.commit()
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "When should I sell?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403
        finally:
            db_session.close()

    def test_rejects_without_farmer_profile(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000803")
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "When should I sell?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 404
        finally:
            db_session.close()


class TestVoiceQueryIntents:
    def test_help_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000804")
            farmer = _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "Can you help me?", "language": "en"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "help"
            assert data["data"] is None
        finally:
            db_session.close()

    def test_my_lots_no_lots(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000805")
            _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "What are my lots?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "my_lots"
            assert data["data"]["count"] == 0
        finally:
            db_session.close()

    def test_my_lots_with_lots(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000806")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "What are my lots?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "my_lots"
            assert data["data"]["count"] == 1
        finally:
            db_session.close()

    def test_recommendation_with_lot(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000807")
            farmer = _create_farmer(db_session, user)
            _, lot_id, _, _ = _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "When should I sell?", "lot_id": lot_id},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
            assert "score" in data["data"]
            assert "verdict" in data["data"]
        finally:
            db_session.close()

    def test_recommendation_no_lot_id_uses_first_lot(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000808")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "When should I sell my tomatoes?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
            assert data["data"]["available"] is True
        finally:
            db_session.close()

    def test_offers_no_offers(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000809")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "Do I have any buyer offers?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "offers"
            assert data["data"]["count"] == 0
        finally:
            db_session.close()

    def test_shipments_no_transactions(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000810")
            _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "Where are my shipments?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "shipments"
            assert data["data"]["count"] == 0
        finally:
            db_session.close()

    def test_payments_no_transactions(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000811")
            _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "What payments have I received?"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "payments"
            assert data["data"]["count"] == 0
        finally:
            db_session.close()

    def test_market_price_with_lot(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000812")
            farmer = _create_farmer(db_session, user)
            _, lot_id, _, _ = _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "What is today's tomato price?", "lot_id": lot_id},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "market_price"
            assert data["data"]["available"] is True
            assert "latest_price" in data["data"]
        finally:
            db_session.close()

    def test_fallback_for_unrecognized_query(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000813")
            _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "random gibberish xyzabc"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "unknown"
            assert "try asking" in data["text"].lower() or "asking" in data["text"].lower()
        finally:
            db_session.close()

    def test_english_recommendation_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000814")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "When should I sell?", "language": "en"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
            assert data["action_hint"] is not None
        finally:
            db_session.close()

    def test_hindi_recommendation_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000815")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "बेचना चाहिए टमाटर", "language": "hi"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
        finally:
            db_session.close()

    def test_kannada_recommendation_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000816")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "ಟೊಮೇಟೊ ಮಾರಬೇಕು", "language": "kn"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
        finally:
            db_session.close()

    def test_telugu_recommendation_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000817")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "టమాట అమ్మాలి", "language": "te"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "recommendation"
        finally:
            db_session.close()

    def test_english_market_price_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000818")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "What is today's tomato price?", "language": "en"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "market_price"
            assert data["action_hint"] is not None
        finally:
            db_session.close()

    def test_hindi_market_price_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000819")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "आज की कीमत टमाटर", "language": "hi"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "market_price"
        finally:
            db_session.close()

    def test_kannada_market_price_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000820")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "ಟೊಮೇಟೊ ಬೆಲೆ ಇಂದು", "language": "kn"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "market_price"
        finally:
            db_session.close()

    def test_telugu_market_price_intent(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000821")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "టమాట ధర ఈరోజు", "language": "te"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "market_price"
        finally:
            db_session.close()

    def test_action_hint_values(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000822")
            farmer = _create_farmer(db_session, user)
            _seed_lot_and_prices(db_session, farmer.id)
            token = _get_token(user.phone)

            intents_and_queries = [
                ("recommendation", "When should I sell?"),
                ("market_price", "What is the price today?"),
                ("my_lots", "Show my lots"),
                ("offers", "Do I have any offers?"),
                ("buyers", "Who are the buyers?"),
                ("shipments", "Where are my shipments?"),
                ("payments", "What payments have I received?"),
                ("help", "Can you help me?"),
            ]
            for intent, query in intents_and_queries:
                response = client.post(
                    "/api/voice/query",
                    json={"query": query, "language": "en"},
                    headers={"Authorization": f"Bearer {token}"},
                )
                assert response.status_code == 200
                data = response.json()
                assert data["intent"] == intent
                if intent != "help":
                    assert data["action_hint"] is not None, f"action_hint missing for {intent}"
                    assert len(data["action_hint"]) > 0
        finally:
            db_session.close()

    def test_unknown_query_fallback(self):
        db_session = _Session()
        try:
            user = _create_user(db_session, UserRole.farmer, "+919900000823")
            _create_farmer(db_session, user)
            token = _get_token(user.phone)

            response = client.post(
                "/api/voice/query",
                json={"query": "xyz gibberish random nonsense"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == "unknown"
        finally:
            db_session.close()
