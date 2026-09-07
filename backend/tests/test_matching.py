"""Tests for Phase 3D.2: Buyer Confidence, Demand Radar, and Lot Matching."""
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app
from app.models.buyer import Buyer
from app.models.commodity import Commodity
from app.models.demand import Demand
from app.models.enums import BuyerStatus, DemandStatus, LotStatus, UserRole
from app.models.farmer import Farmer
from app.models.produce_lot import ProduceLot
from app.models.user import User
from types import SimpleNamespace

from app.services.buyer_confidence import compute_buyer_confidence
from app.services.demand_radar import calculate_demand_signal, calculate_demand_radar
from app.services.grade_matching import evaluate_grade_compatibility
from app.services.lot_matching import find_matches_for_lot, find_lots_for_demand
from app.utils.auth import hash_password

_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=_engine)
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

client = TestClient(app)

DEMO_PASS = "demopass"
FARMER_USER_PHONE = "+919900000601"
FARMER_PHONE = "+919900000611"
FARMER2_USER_PHONE = "+919900000602"
FARMER2_PHONE = "+919900000612"
BUYER1_USER_PHONE = "+919900000621"
BUYER1_BUYER_PHONE = "+919900000622"
BUYER2_USER_PHONE = "+919900000631"
BUYER2_BUYER_PHONE = "+919900000632"
ADMIN_USER_PHONE = "+919900000641"


