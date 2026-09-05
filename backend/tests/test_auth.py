"""Tests for authentication and RBAC."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.enums import UserRole
from app.utils.auth import hash_password

# Ensure tables exist for auth tests
_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _create_user(db_session, role: UserRole, phone: str = "+919900000001") -> dict:
    from app.models.user import User
    user = User(name=f"Test {role.value}", phone=phone, role=role, password_hash=hash_password("testpassword"), is_active=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return {"id": user.id, "phone": user.phone, "role": user.role.value}


def _get_token(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_login_valid_credentials():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000101")
        response = client.post("/api/auth/login", json={"identifier": "+919900000101", "password": "testpassword"})
        assert response.status_code == 200
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"
    finally:
        db_session.close()


def test_login_invalid_password():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000102")
        response = client.post("/api/auth/login", json={"identifier": "+919900000102", "password": "wrongpassword"})
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"
    finally:
        db_session.close()


def test_login_unknown_user():
    response = client.post("/api/auth/login", json={"identifier": "+919900000199", "password": "testpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_inactive_user():
    db_session = _Session()
    try:
        from app.models.user import User
        user = User(name="Inactive", phone="+919900000103", role=UserRole.farmer, password_hash=hash_password("testpassword"), is_active=False)
        db_session.add(user)
        db_session.commit()
        response = client.post("/api/auth/login", json={"identifier": "+919900000103", "password": "testpassword"})
        assert response.status_code == 403
        assert response.json()["detail"] == "Inactive user"
    finally:
        db_session.close()


def test_get_current_user_valid_token():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000104")
        token = _get_token("+919900000104")
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+919900000104"
        assert data["role"] == "farmer"
    finally:
        db_session.close()


def test_get_current_user_invalid_token():
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401


def test_get_current_user_missing_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_rbac_farmer_access():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000105")
        token = _get_token("+919900000105")
        response = client.post("/api/farmers/", json={"name": "RBAC Farmer", "phone": "+919900000106"}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 201
    finally:
        db_session.close()


def test_rbac_admin_access():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000107")
        token = _get_token("+919900000107")
        response = client.post("/api/farmers/", json={"name": "Admin Farmer", "phone": "+919900000108"}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 201
    finally:
        db_session.close()


def test_rbac_unauthenticated_access():
    response = client.post("/api/farmers/", json={"name": "No Auth", "phone": "+919900000109"})
    assert response.status_code == 401
