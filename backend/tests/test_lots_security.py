"""Security tests for lots endpoints."""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.commodity import Commodity
from app.models.enums import LotStatus, UserRole
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "lotsecpass"
BUYER1_USER_PHONE = "+919910000211"
BUYER1_BUYER_PHONE = "+919910000212"
FARMER1_USER_PHONE = "+919910000213"
FARMER1_PHONE = "+919910000214"
FARMER2_USER_PHONE = "+919910000215"
FARMER2_PHONE = "+919910000216"
ADMIN_USER_PHONE = "+919910000217"
FPO_MANAGER_PHONE = "+919910000218"


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
        db_session.add_all([onion])
        db_session.flush()

        b1u = User(name="Buyer One", phone=BUYER1_USER_PHONE, role=UserRole.buyer, is_active=True, password_hash=pw)
        f1u = User(name="Farmer One", phone=FARMER1_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        f2u = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        admin_u = User(name="Admin User", phone=ADMIN_USER_PHONE, role=UserRole.admin, is_active=True, password_hash=pw)
        fpo_u = User(name="FPO Manager", phone=FPO_MANAGER_PHONE, role=UserRole.fpo_manager, is_active=True, password_hash=pw)
        db_session.add_all([b1u, f1u, f2u, admin_u, fpo_u])
        db_session.flush()

        from app.models.buyer import Buyer
        from app.models.enums import BuyerStatus
        buyer1 = Buyer(user_id=b1u.id, business_name="B1 Verified", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        farmer1 = Farmer(user_id=f1u.id, name="Farmer One", phone=FARMER1_PHONE, village="Nashik", district="Nashik", state="MH", latitude=19.99, longitude=73.78)
        farmer2 = Farmer(user_id=f2u.id, name="Farmer Two", phone=FARMER2_PHONE, village="Pune", district="Pune", state="MH", latitude=18.52, longitude=73.85)
        db_session.add_all([buyer1, farmer1, farmer2])
        db_session.flush()

        today = datetime.utcnow().date()
        lot_published = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade A", harvest_date=today, location="Nashik", status=LotStatus.published)
        lot_draft_f1 = ProduceLot(farmer_id=farmer1.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=2000, quality_grade="Grade B", harvest_date=today, location="Nashik", status=LotStatus.draft)
        lot_draft_f2 = ProduceLot(farmer_id=farmer2.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=2000, quality_grade="Grade B", harvest_date=today, location="Pune", status=LotStatus.draft)
        db_session.add_all([lot_published, lot_draft_f1, lot_draft_f2])
        db_session.commit()

        yield SimpleNamespace(
            db=db_session,
            onion=onion,
            buyer1=buyer1, farmer1=farmer1, farmer2=farmer2,
            lot_published=lot_published, lot_draft_f1=lot_draft_f1, lot_draft_f2=lot_draft_f2,
            b1u=b1u, f1u=f1u, f2u=f2u, admin_u=admin_u, fpo_u=fpo_u,
        )
    finally:
        db_session.close()


from types import SimpleNamespace
from datetime import datetime


def test_unauthenticated_lot_list_rejected(data):
    response = client.get("/api/lots/")
    assert response.status_code in (401, 403)


def test_buyer_sees_only_published_lots(data):
    token_b = _login(BUYER1_USER_PHONE)
    response = client.get("/api/lots/", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    body = response.json()
    assert all(lot["status"] == "published" for lot in body)
    assert any(lot["id"] == data.lot_published.id for lot in body)


def test_farmer_sees_only_own_lots(data):
    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.get("/api/lots/", headers={"Authorization": f"Bearer {token_f1}"})
    assert response.status_code == 200
    body = response.json()
    assert all(lot["farmer_id"] == data.farmer1.id for lot in body)


def test_admin_sees_all_lots(data):
    token_admin = _login(ADMIN_USER_PHONE)
    response = client.get("/api/lots/", headers={"Authorization": f"Bearer {token_admin}"})
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 3


def test_unauthenticated_lot_detail_rejected(data):
    response = client.get(f"/api/lots/{data.lot_published.id}")
    assert response.status_code in (401, 403)


def test_buyer_can_see_published_lot(data):
    token_b = _login(BUYER1_USER_PHONE)
    response = client.get(f"/api/lots/{data.lot_published.id}", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 200
    assert response.json()["id"] == data.lot_published.id


def test_buyer_cannot_see_draft_lot(data):
    token_b = _login(BUYER1_USER_PHONE)
    response = client.get(f"/api/lots/{data.lot_draft_f1.id}", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 403


def test_farmer_cannot_see_another_farmers_draft_lot(data):
    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.get(f"/api/lots/{data.lot_draft_f2.id}", headers={"Authorization": f"Bearer {token_f1}"})
    assert response.status_code == 403


def test_farmer_can_see_own_draft_lot(data):
    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.get(f"/api/lots/{data.lot_draft_f1.id}", headers={"Authorization": f"Bearer {token_f1}"})
    assert response.status_code == 200


def test_non_farmer_cannot_create_lot_for_arbitrary_farmer(data):
    token_b = _login(BUYER1_USER_PHONE)
    response = client.post(
        "/api/lots/",
        json={
            "farmer_id": data.farmer1.id,
            "commodity_id": data.onion.id,
            "crop": "Red Onion",
            "quantity_kg": 1000,
            "quality_grade": "Grade A",
            "harvest_date": "2026-09-20",
            "location": "Nashik",
        },
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 403


def test_fpo_manager_can_create_lot_for_farmer(data):
    token_fpo = _login(FPO_MANAGER_PHONE)
    response = client.post(
        "/api/lots/",
        json={
            "farmer_id": data.farmer1.id,
            "commodity_id": data.onion.id,
            "crop": "Red Onion",
            "quantity_kg": 1000,
            "quality_grade": "Grade A",
            "harvest_date": "2026-09-20",
            "location": "Nashik",
        },
        headers={"Authorization": f"Bearer {token_fpo}"},
    )
    assert response.status_code == 201


def test_farmer_can_create_lot_for_self(data):
    token_f1 = _login(FARMER1_USER_PHONE)
    response = client.post(
        "/api/lots/",
        json={
            "commodity_id": data.onion.id,
            "crop": "Red Onion",
            "quantity_kg": 1000,
            "quality_grade": "Grade A",
            "harvest_date": "2026-09-20",
            "location": "Nashik",
        },
        headers={"Authorization": f"Bearer {token_f1}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["farmer_id"] == data.farmer1.id