def _login(phone: str) -> str:
    response = client.post("/api/auth/login", json={"identifier": phone, "password": DEMO_PASS})
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture()
def data():
    """Fresh, deterministic dataset on the dev DB (truncated before each test)."""
    db_session = _Session()
    try:
        pw = hash_password(DEMO_PASS)

        onion = Commodity(name="Red Onion", variety="Local", unit="kg", is_perishable=True, perishability_profile="2-3 weeks")
        soybean = Commodity(name="Soybean", variety="Yellow", unit="kg", is_perishable=False)
        tomato = Commodity(name="Tomato", variety="Hybrid", unit="kg", is_perishable=True, perishability_profile="7-10 days")
        db_session.add_all([onion, soybean, tomato])
        db_session.flush()

        farmer_user = User(name="Farmer One", phone=FARMER_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        farmer2_user = User(name="Farmer Two", phone=FARMER2_USER_PHONE, role=UserRole.farmer, is_active=True, password_hash=pw)
        buyer1_user = User(name="Buyer One", phone=BUYER1_USER_PHONE, role=UserRole.buyer, is_active=True, password_hash=pw)
        buyer2_user = User(name="Buyer Two", phone=BUYER2_USER_PHONE, role=UserRole.buyer, is_active=True, password_hash=pw)
        admin_user = User(name="Admin One", phone=ADMIN_USER_PHONE, role=UserRole.admin, is_active=True, password_hash=pw)
        db_session.add_all([farmer_user, farmer2_user, buyer1_user, buyer2_user, admin_user])
        db_session.flush()

        farmer = Farmer(user_id=farmer_user.id, name="Farmer One", phone=FARMER_PHONE, village="Nashik", district="Nashik", state="Maharashtra", latitude=19.99, longitude=73.78)
        db_session.add(farmer)
        db_session.flush()

        buyer1 = Buyer(user_id=buyer1_user.id, business_name="Verified Buyer", phone=BUYER1_BUYER_PHONE, status=BuyerStatus.verified)
        buyer2 = Buyer(user_id=buyer2_user.id, business_name="Unverified Buyer", phone=BUYER2_BUYER_PHONE, status=BuyerStatus.unverified)
        db_session.add_all([buyer1, buyer2])
        db_session.flush()

        today = date.today()
        lot_onion = ProduceLot(farmer_id=farmer.id, commodity_id=onion.id, crop="Red Onion", quantity_kg=4000, quality_grade="Grade A", harvest_date=today - timedelta(days=7), location="Nashik", status=LotStatus.published)
        lot_soy = ProduceLot(farmer_id=farmer.id, commodity_id=soybean.id, crop="Soybean", quantity_kg=6000, quality_grade="Grade B", harvest_date=today - timedelta(days=7), location="Solapur", status=LotStatus.published)
        lot_tomato = ProduceLot(farmer_id=farmer.id, commodity_id=tomato.id, crop="Tomato", quantity_kg=2500, quality_grade="Grade A", harvest_date=today - timedelta(days=7), location="Pune", status=LotStatus.matched)
        db_session.add_all([lot_onion, lot_soy, lot_tomato])
        db_session.flush()

        def D(buyer, commodity, grade, qty, loc, when, status=DemandStatus.active):
            return Demand(buyer_id=buyer.id, commodity_id=commodity.id, required_quantity=qty, unit="kg", minimum_grade=grade, delivery_location=loc, required_by=today + timedelta(days=when), status=status)

        d_onion_strong = D(buyer1, onion, "Grade A", 4000, "Nashik APMC", 5)
        d_onion_partial = D(buyer1, onion, "Grade A", 9000, "Nashik APMC", 10)
        d_onion_compat = D(buyer1, onion, "Grade B", 4000, "Nashik APMC", 5)
        d_soy_incompat = D(buyer1, soybean, "Grade A", 6000, "Solapur", 30)
        d_soy_strong = D(buyer1, soybean, "Grade B", 6000, "Solapur", 4)
        d_onion_unverified = D(buyer2, onion, "Grade A", 4000, "Nashik APMC", 5)
        d_tomato_expired = D(buyer1, tomato, "Grade A", 3000, "Pune", 3, status=DemandStatus.expired)
        db_session.add_all([d_onion_strong, d_onion_partial, d_onion_compat, d_soy_incompat, d_soy_strong, d_onion_unverified, d_tomato_expired])
        db_session.commit()

        yield SimpleNamespace(
            db=db_session,
            onion=onion, soybean=soybean, tomato=tomato,
            farmer=farmer, farmer_user=farmer_user, farmer2_user=farmer2_user,
            buyer1=buyer1, buyer2=buyer2, admin_user=admin_user,
            lot_onion=lot_onion, lot_soy=lot_soy, lot_tomato=lot_tomato,
            d_onion_strong=d_onion_strong, d_onion_partial=d_onion_partial,
            d_onion_compat=d_onion_compat, d_soy_incompat=d_soy_incompat,
            d_soy_strong=d_soy_strong, d_onion_unverified=d_onion_unverified,
            d_tomato_expired=d_tomato_expired,
        )
    finally:
        db_session.close()


# --------------------------------------------------------------------------- #
# BUYER CONFIDENCE
# --------------------------------------------------------------------------- #
def test_verified_buyer_scores_higher_than_unverified(data):
    verified = compute_buyer_confidence(data.db, data.buyer1.id)
    unverified = compute_buyer_confidence(data.db, data.buyer2.id)
    assert verified["score"] > unverified["score"]
    assert verified["confidence_level"] in ("high", "medium")
    assert unverified["confidence_level"] in ("medium", "low")


def test_buyer_confidence_deterministic(data):
    a = compute_buyer_confidence(data.db, data.buyer1.id)
    b = compute_buyer_confidence(data.db, data.buyer1.id)
    assert a["score"] == b["score"]


def test_buyer_confidence_explainable_breakdown(data):
    result = compute_buyer_confidence(data.db, data.buyer1.id)
    assert "score" in result and 0 <= result["score"] <= 100
    assert result["confidence_level"] in ("high", "medium", "low")
    names = {f["name"] for f in result["factors"]}
    assert {"KYC Verification", "On-Time Payment", "Acceptance / Rejection", "Dispute History", "Seller Rating"} <= names
    for f in result["factors"]:
        assert f["detail"]
        assert 0 <= f["contribution"] <= 100
        assert f["weight"] >= 0
    assert len(result["top_reasons"]) >= 1
    assert len(result["limitations"]) >= 1


def test_buyer_confidence_unavailable_history_handled(data):
    result = compute_buyer_confidence(data.db, data.buyer1.id)
    # History is unavailable at MVP; limitations must state this honestly.
    assert any("unavailable" in lim.lower() or "default" in lim.lower() for lim in result["limitations"])
    # Score must not claim certainty (must be < 100 because history is missing).
    assert result["score"] < 100


# --------------------------------------------------------------------------- #
# DEMAND RADAR
# --------------------------------------------------------------------------- #
def test_active_demand_contributes_to_score(data):
    signal = calculate_demand_signal(data.db, data.onion.id)
    assert signal["num_demands"] >= 1
    assert signal["demand_quantity"] > 0
    assert signal["score"] > 0
    assert signal["reasons"]


def test_expired_demand_excluded(data):
    signal = calculate_demand_signal(data.db, data.tomato.id)
    assert signal["num_demands"] == 0
    assert signal["score"] == 0
    assert any("no active demand" in r.lower() for r in signal["reasons"])


def test_demand_radar_deterministic(data):
    a = calculate_demand_signal(data.db, data.onion.id)
    b = calculate_demand_signal(data.db, data.onion.id)
    assert a["score"] == b["score"]
    assert a["num_demands"] == b["num_demands"]


def test_urgency_affects_score(data):
    today = date.today()
    urgent = Demand(buyer_id=data.buyer1.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=1), status=DemandStatus.active)
    far = Demand(buyer_id=data.buyer1.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=40), status=DemandStatus.active)
    data.db.add_all([urgent, far])
    data.db.commit()

    matches = find_matches_for_lot(data.db, data.lot_onion.id)
    urgent_res = next(m for m in matches if m["demand_id"] == urgent.id)
    far_res = next(m for m in matches if m["demand_id"] == far.id)
    assert urgent_res["urgency"] > far_res["urgency"]
    assert urgent_res["match_score"] >= far_res["match_score"]


