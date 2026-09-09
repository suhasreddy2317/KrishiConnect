"""Tests for existing farmer and lot API endpoints."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.utils.auth import hash_password

# Ensure tables exist for API tests
_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _get_auth_headers(db_session) -> tuple[dict, int]:
    from app.models.enums import UserRole
    from app.models.farmer import Farmer
    from app.models.user import User

    user = User(name="Test User", phone="+919900000001", role=UserRole.farmer, password_hash=hash_password("testpassword"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    farmer = Farmer(name="Test Farmer", phone=user.phone, user_id=user.id)
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)

    response = client.post("/api/auth/login", json={"identifier": user.phone, "password": "testpassword"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, farmer.id


def test_create_farmer():
    db_session = _Session()
    try:
        headers = _get_auth_headers(db_session)[0]
        payload = {
            "name": "Test Farmer",
            "phone": "+919900000002",
            "village": "Nashik",
            "district": "Nashik",
            "state": "Maharashtra",
        }
        response = client.post("/api/farmers/", json=payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Farmer"
        assert data["phone"] == "+919900000002"
        assert "id" in data
    finally:
        db_session.close()


def test_get_farmer_not_found():
    db_session = _Session()
    try:
        headers = _get_auth_headers(db_session)[0]
        response = client.get("/api/farmers/99999", headers=headers)
        assert response.status_code == 404
    finally:
        db_session.close()


def test_create_lot():
    db_session = _Session()
    try:
        headers, farmer_id = _get_auth_headers(db_session)
        lot_payload = {
            "farmer_id": farmer_id,
            "crop": "Wheat",
            "quantity_kg": 5000,
            "quality_grade": "Grade A",
            "harvest_date": "2026-08-15",
            "expected_price_per_kg": 24.0,
        }
        response = client.post("/api/lots/", json=lot_payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["crop"] == "Wheat"
        assert data["farmer_id"] == farmer_id
        assert "id" in data
    finally:
        db_session.close()


def test_get_lots():
    db_session = _Session()
    try:
        headers = _get_auth_headers(db_session)[0]
        response = client.get("/api/lots/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    finally:
        db_session.close()


def test_get_lot_not_found():
    db_session = _Session()
    try:
        headers = _get_auth_headers(db_session)[0]
        response = client.get("/api/lots/99999", headers=headers)
        assert response.status_code == 404
    finally:
        db_session.close()


def test_lot_status_default():
    db_session = _Session()
    try:
        headers, farmer_id = _get_auth_headers(db_session)
        lot_payload = {
            "farmer_id": farmer_id,
            "crop": "Tomato",
            "quantity_kg": 1000,
            "quality_grade": "Grade A",
        }
        response = client.post("/api/lots/", json=lot_payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "published"
    finally:
        db_session.close()


def test_create_lot_farmer_without_farmer_id():
    db_session = _Session()
    try:
        headers, farmer_id = _get_auth_headers(db_session)
        lot_payload = {
            "crop": "Wheat",
            "quantity_kg": 5000,
            "quality_grade": "Grade A",
        }
        response = client.post("/api/lots/", json=lot_payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["crop"] == "Wheat"
        assert data["farmer_id"] == farmer_id
        assert "id" in data
    finally:
        db_session.close()


def test_create_lot_farmer_ignores_client_farmer_id():
    db_session = _Session()
    try:
        headers, farmer1_id = _get_auth_headers(db_session)
        farmer2_payload = {"name": "Farmer B", "phone": "+919900000002"}
        farmer2_response = client.post("/api/farmers/", json=farmer2_payload, headers=headers)
        assert farmer2_response.status_code == 201
        farmer2_id = farmer2_response.json()["id"]

        lot_payload = {
            "farmer_id": farmer2_id,
            "crop": "Wheat",
            "quantity_kg": 5000,
            "quality_grade": "Grade A",
        }
        response = client.post("/api/lots/", json=lot_payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["farmer_id"] == farmer1_id
    finally:
        db_session.close()
