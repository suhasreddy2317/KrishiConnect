"""Deterministic, explainable Buyer Confidence Score (0-100).

Factors and weights are defined at module level for easy inspection/modification.
Where transaction history does not yet exist, documented neutral defaults are
used and clearly flagged in ``limitations`` — the service never fabricates
historical behavior.
"""
import math
from datetime import date

from sqlalchemy.orm import Session

from app.models.buyer import Buyer
from app.models.enums import BuyerStatus


# --- Weights (must sum to 1.0) ----------------------------------------------
BUYER_CONFIDENCE_WEIGHTS = {
    "kyc_verification": 0.20,
    "on_time_payment": 0.30,
    "acceptance_rejection": 0.20,
    "dispute_history": 0.15,
    "seller_rating": 0.15,
}

# --- Defaults for the MVP / demo stage ---------------------------------------
# KYC/trust tier mapped to a 0-100 score based on BuyerStatus.
DEFAULT_KYC_SCORE_BY_STATUS = {
    BuyerStatus.verified: 100,
    BuyerStatus.pending_review: 50,
    BuyerStatus.unverified: 20,
    BuyerStatus.escalated: 10,
    BuyerStatus.suspended: 0,
}
FALLBACK_KYC_SCORE = 20

# Neutral defaults used when no transaction history exists yet.
DEFAULT_ON_TIME_PAYMENT_RATE = 0.80
DEFAULT_ACCEPTANCE_RATE = 0.80
DEFAULT_DISPUTE_RATE = 0.10

# Seller/buyer rating expressed as 0-1 (3 of 5 stars = 0.6 neutral).
DEFAULT_SELLER_RATING = 3.0 / 5.0

# Confidence level thresholds.
CONFIDENCE_HIGH_MIN = 80.0
CONFIDENCE_MEDIUM_MIN = 50.0


def _confidence_level(score: float) -> str:
    if score >= CONFIDENCE_HIGH_MIN:
        return "high"
    if score >= CONFIDENCE_MEDIUM_MIN:
        return "medium"
    return "low"


def compute_buyer_confidence(db: Session, buyer_id: int) -> dict:
    """Compute a deterministic Buyer Confidence Score for a single buyer.

    Returns score, confidence level, factor breakdown, top reasons,
    limitations, and generated_at.
    """
    buyer = db.get(Buyer, buyer_id)

    factors: list[dict] = []
    limitations: list[str] = []

    if buyer is None:
        return {
            "buyer_id": buyer_id,
            "score": 0.0,
            "confidence_level": "low",
            "factors": [{
                "name": "KYC Verification",
                "contribution": 0.0,
                "weight": int(BUYER_CONFIDENCE_WEIGHTS["kyc_verification"] * 100),
                "detail": "Buyer record not found.",
            }],
            "top_reasons": ["Buyer record not found; confidence cannot be computed."],
            "limitations": ["Buyer record not found."],
            "generated_at": date.today().isoformat(),
        }

    # --- Factor 1: KYC / verification ---------------------------------------
    kyc_score = float(DEFAULT_KYC_SCORE_BY_STATUS.get(buyer.status, FALLBACK_KYC_SCORE))
    factors.append({
        "name": "KYC Verification",
        "contribution": round(kyc_score, 1),
        "weight": 20,
        "detail": f"Buyer status is '{buyer.status.value}'. Trust tier maps to {kyc_score:.0f}/100. "
                  f"Future payment/dispute history will replace the neutral defaults below.",
    })

    # --- Factor 2: On-time payment (no history yet) ------------------------
    on_time = DEFAULT_ON_TIME_PAYMENT_RATE
    factors.append({
        "name": "On-Time Payment",
        "contribution": round(on_time * 100, 1),
        "weight": 30,
        "detail": f"No payment history recorded; using neutral default of {on_time:.0%}.",
    })
    limitations.append("Payment history unavailable; on-time payment uses a neutral default.")

    # --- Factor 3: Acceptance / rejection ----------------------------------
    acceptance = DEFAULT_ACCEPTANCE_RATE
    factors.append({
        "name": "Acceptance / Rejection",
        "contribution": round(acceptance * 100, 1),
        "weight": 20,
        "detail": f"No offer acceptance history; using neutral default of {acceptance:.0%}.",
    })
    limitations.append("Offer acceptance/rejection history unavailable; using neutral default.")

    # --- Factor 4: Dispute history -----------------------------------------
    dispute_rate = DEFAULT_DISPUTE_RATE
    dispute_score = (1.0 - dispute_rate) * 100.0
    factors.append({
        "name": "Dispute History",
        "contribution": round(dispute_score, 1),
        "weight": 15,
        "detail": f"No dispute history recorded; using neutral dispute rate of {dispute_rate:.0%}.",
    })
    limitations.append("Dispute history unavailable; using neutral default dispute rate.")

    # --- Factor 5: Seller rating -------------------------------------------
    rating_score = DEFAULT_SELLER_RATING * 100.0
    factors.append({
        "name": "Seller Rating",
        "contribution": round(rating_score, 1),
        "weight": 15,
        "detail": f"No rating history; using neutral default of {DEFAULT_SELLER_RATING:.2f}/1.0.",
    })
    limitations.append("Seller rating unavailable; using neutral default.")

    # --- Weighted aggregate ------------------------------------------------
    weights = BUYER_CONFIDENCE_WEIGHTS
    score = round(
        kyc_score * weights["kyc_verification"]
        + (on_time * 100) * weights["on_time_payment"]
        + (acceptance * 100) * weights["acceptance_rejection"]
        + dispute_score * weights["dispute_history"]
        + rating_score * weights["seller_rating"],
        1,
    )
    score = max(0.0, min(100.0, score))
    level = _confidence_level(score)

    ordered = sorted(factors, key=lambda f: f["contribution"], reverse=True)
    top_reasons = [f"{f['name']}: {f['detail']}" for f in ordered[:3]]

    if buyer.status != BuyerStatus.verified:
        limitations.append(
            f"Buyer is '{buyer.status.value}' (not fully verified); "
            "verification status will limit visibility in farmer-facing match lists."
        )

    return {
        "buyer_id": buyer.id,
        "business_name": buyer.business_name,
        "status": buyer.status.value,
        "score": score,
        "confidence_level": level,
        "factors": factors,
        "top_reasons": top_reasons,
        "limitations": limitations,
        "generated_at": date.today().isoformat(),
    }
