from datetime import date, timedelta
from typing import Any

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.commodity import Commodity
from app.models.market import Market
from app.models.market_price import MarketPrice
from app.models.storage_option import StorageOption

RECENT_WINDOW_DAYS = 7
PREVIOUS_WINDOW_DAYS = 7
MIN_OBSERVATIONS_FOR_TREND = 3
STALE_DAYS = 3


def _safe_avg(values: list[float]) -> float | None:
    filtered = [v for v in values if v is not None and v > 0]
    if not filtered:
        return None
    return sum(filtered) / len(filtered)


def _safe_float(value: Any) -> float | None:
    try:
        v = float(value)
        return v if v > 0 else None
    except (TypeError, ValueError):
        return None


def get_price_intelligence(db: Session, commodity_id: int, market_id: int) -> dict:
    commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()
    market = db.query(Market).filter(Market.id == market_id).first()

    if not commodity or not market:
        return {
            "commodity_id": commodity_id,
            "market_id": market_id,
            "error": "Commodity or market not found",
            "freshness": "unavailable",
            "trend": "unknown",
            "latest_modal_price": None,
            "recent_avg_price": None,
            "previous_avg_price": None,
            "price_change_percent": None,
            "confidence": "low",
        }

    today = date.today()
    recent_start = today - timedelta(days=RECENT_WINDOW_DAYS)
    previous_start = recent_start - timedelta(days=PREVIOUS_WINDOW_DAYS)

    recent_prices = (
        db.query(MarketPrice)
        .filter(
            MarketPrice.commodity_id == commodity_id,
            MarketPrice.market_id == market_id,
            MarketPrice.price_date >= recent_start,
            MarketPrice.price_date <= today,
        )
        .order_by(MarketPrice.price_date.asc())
        .all()
    )

    previous_prices = (
        db.query(MarketPrice)
        .filter(
            MarketPrice.commodity_id == commodity_id,
            MarketPrice.market_id == market_id,
            MarketPrice.price_date >= previous_start,
            MarketPrice.price_date < recent_start,
        )
        .order_by(MarketPrice.price_date.asc())
        .all()
    )

    all_prices = list(recent_prices) + list(previous_prices)
    latest = max(all_prices, key=lambda p: p.price_date) if all_prices else None

    recent_modal = [_safe_float(p.modal_price) for p in recent_prices]
    previous_modal = [_safe_float(p.modal_price) for p in previous_prices]

    recent_avg = _safe_avg(recent_modal)
    previous_avg = _safe_avg(previous_modal)

    price_change = None
    if recent_avg is not None and previous_avg is not None and previous_avg > 0:
        price_change = ((recent_avg - previous_avg) / previous_avg) * 100.0

    trend = "unknown"
    if price_change is not None:
        if price_change > 2.0:
            trend = "rising"
        elif price_change < -2.0:
            trend = "falling"
        else:
            trend = "flat"

    momentum = "flat"
    if len(recent_modal) >= 2:
        last_two = [v for v in recent_modal[-2:] if v is not None]
        if len(last_two) == 2:
            if last_two[-1] > last_two[0]:
                momentum = "up"
            elif last_two[-1] < last_two[0]:
                momentum = "down"

    freshness = "unavailable"
    confidence = "low"
    if latest:
        days_old = (today - latest.price_date).days
        if days_old == 0:
            freshness = "today"
            confidence = "high" if len(recent_prices) >= MIN_OBSERVATIONS_FOR_TREND else "medium"
        elif days_old == 1:
            freshness = "1 day old"
            confidence = "medium" if len(recent_prices) >= MIN_OBSERVATIONS_FOR_TREND else "low"
        elif days_old <= STALE_DAYS:
            freshness = f"{days_old} days old"
            confidence = "medium"
        else:
            freshness = f"{days_old} days old (stale)"
            confidence = "low"

    if len(recent_prices) < MIN_OBSERVATIONS_FOR_TREND:
        trend = "insufficient_data"
        confidence = "low"

    storage_options = (
        db.query(StorageOption)
        .filter(
            StorageOption.is_available == True,  # noqa: E712
            StorageOption.commodity_suitability.ilike(f"%{commodity.name}%"),
        )
        .all()
    )

    return {
        "commodity_id": commodity_id,
        "commodity_name": commodity.name,
        "market_id": market_id,
        "market_name": market.name,
        "latest_modal_price": _safe_float(latest.modal_price) if latest else None,
        "latest_min_price": _safe_float(latest.min_price) if latest else None,
        "latest_max_price": _safe_float(latest.max_price) if latest else None,
        "latest_price_date": latest.price_date.isoformat() if latest else None,
        "recent_avg_price": round(recent_avg, 2) if recent_avg is not None else None,
        "previous_avg_price": round(previous_avg, 2) if previous_avg is not None else None,
        "price_change_percent": round(price_change, 2) if price_change is not None else None,
        "trend": trend,
        "momentum": momentum,
        "freshness": freshness,
        "confidence": confidence,
        "recent_observations": len(recent_prices),
        "storage_options_available": len(storage_options),
        "source": latest.source if latest else "seeded_demo",
    }


def get_price_history(db: Session, commodity_id: int, market_id: int, days: int = 14) -> list[dict]:
    today = date.today()
    start = today - timedelta(days=days)

    prices = (
        db.query(MarketPrice)
        .filter(
            MarketPrice.commodity_id == commodity_id,
            MarketPrice.market_id == market_id,
            MarketPrice.price_date >= start,
            MarketPrice.price_date <= today,
        )
        .order_by(MarketPrice.price_date.asc())
        .all()
    )

    return [
        {
            "date": p.price_date.isoformat(),
            "min_price": _safe_float(p.min_price),
            "max_price": _safe_float(p.max_price),
            "modal_price": _safe_float(p.modal_price),
            "arrival_volume": _safe_float(p.arrival_volume),
            "source": p.source,
        }
        for p in prices
    ]