def test_demand_radar_filters_by_commodity(data):
    radar = calculate_demand_radar(data.db, commodity_id=data.onion.id)
    assert len(radar) == 1
    assert radar[0]["commodity_id"] == data.onion.id


# --------------------------------------------------------------------------- #
# LOT MATCHING
# --------------------------------------------------------------------------- #
def test_exact_commodity_match(data):
    matches = find_lots_for_demand(data.db, data.d_onion_strong.id)
    lot_ids = {m["lot_id"] for m in matches}
    assert data.lot_onion.id in lot_ids
    assert data.lot_soy.id not in lot_ids


def test_incompatible_commodity_rejected(data):
    matches = find_lots_for_demand(data.db, data.d_onion_strong.id)
    for m in matches:
        assert m["commodity_id"] == data.onion.id


def test_exact_grade_match(data):
    matches = find_lots_for_demand(data.db, data.d_soy_strong.id)
    soy_match = next(m for m in matches if m["lot_id"] == data.lot_soy.id)
    assert soy_match["grade_compatibility"] == "exact"


def test_compatible_higher_grade(data):
    # Demand minimum Grade B; lot is Grade A (better) -> compatible.
    matches = find_lots_for_demand(data.db, data.d_onion_compat.id)
    onion_match = next(m for m in matches if m["lot_id"] == data.lot_onion.id)
    assert onion_match["grade_compatibility"] == "compatible"


def test_incompatible_lower_grade_rejected(data):
    # Demand minimum Grade A; lot is Grade B (worse) -> incompatible -> rejected.
    matches = find_lots_for_demand(data.db, data.d_soy_incompat.id)
    assert matches == []


def test_quantity_fit_full(data):
    matches = find_lots_for_demand(data.db, data.d_onion_strong.id)
    onion_match = next(m for m in matches if m["lot_id"] == data.lot_onion.id)
    assert onion_match["quantity_fit"] == 100.0


def test_partial_quantity_behavior(data):
    matches = find_lots_for_demand(data.db, data.d_onion_partial.id)
    onion_match = next(m for m in matches if m["lot_id"] == data.lot_onion.id)
    assert onion_match["quantity_fit"] < 100.0
    assert onion_match["quantity_fit"] > 0.0


