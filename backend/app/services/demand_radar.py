"""Deterministic, explainable Demand Radar (0-100).

Aggregates active ``Demand`` records for a commodity (optionally scoped to a
market/location) into a single, inspectable demand signal. No ML is used; the
score is a transparent weighted sum of quantity, activity, urgency, and buyer
confidence, all defined at module level.
"""
import math
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.demand import Demand
from app.models.enums import DemandStatus
from app.models.market import Market
from app.services.buyer_confidence import compute_buyer_confidence


# --- Weights for the 0-100 demand score (sum = 100) -------------------------
DEMAND_WEIGHT_QUANTITY = 40
DEMAND_WEIGHT_DEMANDS = 30
DEMAND_WEIGHT_URGENCY = 20
DEMAND_WEIGHT_BUYER_CONFIDENCE = 10

# --- Tunable parameters ------------------------------------------------------
URGENCY_WINDOW_DAYS = 7
QUANTITY_SATURATION_KG = 5000.0
MAX_DEMANDS_FOR_FULL_SCORE = 3


def _normalize_location(loc: str | None) -> str | None:
    if not loc:
        return None
    cleaned = loc.strip()
    return cleaned or None


def _active_demands_for_commodity(
    db: Session,
    commodity_id: int,
    market_id: int | None = None,
    location: str | None = None,
) -> tuple[list[Demand], dict]:
    """Return active demands for a commodity, optionally scoped to a market/location.

    Demands with no delivery_location are treated as deliver-anywhere and are
    always included in a location-scoped query.
    """
    query = (
        db.query(Demand)
        .filter(Demand.commodity_id == commodity_id, Demand.status == DemandStatus.active)
    )

    info: dict = {"location_filter": None, "location_match": False}

    location_keyword = location
    if market_id is not None:
        market = db.query(Market).filter(Market.id == market_id).first()
        if market and market.location:
            location_keyword = market.location

    if location_keyword:
        loc = _normalize_location(location_keyword)
        if loc:
            like = f"%{loc}%"
            scoped_query = query.filter(
                or_(Demand.delivery_location == None, Demand.delivery_location.ilike(like))  # noqa: E712
            )
            matched = scoped_query.all()
            if matched:
                query = scoped_query
                info["location_filter"] = loc
                info["location_match"] = True
            else:
                info["location_filter"] = loc
                info["location_match"] = False

    demands = query.all()
    return demands, info


def _urgency_fraction(demands: list[Demand], today: date) -> float:
    if not demands:
        return 0.0
    urgent = 0
    for d in demands:
        if d.required_by is not None:
            days = (d.required_by - today).days
            if days <= URGENCY_WINDOW_DAYS:
                urgent += 1
    return urgent / len(demands)


def _avg_buyer_confidence(db: Session, demands: list[Demand]) -> float:
    if not demands:
        return 0.0
    scores = [compute_buyer_confidence(db, d.buyer_id)["score"] for d in demands]
    return sum(scores) / len(scores)


def calculate_demand_signal(
    db: Session,
    commodity_id: int,
    market_id: int | None = None,
    location: str | None = None,
) -> dict:
    """Compute a single normalized 0-100 demand signal for a commodity."""
    demands, info = _active_demands_for_commodity(db, commodity_id, market_id, location)
    today = date.today()

    total_qty = sum(d.required_quantity or 0.0 for d in demands)
    num_demands = len(demands)
    buyer_ids = {d.buyer_id for d in demands}
    urgency = _urgency_fraction(demands, today)
    avg_conf = _avg_buyer_confidence(db, demands)

    quantity_points = (
        DEMAND_WEIGHT_QUANTITY * (1.0 - math.exp(-total_qty / QUANTITY_SATURATION_KG))
        if total_qty > 0
        else 0.0
    )
    demands_points = DEMAND_WEIGHT_DEMANDS * min(1.0, num_demands / MAX_DEMANDS_FOR_FULL_SCORE)
    urgency_points = DEMAND_WEIGHT_URGENCY * urgency
    confidence_points = DEMAND_WEIGHT_BUYER_CONFIDENCE * (avg_conf / 100.0)

    score = round(quantity_points + demands_points + urgency_points + confidence_points, 1)
    score = max(0.0, min(100.0, score))

    reasons: list[str] = []
    if num_demands > 0:
        reasons.append(f"{num_demands} active demand(s) posting {total_qty:.0f} {demands[0].unit or 'kg'} for this commodity.")
        if urgency > 0:
            reasons.append(f"{urgency:.0%} of demands are due within {URGENCY_WINDOW_DAYS} days (urgent).")
        reasons.append(f"Buyer confidence averages {avg_conf:.0f}/100 across demanding buyers.")
    else:
        reasons.append("No active demand data for this commodity.")

    limitations: list[str] = []
    if not num_demands:
        limitations.append("No active demands recorded for this commodity.")
    if info.get("location_filter") and not info.get("location_match"):
        limitations.append(
            f"No active demands match location '{info['location_filter']}'; "
            "signal reflects the commodity-wide aggregate."
        )
    limitations.append("Buyer confidence uses neutral defaults where transaction history is unavailable.")

    return {
        "commodity_id": commodity_id,
        "score": score,
        "demand_quantity": round(total_qty, 1),
        "num_demands": num_demands,
        "num_buyers": len(buyer_ids),
        "urgency": round(urgency, 2),
        "reasons": reasons,
        "freshness": "real-time (live query)",
        "limitations": limitations,
        "generated_at": date.today().isoformat(),
        "location_filter": info.get("location_filter"),
    }


def calculate_demand_radar(
    db: Session,
    commodity_id: int | None = None,
    market_id: int | None = None,
    location: str | None = None,
) -> list[dict]:
    """Compute demand signals.

    - If ``commodity_id`` is given, returns a single-element list for that commodity.
    - Otherwise returns one signal per commodity that has at least one active demand.
    """
    if commodity_id is not None:
        return [calculate_demand_signal(db, commodity_id, market_id, location)]

    commodities_with_demand = (
        db.query(Demand.commodity_id)
        .filter(Demand.status == DemandStatus.active)
        .distinct()
        .all()
    )
    signals = []
    for row in commodities_with_demand:
        cid = row[0]
        signals.append(calculate_demand_signal(db, cid, market_id, location))
    return signals
