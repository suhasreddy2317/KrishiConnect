"""Tests for the admin users listing endpoint."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.enums import UserRole
from app.models.user import User
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

USER_RESPONSE_FIELDS = {"id", "name", "phone", "email", "role", "is_active", "created_at", "updated_at"}


def _create_user(db_session, role: UserRole, phone: str = "+919900000001") -> dict:
    user = User(
        name=f"Test {role.value}",
        phone=phone,
        role=role,
        password_hash=hash_password("testpassword"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return {"id": user.id, "phone": user.phone, "role": user.role.value}


def _get_token(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_can_list_users():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000201")
        token = _get_token("+919900000201")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/users/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for entry in data:
            assert "password_hash" not in entry
            assert set(entry.keys()) == USER_RESPONSE_FIELDS
    finally:
        db_session.close()


def test_unauthenticated_request_returns_401():
    response = client.get("/api/users/")
    assert response.status_code == 401


def test_non_admin_request_returns_403():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.farmer, "+919900000202")
        token = _get_token("+919900000202")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/users/", headers=headers)
        assert response.status_code == 403
    finally:
        db_session.close()


def test_password_hash_never_returned():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000203")
        token = _get_token("+919900000203")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/users/", headers=headers)
        assert response.status_code == 200
        raw = response.content.decode()
        assert "password_hash" not in raw
        data = response.json()
        for entry in data:
            assert "password_hash" not in entry
    finally:
        db_session.close()


def test_response_is_plain_array_with_expected_fields():
    db_session = _Session()
    try:
        _create_user(db_session, UserRole.admin, "+919900000204")
        token = _get_token("+919900000204")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/users/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for entry in data:
            assert set(entry.keys()) == USER_RESPONSE_FIELDS
    finally:
        db_session.close()
