"""Tests for the Demand domain (Phase 3D.1): model, API + RBAC, and grade matching."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.enums import GradeCompatibility, UserRole
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)


def _create_user_and_buyer(db_session, role: UserRole, phone: str, business_name: str = "Test Buyer"):
    from app.models.user import User
    from app.models.buyer import Buyer
    from app.models.commodity import Commodity

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

    commodity = db_session.query(Commodity).first()
    if commodity is None:
        commodity = Commodity(name="Red Onion", variety="Local", unit="kg", is_perishable=True)
        db_session.add(commodity)
        db_session.commit()
        db_session.refresh(commodity)

    buyer = None
    if role == UserRole.buyer:
        buyer = Buyer(
            user_id=user.id,
            business_name=business_name,
            contact_person="Test Contact",
            phone=phone,
            email="buyer@example.com",
            business_type="Processor",
            location="Nashik",
            status="verified",
        )
        db_session.add(buyer)
        db_session.commit()
        db_session.refresh(buyer)

    return user, commodity, buyer


def _login(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]


def _buyer_headers(db_session, phone: str = "+919900000501", business_name: str = "Test Buyer"):
    user, commodity, buyer = _create_user_and_buyer(db_session, UserRole.buyer, phone, business_name)
    token = _login(phone)
    return {"Authorization": f"Bearer {token}"}, commodity, buyer


def test_demand_creation():
    db_session = _Session()
    try:
        headers, commodity, buyer = _buyer_headers(db_session)
        payload = {
            "commodity_id": commodity.id,
            "required_quantity": 5000,
            "minimum_grade": "Grade B",
            "delivery_location": "Nashik",
        }
        response = client.post("/api/demands/", json=payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        assert data["buyer_id"] == buyer.id
        assert data["commodity_id"] == commodity.id
        assert data["required_quantity"] == 5000
        assert data["unit"] == "kg"
        assert data["status"] == "active"
        assert data["minimum_grade"] == "Grade B"
        assert "id" in data
    finally:
        db_session.close()


def test_demand_retrieval():
    db_session = _Session()
    try:
        headers, commodity, buyer = _buyer_headers(db_session, phone="+919900000502")
        payload = {"commodity_id": commodity.id, "required_quantity": 3000}
        create_resp = client.post("/api/demands/", json=payload, headers=headers)
        demand_id = create_resp.json()["id"]

        response = client.get(f"/api/demands/{demand_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == demand_id
        assert data["buyer_id"] == buyer.id
    finally:
        db_session.close()


def test_demand_listing():
    db_session = _Session()
    try:
        headers, commodity, buyer = _buyer_headers(db_session, phone="+919900000503")
        client.post(
            "/api/demands/",
            json={"commodity_id": commodity.id, "required_quantity": 1000},
            headers=headers,
        )

        response = client.get("/api/demands/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert isinstance(data["items"], list)
        assert data["items"][0]["buyer_id"] == buyer.id
    finally:
        db_session.close()


def test_invalid_demand_validation():
    db_session = _Session()
    try:
        headers, commodity, _buyer = _buyer_headers(db_session, phone="+919900000504")
        # required_quantity must be > 0
        response = client.post(
            "/api/demands/",
            json={"commodity_id": commodity.id, "required_quantity": 0},
            headers=headers,
        )
        assert response.status_code == 422

        # missing required commodity_id
        response = client.post(
            "/api/demands/",
            json={"required_quantity": 100},
            headers=headers,
        )
        assert response.status_code == 422
    finally:
        db_session.close()


def test_non_buyer_cannot_create_demand():
    db_session = _Session()
    try:
        # Farmer has no buyer profile and is not an authorized creator.
        user, commodity, _buyer = _create_user_and_buyer(db_session, UserRole.farmer, "+919900000510")
        token = _login("+919900000510")
        headers = {"Authorization": f"Bearer {token}"}

        response = client.post(
            "/api/demands/",
            json={"commodity_id": commodity.id, "required_quantity": 1000},
            headers=headers,
        )
        assert response.status_code == 403
    finally:
        db_session.close()


def test_buyer_cannot_view_other_buyers_demand():
    db_session = _Session()
    try:
        headers_a, commodity, buyer_a = _buyer_headers(db_session, phone="+919900000520", business_name="Buyer A")
        create_resp = client.post(
            "/api/demands/",
            json={"commodity_id": commodity.id, "required_quantity": 1000},
            headers=headers_a,
        )
        demand_id = create_resp.json()["id"]

        # Second buyer (different user_id) should not see buyer A's demand.
        headers_b, _commodity, _buyer = _buyer_headers(db_session, phone="+919900000521", business_name="Buyer B")

        response = client.get(f"/api/demands/{demand_id}", headers=headers_b)
        assert response.status_code == 403
    finally:
        db_session.close()


def test_grade_exact_compatibility():
    from app.services.grade_matching import evaluate_grade_compatibility

    result = evaluate_grade_compatibility("Grade A", "Grade A")
    assert result.compatibility == GradeCompatibility.exact
    assert "matches" in result.reason.lower()


def test_grade_compatible_compatibility():
    from app.services.grade_matching import evaluate_grade_compatibility

    # Lot (Grade A) exceeds a Grade B minimum -> compatible
    result = evaluate_grade_compatibility("Grade A", "Grade B")
    assert result.compatibility == GradeCompatibility.compatible


def test_grade_incompatible_compatibility():
    from app.services.grade_matching import evaluate_grade_compatibility

    # Lot (Grade C) is below a Grade A minimum -> incompatible
    result = evaluate_grade_compatibility("Grade C", "Grade A")
    assert result.compatibility == GradeCompatibility.incompatible


def test_demand_table_migration_integrity():
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    inspector = inspect(engine)

    tables = inspector.get_table_names()
    assert "demands" in tables

    columns = {c["name"] for c in inspector.get_columns("demands")}
    for expected in [
        "id", "buyer_id", "commodity_id", "required_quantity", "unit",
        "minimum_grade", "delivery_location", "required_by", "status",
        "notes", "created_at", "updated_at",
    ]:
        assert expected in columns, f"missing column: {expected}"

    pk_raw = inspector.get_pk_constraint("demands")["constrained_columns"]
    pk = {c if isinstance(c, str) else c["name"] for c in pk_raw}
    assert pk == {"id"}

    fks = {fk["constrained_columns"][0]: fk["referred_table"] for fk in inspector.get_foreign_keys("demands")}
    assert fks.get("buyer_id") == "buyers"
    assert fks.get("commodity_id") == "commodities"

    engine.dispose()
