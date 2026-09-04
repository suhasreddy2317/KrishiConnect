"""Tests for existing farmer and lot API endpoints."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app

# Ensure tables exist for API tests
_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def test_create_farmer():
    payload = {
        "name": "Test Farmer",
        "phone": "+919900000001",
        "village": "Nashik",
        "district": "Nashik",
        "state": "Maharashtra",
    }
    response = client.post("/api/farmers/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Farmer"
    assert data["phone"] == "+919900000001"
    assert "id" in data


def test_get_farmer_not_found():
    response = client.get("/api/farmers/99999")
    assert response.status_code == 404


def test_create_lot():
    farmer_payload = {"name": "Lot Farmer", "phone": "+919900000002"}
    farmer_response = client.post("/api/farmers/", json=farmer_payload)
    assert farmer_response.status_code == 201
    farmer_id = farmer_response.json()["id"]

    lot_payload = {
        "farmer_id": farmer_id,
        "crop": "Wheat",
        "quantity_kg": 5000,
        "quality_grade": "Grade A",
        "harvest_date": "2026-08-15",
        "expected_price_per_kg": 24.0,
    }
    response = client.post("/api/lots/", json=lot_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["crop"] == "Wheat"
    assert data["farmer_id"] == farmer_id
    assert "id" in data


def test_get_lots():
    response = client.get("/api/lots/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_lot_not_found():
    response = client.get("/api/lots/99999")
    assert response.status_code == 404


def test_lot_status_default():
    farmer_payload = {"name": "Status Farmer", "phone": "+919900000003"}
    farmer_response = client.post("/api/farmers/", json=farmer_payload)
    farmer_id = farmer_response.json()["id"]

    lot_payload = {
        "farmer_id": farmer_id,
        "crop": "Tomato",
        "quantity_kg": 1000,
        "quality_grade": "Grade A",
    }
    response = client.post("/api/lots/", json=lot_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "available"
