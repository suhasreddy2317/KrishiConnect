from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from app.models.commodity import Commodity
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.models.storage_option import StorageOption
from app.services.demand_radar import calculate_demand_signal
from app.services.price_intelligence import get_price_intelligence


# Sale Window Score weights (must sum to 100)
PRICE_TREND_WEIGHT = 40
DEMAND_SIGNAL_WEIGHT = 20
PERISHABILITY_WEIGHT = 20
STORAGE_ACCESS_WEIGHT = 20

# Verdict thresholds
VERDICT_SELL_NOW_MIN = 76
VERDICT_SELL_SOON_MIN = 51
VERDICT_WAIT_MIN = 26
# Below VERDICT_WAIT_MIN => STORE

# Demand signal placeholder (Demand Radar not yet implemented)
# Neutral mid-point for missing demand data
DEMAND_SIGNAL_DEFAULT = 10  # out of 20


def _clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, value))


def calculate_sale_window_score(
    db: Session,
    commodity_id: int,
    market_id: int,
    farmer_id: int | None = None,
) -> dict:
    intelligence = get_price_intelligence(db, commodity_id, market_id)

    if "error" in intelligence and intelligence["error"]:
        return {
            "commodity_id": commodity_id,
            "market_id": market_id,
            "score": 0,
            "verdict": "STORE",
            "reasons": ["Insufficient price data available for this commodity/market."],
            "factors": [],
            "freshness": "unavailable",
            "generated_at": date.today().isoformat(),
            "limitations": ["Price trend unavailable.", "Demand signal unavailable."],
        }

    commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()
    if not commodity:
        return {
            "commodity_id": commodity_id,
            "market_id": market_id,
            "score": 0,
            "verdict": "STORE",
            "reasons": ["Commodity not found."],
            "factors": [],
            "freshness": "unavailable",
            "generated_at": date.today().isoformat(),
            "limitations": ["Commodity lookup failed."],
        }

    factors: list[dict[str, Any]] = []
    score = 0.0

    # Factor 1: Price trend (0-40 points)
    trend = intelligence.get("trend", "unknown")
    price_change = intelligence.get("price_change_percent")
    confidence = intelligence.get("confidence", "low")

    trend_score = 0.0
    if trend == "rising" and price_change is not None:
        trend_score = _clamp(20 + price_change * 2, 0, 40)
        factors.append({
            "name": "Price Trend",
            "contribution": round(trend_score, 1),
            "weight": PRICE_TREND_WEIGHT,
            "detail": f"Modal price trending up {price_change:.1f}% over recent window.",
        })
    elif trend == "falling" and price_change is not None:
        trend_score = _clamp(20 + price_change * 2, 0, 40)
        factors.append({
            "name": "Price Trend",
            "contribution": round(trend_score, 1),
            "weight": PRICE_TREND_WEIGHT,
            "detail": f"Modal price trending down {abs(price_change):.1f}% over recent window.",
        })
    elif trend == "flat":
        trend_score = 18.0
        factors.append({
            "name": "Price Trend",
            "contribution": round(trend_score, 1),
            "weight": PRICE_TREND_WEIGHT,
            "detail": "Modal price stable over recent window.",
        })
    else:
        trend_score = 8.0
        factors.append({
            "name": "Price Trend",
            "contribution": round(trend_score, 1),
            "weight": PRICE_TREND_WEIGHT,
            "detail": "Insufficient historical data for reliable trend calculation.",
        })

    if confidence == "low":
        factors.append({
            "name": "Data Confidence",
            "contribution": -5.0,
            "weight": 0,
            "detail": "Limited or stale observations reduce confidence in this recommendation.",
        })
    elif confidence == "medium":
        factors.append({
            "name": "Data Confidence",
            "contribution": 0.0,
            "weight": 0,
            "detail": "Moderate observation count; recommendation is partially reliable.",
        })
    else:
        factors.append({
            "name": "Data Confidence",
            "contribution": 2.0,
            "weight": 0,
            "detail": "Sufficient recent observations support this recommendation.",
        })

    score += trend_score

    # Factor 2: Demand signal (0-20 points) from Demand Radar
    demand_signal = calculate_demand_signal(db, commodity_id, market_id)
    demand_score = round((demand_signal.get("score", 0.0) / 100.0) * DEMAND_SIGNAL_WEIGHT, 1)
    score += demand_score
    if demand_signal.get("num_demands", 0) > 0:
        demand_detail = (
            f"Demand Radar reports {demand_signal['num_demands']} active demand(s) "
            f"for this commodity ({demand_signal['demand_quantity']:.0f} {demand_signal.get('commodity_id') and 'kg'}); "
            f"urgency {demand_signal['urgency']:.0%}."
        )
    else:
        demand_detail = "Demand Radar reports no active demand for this commodity."
    factors.append({
        "name": "Demand Signal",
        "contribution": float(demand_score),
        "weight": DEMAND_SIGNAL_WEIGHT,
        "detail": demand_detail,
    })

    # Factor 3: Perishability (0-20 points)
    perishability_score = 0.0
    if commodity.is_perishable:
        profile = (commodity.perishability_profile or "").lower()
        if any(term in profile for term in ["7-10 days", "2-3 weeks", "short"]):
            perishability_score = 16.0
            factors.append({
                "name": "Perishability",
                "contribution": perishability_score,
                "weight": PERISHABILITY_WEIGHT,
                "detail": f"{commodity.name} is highly perishable ({commodity.perishability_profile}), favoring quicker sale.",
            })
        else:
            perishability_score = 12.0
            factors.append({
                "name": "Perishability",
                "contribution": perishability_score,
                "weight": PERISHABILITY_WEIGHT,
                "detail": f"{commodity.name} has moderate perishability; consider selling within recommended window.",
            })
    else:
        perishability_score = 4.0
        factors.append({
            "name": "Perishability",
            "contribution": perishability_score,
            "weight": PERISHABILITY_WEIGHT,
            "detail": f"{commodity.name} is non-perishable; storage is a viable alternative.",
        })

    score += perishability_score

    # Factor 4: Storage access/cost (0-20 points)
    storage_options = (
        db.query(StorageOption)
        .filter(
            StorageOption.is_available == True,  # noqa: E712
            StorageOption.commodity_suitability.ilike(f"%{commodity.name}%"),
        )
        .all()
    )

    storage_score = 0.0
    if storage_options:
        cheapest = min(
            (opt.cost_per_quintal for opt in storage_options if opt.cost_per_quintal is not None),
            default=None,
        )
        if cheapest is not None and cheapest <= 100:
            storage_score = 14.0
            factors.append({
                "name": "Storage Access",
                "contribution": storage_score,
                "weight": STORAGE_ACCESS_WEIGHT,
                "detail": f"Available storage near crop location (from ₹{cheapest}/quintal). Storing is affordable.",
            })
        elif cheapest is not None:
            storage_score = 8.0
            factors.append({
                "name": "Storage Access",
                "contribution": storage_score,
                "weight": STORAGE_ACCESS_WEIGHT,
                "detail": f"Storage available but relatively costly (from ₹{cheapest}/quintal). Weigh cost vs. price upside.",
            })
        else:
            storage_score = 6.0
            factors.append({
                "name": "Storage Access",
                "contribution": storage_score,
                "weight": STORAGE_ACCESS_WEIGHT,
                "detail": "Storage exists but cost data is missing; treat as uncertain.",
            })
    else:
        storage_score = 2.0
        factors.append({
            "name": "Storage Access",
            "contribution": storage_score,
            "weight": STORAGE_ACCESS_WEIGHT,
            "detail": "No suitable storage found nearby. Immediate sale is safer.",
        })

    score += storage_score

    # Confidence adjustment
    if confidence == "low":
        score = score * 0.8

    score = _clamp(round(score, 1), 0, 100)

    if score >= VERDICT_SELL_NOW_MIN:
        verdict = "SELL_NOW"
    elif score >= VERDICT_SELL_SOON_MIN:
        verdict = "SELL_SOON"
    elif score >= VERDICT_WAIT_MIN:
        verdict = "WAIT"
    else:
        verdict = "STORE"

    top_factors = sorted(factors, key=lambda f: f.get("contribution", 0), reverse=True)[:3]
    reasons = [f"{f['name']}: {f['detail']}" for f in top_factors if f.get("contribution", 0) >= 0]

    limitations = []
    if trend == "insufficient_data":
        limitations.append("Insufficient price history for reliable trend analysis.")
    if intelligence.get("freshness") and "stale" in intelligence.get("freshness", ""):
        limitations.append("Price data is stale; recommendation may be less reliable.")
    if demand_signal.get("num_demands", 0) == 0:
        limitations.append("No active demand data for this commodity; demand contribution is 0.")
    else:
        limitations.append("Demand signal reflects live active Demand records (see Demand Radar).")

    return {
        "commodity_id": commodity_id,
        "commodity_name": commodity.name,
        "market_id": market_id,
        "market_name": intelligence.get("market_name"),
        "score": score,
        "verdict": verdict,
        "reasons": reasons,
        "factors": factors,
        "freshness": intelligence.get("freshness", "unavailable"),
        "generated_at": date.today().isoformat(),
        "limitations": limitations,
        "algorithm": {
            "name": "Sale Window Score v1",
            "weights": {
                "price_trend": PRICE_TREND_WEIGHT,
                "demand_signal": DEMAND_SIGNAL_WEIGHT,
                "perishability": PERISHABILITY_WEIGHT,
                "storage_access": STORAGE_ACCESS_WEIGHT,
            },
            "trend_method": "Recent 7-day avg vs previous 7-day avg modal price",
            "demand_placeholder": False,
            "demand_signal": round(demand_signal.get("score", 0.0), 1),
        },
    }
