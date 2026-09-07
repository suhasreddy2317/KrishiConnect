"""Deterministic, explainable lot-to-demand matching (no ML).

Two-stage matching:
  1. Hard filters: commodity match, lot eligibility (published), and grade
     compatibility (incompatible grades are rejected).
  2. Ranking: a transparent weighted score over grade fit, quantity fit,
     location feasibility, demand urgency, and buyer confidence.

All weights/constants are module-level for easy inspection and tuning.
"""
import math
from dataclasses import asdict, dataclass
from datetime import date

from sqlalchemy.orm import Session

from app.models.commodity import Commodity
from app.models.demand import Demand
from app.models.enums import DemandStatus, LotStatus, GradeCompatibility
from app.models.market import Market
from app.models.produce_lot import ProduceLot
from app.services.buyer_confidence import compute_buyer_confidence
from app.services.grade_matching import evaluate_grade_compatibility


# --- Match score weights (sum = 100) -----------------------------------------
MATCH_WEIGHT_GRADE = 30
MATCH_WEIGHT_QUANTITY = 25
MATCH_WEIGHT_LOCATION = 15
MATCH_WEIGHT_URGENCY = 15
MATCH_WEIGHT_BUYER_CONFIDENCE = 15

GRADE_COMPATIBLE_SCORE = 70.0  # below exact (100) but still acceptable


@dataclass
class MatchResult:
    demand_id: int
    buyer_id: int
    lot_id: int
    match_score: float
    grade_compatibility: str
    commodity_id: int
    lot_grade: str
    lot_quantity: float
    lot_location: str | None
    quantity_fit: float
    location_fit: float
    urgency: float
    buyer_confidence: float
    reasons: list
    limitations: list


def _grade_score(compatibility: GradeCompatibility) -> float:
    if compatibility == GradeCompatibility.exact:
        return 100.0
    if compatibility == GradeCompatibility.compatible:
        return GRADE_COMPATIBLE_SCORE
    return 0.0  # incompatible -> hard reject


def _location_fit(lot_location: str | None, demand_location: str | None) -> float:
    lot_loc = (lot_location or "").strip()
    demand_loc = (demand_location or "").strip()
    if not lot_loc or not demand_loc:
        # Either side unspecified -> treat as plausible (neutral) but flag.
        return 0.5
    lot_tokens = {t for t in lot_loc.lower().replace(",", " ").split() if t}
    demand_tokens = {t for t in demand_loc.lower().replace(",", " ").split() if t}
    if not lot_tokens or not demand_tokens:
        return 0.5
    overlap = len(lot_tokens & demand_tokens) / len(demand_tokens | lot_tokens)
    return overlap


def _urgency_score(required_by: date | None, today: date) -> float:
    if required_by is None:
        return 0.0
    days = (required_by - today).days
    if days < 0:
        return 0.0  # already expired/overdue
    window = 7
    if days <= window:
        return 1.0
    # Diminishing urgency beyond the window.
    return max(0.0, 1.0 - (days - 1) / 30.0)


def _quantity_fit(lot_qty: float, demand_qty: float) -> float:
    if demand_qty <= 0:
        return 0.0
    if lot_qty >= demand_qty:
        return 1.0
    return max(0.0, lot_qty / demand_qty)


def _score_pair(db: Session, demand: Demand, lot: ProduceLot, today: date) -> MatchResult | None:
    """Score a single lot-demand pair. Returns None if the pair is hard-rejected."""
    grade_compat = evaluate_grade_compatibility(lot.quality_grade, demand.minimum_grade).compatibility

    if grade_compat == GradeCompatibility.incompatible:
        return None  # hard filter: grade below requirement

    grade_s = _grade_score(grade_compat)
    quantity_s = _quantity_fit(lot.quantity_kg, demand.required_quantity or 0.0) * 100.0
    location_s = _location_fit(lot.location, demand.delivery_location) * 100.0
    urgency_s = _urgency_score(demand.required_by, today) * 100.0
    confidence = compute_buyer_confidence(db, demand.buyer_id)["score"]

    weights = {
        "grade": MATCH_WEIGHT_GRADE,
        "quantity": MATCH_WEIGHT_QUANTITY,
        "location": MATCH_WEIGHT_LOCATION,
        "urgency": MATCH_WEIGHT_URGENCY,
        "buyer_confidence": MATCH_WEIGHT_BUYER_CONFIDENCE,
    }
    score = (
        grade_s * weights["grade"]
        + quantity_s * weights["quantity"]
        + location_s * weights["location"]
        + urgency_s * weights["urgency"]
        + confidence * weights["buyer_confidence"]
    ) / 100.0
    score = round(max(0.0, min(100.0, score)), 1)

    reasons = [
        f"Grade compatibility is '{grade_compat.value}' (lot '{lot.quality_grade}' vs demand min '{demand.minimum_grade}').",
        f"Quantity fit is {quantity_s:.0f}% (lot {lot.quantity_kg} {lot.unit} vs demand {demand.required_quantity} {demand.unit}).",
        f"Buyer confidence for this demand is {confidence:.0f}/100.",
        f"Demand urgency is {urgency_s:.0f}% based on required_by {demand.required_by}.",
    ]
    limitations = []
    if not demand.delivery_location or not lot.location:
        limitations.append("Location data missing on lot or demand; location fit treated as neutral.")
    limitations.append("Ranking is rule-based; weights are defined in lot_matching.py and may be tuned.")

    return MatchResult(
        demand_id=demand.id,
        buyer_id=demand.buyer_id,
        lot_id=lot.id,
        match_score=score,
        grade_compatibility=grade_compat.value,
        commodity_id=lot.commodity_id,
        lot_grade=lot.quality_grade,
        lot_quantity=lot.quantity_kg,
        lot_location=lot.location,
        quantity_fit=round(quantity_s, 1),
        location_fit=round(location_s, 1),
        urgency=round(urgency_s, 1),
        buyer_confidence=round(confidence, 1),
        reasons=reasons,
        limitations=limitations,
    )


def _eligible_lots(db: Session) -> list[ProduceLot]:
    return (
        db.query(ProduceLot)
        .filter(ProduceLot.status == LotStatus.published.value)
        .all()
    )


def _eligible_demands(db: Session) -> list[Demand]:
    return db.query(Demand).filter(Demand.status == DemandStatus.active).all()


def find_matches_for_lot(db: Session, lot_id: int) -> list[dict]:
    """Return active demands that match the given (published) lot, ranked.

    Perspective: farmer/FPO/admin viewing which buyers are interested.
    """
    lot = db.get(ProduceLot, lot_id)
    if lot is None:
        return None  # handled by the caller -> 404

    today = date.today()
    matches: list[dict] = []
    for demand in _eligible_demands(db):
        if demand.commodity_id != lot.commodity_id:
            continue
        result = _score_pair(db, demand, lot, today)
        if result is None:
            continue
        matches.append(asdict(result))
    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return matches


def find_lots_for_demand(db: Session, demand_id: int) -> list[dict]:
    """Return published lots that match the given (active) demand, ranked.

    Perspective: buyer viewing which lots fit their requirement.
    """
    demand = db.get(Demand, demand_id)
    if demand is None:
        return None

    today = date.today()
    matches: list[dict] = []
    for lot in _eligible_lots(db):
        if lot.commodity_id != demand.commodity_id:
            continue
        result = _score_pair(db, demand, lot, today)
        if result is None:
            continue
        matches.append(asdict(result))
    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return matches