def test_location_influence(data):
    today = date.today()
    local = Demand(buyer_id=data.buyer1.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
    remote = Demand(buyer_id=data.buyer1.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Solapur", required_by=today + timedelta(days=5), status=DemandStatus.active)
    data.db.add_all([local, remote])
    data.db.commit()

    local_match = next(m for m in find_lots_for_demand(data.db, local.id) if m["lot_id"] == data.lot_onion.id)
    remote_match = next(m for m in find_lots_for_demand(data.db, remote.id) if m["lot_id"] == data.lot_onion.id)
    assert local_match["location_fit"] > remote_match["location_fit"]


def test_buyer_confidence_influences_ranking(data):
    # Two otherwise-identical onion demands; only the buyer confidence differs.
    today = date.today()
    verified = Demand(buyer_id=data.buyer1.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
    unverified = Demand(buyer_id=data.buyer2.id, commodity_id=data.onion.id, required_quantity=4000, minimum_grade="Grade A", delivery_location="Nashik APMC", required_by=today + timedelta(days=5), status=DemandStatus.active)
    data.db.add_all([verified, unverified])
    data.db.commit()

    matches = find_matches_for_lot(data.db, data.lot_onion.id)
    v = next(m for m in matches if m["demand_id"] == verified.id)
    u = next(m for m in matches if m["demand_id"] == unverified.id)
    assert v["buyer_confidence"] > u["buyer_confidence"]
    assert v["match_score"] >= u["match_score"]


def test_deterministic_ranking(data):
    a = find_matches_for_lot(data.db, data.lot_onion.id)
    b = find_matches_for_lot(data.db, data.lot_onion.id)
    assert a == b


def test_explainable_reasons(data):
    matches = find_matches_for_lot(data.db, data.lot_onion.id)
    assert matches
    for m in matches:
        assert m["reasons"]
        assert m["limitations"]


def test_non_published_lot_excluded(data):
    # lot_tomato is 'matched' status -> not published -> excluded even for a tomato demand.
    today = date.today()
    tom_demand = Demand(buyer_id=data.buyer1.id, commodity_id=data.tomato.id, required_quantity=2500, minimum_grade="Grade A", delivery_location="Pune", required_by=today + timedelta(days=5), status=DemandStatus.active)
    data.db.add(tom_demand)
    data.db.commit()
    assert find_lots_for_demand(data.db, tom_demand.id) == []


# --------------------------------------------------------------------------- #
# GRADE MATCHING (unit-level)
# --------------------------------------------------------------------------- #
def test_grade_exact():
    assert evaluate_grade_compatibility("Grade A", "Grade A").compatibility == "exact"


def test_grade_compatible():
    assert evaluate_grade_compatibility("Grade A", "Grade B").compatibility == "compatible"


def test_grade_incompatible():
    assert evaluate_grade_compatibility("Grade C", "Grade A").compatibility == "incompatible"


# --------------------------------------------------------------------------- #
# API: BUYER CONFIDENCE
# --------------------------------------------------------------------------- #
def test_confidence_api_requires_auth():
    response = client.get(f"/api/buyers/{1}/confidence")
    assert response.status_code == 401


def test_confidence_api_valid_authenticated(data):
    token = _login(BUYER1_USER_PHONE)
    response = client.get(f"/api/buyers/{data.buyer1.id}/confidence", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    body = response.json()
    assert 0 <= body["score"] <= 100
    assert body["confidence_level"] in ("high", "medium", "low")


def test_confidence_api_farmer_can_view(data):
    token = _login(FARMER_USER_PHONE)
    response = client.get(f"/api/buyers/{data.buyer1.id}/confidence", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_confidence_api_buyer_cannot_view_other_buyer(data):
    token = _login(BUYER2_USER_PHONE)
    response = client.get(f"/api/buyers/{data.buyer1.id}/confidence", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_confidence_api_missing_buyer(data):
    token = _login(ADMIN_USER_PHONE)
    response = client.get("/api/buyers/999999/confidence", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404


# --------------------------------------------------------------------------- #
# API: MATCHING
# --------------------------------------------------------------------------- #
def test_matching_api_requires_auth():
    response = client.get("/api/matches/lots/1")
    assert response.status_code == 401


def test_matching_api_valid_authenticated(data):
    token = _login(FARMER_USER_PHONE)
    response = client.get(f"/api/matches/lots/{data.lot_onion.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1


def test_matching_api_farmer_cannot_view_others_lot(data):
    token = _login(FARMER2_USER_PHONE)
    response = client.get(f"/api/matches/lots/{data.lot_onion.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_matching_api_buyer_missing_demand_404(data):
    token = _login(BUYER1_USER_PHONE)
    response = client.get("/api/matches/demands/999999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404


def test_matching_api_buyer_cannot_view_others_demand(data):
    token = _login(BUYER2_USER_PHONE)
    response = client.get(f"/api/matches/demands/{data.d_onion_strong.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_matching_api_buyer_own_demand(data):
    token = _login(BUYER1_USER_PHONE)
    response = client.get(f"/api/matches/demands/{data.d_onion_strong.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_matching_api_missing_lot_404(data):
    token = _login(FARMER_USER_PHONE)
    response = client.get("/api/matches/lots/999999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
