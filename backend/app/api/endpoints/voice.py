import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.farmer import Farmer
from app.models.market import Market
from app.models.produce_lot import ProduceLot
from app.models.user import User
from app.schemas.voice import VoiceQueryRequest, VoiceQueryResponse
from app.services.sale_window import calculate_sale_window_score
from app.services.price_intelligence import get_price_history
from app.services.lot_matching import find_matches_for_lot
from app.services.demand_radar import calculate_demand_signal
from app.utils.dependencies import require_roles

router = APIRouter()


_WORD_RE = re.compile(r"[a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF]+")


def _words(text: str) -> list[str]:
    return _WORD_RE.findall(text.lower())


def _has_word(query: str, keyword: str) -> bool:
    return keyword.lower() in _words(query)


_INTENT_RULES: list[tuple[str, list[str]]] = [
    ("recommendation", [
        "sell", "selling", "sale", "store", "storage", "hold", "list",
        "when should i sell", "should i sell", "sell now", "should i store",
        "कब", "बेचूं", "बेचना", "अभी", "स्टोर", "भंडारण", "बेचने",
        "ಯಾವಾಗ", "ಮಾರಬೇಕು", "ಮಾರಬೇಕೇ", "ಈಗ", "ಸಂಗ್ರಹಿಸಬೇಕೇ", "ಮಾರಾಟ",
        "ಉಳಿಸಬೇಕು", "ಅಮ್ಮಬೇಕು", "ಅಮ್ಮಬೇಕೆ",
        "ఎప్పుడు", "అమ్మాలి", "అమ్మాలా", "ఇప్పుడు", "నిల్వ", "అమ్మటం",
    ]),
    ("market_price",   [
        "price", "prices", "cost", "rate", "mandi", "market",
        "today's price", "how much is", "what is the price", "price of",
        "आज", "का भाव", "कीमत", "मंडी", "बाजार", "भाव",
        "ಇಂದಿನ", "ಬೆಲೆ", "ಮಾರುಕಟ್ಟೆ", "ಮಂಡಿ", "ದರ",
        "నేటి", "ధర", "మార్కెట్", "మండీ", "రేటు",
    ]),
    ("price_trend",    [
        "trend", "going up", "going down", "rising", "falling",
        "भाव बढ़", "भाव गिर", "कीमत बढ़", "कीमत गिर",
        "ಬೆಲೆ ಏರು", "ಬೆಲೆ ಇಳಿ", "ಬೆಲೆ ಟ್ರೆಂಡ್",
        "ధర పెరుగు", "ధర తగ్గు", "ధర ట్రెండ్",
    ]),
    ("my_lots",        [
        "lots", "lot", "produce", "crops", "crop",
        "मेरे लॉट", "मेरी फसल", "उत्पाद", "मेरा स्टॉक",
        "ನನ್ನ ಲಾಟ್", "ನನ್ನ ಬೆಳೆ", "ನನ್ನ ಉತ್ಪನ್ನ",
        "నా లాట్", "నా పంట", "నా ఉత్పత్తి",
    ]),
    ("offers",         [
        "offers", "offer", "buyer offer",
        "ऑफर", "प्रस्ताव", "खरीदार",
        "ಆಫರ್", "ಖರೀದಿದಾರ", "ಪ್ರಸ್ತಾಪ",
        "ఆఫర్", "కొనుగోలుదారు",
    ]),
    ("buyers",         [
        "buyer", "buyers", "matched", "match",
        "खरीदार", "मैच", "रुचి",
        "ಖರೀದಿದಾರ", "ಮೆಚ್ಚುಕೆ", "ಆಸಕ್ತಿ",
        "కొనుగోలుదారు", "మ్యాట్", "ఆసక్తి",
    ]),
    ("shipments",      [
        "shipment", "shipments", "delivery", "transit",
        "शिपमेंट", "पहुंच", "डिलीवरी", "भेजना",
        "ಡೆಲಿವರಿ", "ಶಿಪ್‌ಮೆಂಟ್",
        "డెలివరీ", "షిప్‌మెంట్",
    ]),
    ("payments",       [
        "payment", "payments", "paid",
        "भुगतान", "पैसा", "राशी",
        "ಪೇಮೆಂಟ್", "ಚೆಲವಿ", "ಹಣ",
        "చెల్లిళ్ళు", "ధన", "నగదు",
    ]),
    ("help",           [
        "help", "assist",
        "सहायता", "मदद", "क्या कर सकते हो",
        "ಸಹಾಯ", "ಏನು ಮಾಡಬಹುದು",
        "సహాయం", "ఏమి చేయవచ్చు",
    ]),
]


def detect_intent(query: str) -> str:
    for intent, keywords in _INTENT_RULES:
        for kw in keywords:
            if _has_word(query, kw):
                return intent
    return "unknown"


def _get_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _default_market(db: Session) -> Market | None:
    return db.query(Market).first()


def _format_inr(value: float) -> str:
    if value >= 1_00_000:
        return f"₹{value / 1_00_000:.2f} lakhs"
    if value >= 1_000:
        return f"₹{value / 1_000:.1f}k"
    return f"₹{value:.0f}"


def _handle_recommendation(db: Session, farmer: Farmer, req: VoiceQueryRequest) -> dict:
    commodity_id = req.commodity_id
    market_id = req.market_id

    if commodity_id is None or market_id is None:
        if req.lot_id is not None:
            lot = db.get(ProduceLot, req.lot_id)
            if lot and lot.farmer_id == farmer.id:
                if commodity_id is None:
                    commodity_id = lot.commodity_id
                if market_id is None and lot.location:
                    market = db.query(Market).filter(
                        Market.name.ilike(f"%{lot.location}%")
                    ).first()
                    if market:
                        market_id = market.id

    if commodity_id is None or market_id is None:
        market = _default_market(db)
        if market:
            market_id = market.id
        lot = db.query(ProduceLot).filter(
            ProduceLot.farmer_id == farmer.id,
            ProduceLot.commodity_id.is_not(None),
        ).first()
        if lot:
            commodity_id = lot.commodity_id

    if commodity_id is None or market_id is None:
        return {
            "intent": "recommendation",
            "text": "Please publish a produce lot with crop and location details to receive a personalized recommendation.",
            "data": {"available": False, "reason": "no_lot"},
            "action_hint": "Create a produce lot first",
        }

    result = calculate_sale_window_score(db, commodity_id, market_id, farmer.id)

    if "error" in result and result.get("error"):
        return {
            "intent": "recommendation",
            "text": f"Price data is not yet available for this crop and market. Please try again later or check nearby mandis.",
            "data": {"available": False, "reason": "no_price_data"},
            "action_hint": "View nearby mandis",
        }

    verdict = result.get("verdict", "UNKNOWN")
    score = result.get("score", 0)
    reasons = result.get("reasons", [])[:2]
    commodity_name = result.get("commodity_name", "your crop")
    freshness = result.get("freshness", "unknown")

    verdict_label = {
        "SELL_NOW": "SELL NOW",
        "SELL_SOON": "SELL SOON",
        "WAIT": "WAIT",
        "STORE": "STORE",
    }.get(verdict, verdict)

    lines = [f"[{verdict_label}] Score: {score}/100 for {commodity_name}."]
    if reasons:
        lines.append("Reasons:")
        for r in reasons:
            lines.append(f"  - {r}")
    lines.append(f"Data freshness: {freshness}.")

    return {
        "intent": "recommendation",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "verdict": verdict_label,
            "score": score,
            "commodity_name": commodity_name,
            "reasons": reasons,
            "freshness": freshness,
            "limitations": result.get("limitations", []),
        },
        "action_hint": "List your produce lot",
    }


def _handle_market_price(db: Session, farmer: Farmer, req: VoiceQueryRequest) -> dict:
    commodity_id = req.commodity_id
    market_id = req.market_id

    if commodity_id is None or market_id is None:
        if req.lot_id is not None:
            lot = db.get(ProduceLot, req.lot_id)
            if lot and lot.farmer_id == farmer.id:
                if commodity_id is None:
                    commodity_id = lot.commodity_id
                if market_id is None and lot.location:
                    market = db.query(Market).filter(
                        Market.name.ilike(f"%{lot.location}%")
                    ).first()
                    if market:
                        market_id = market.id

    if commodity_id is None or market_id is None:
        market = _default_market(db)
        if market:
            market_id = market.id
        lot = db.query(ProduceLot).filter(
            ProduceLot.farmer_id == farmer.id,
            ProduceLot.commodity_id.is_not(None),
        ).first()
        if lot:
            commodity_id = lot.commodity_id

    if commodity_id is None or market_id is None:
        return {
            "intent": "market_price",
            "text": "No crop or market information available. Please add a produce lot first.",
            "data": {"available": False},
            "action_hint": "Add a produce lot",
        }

    history = get_price_history(db, commodity_id, market_id, days=14)

    if not history:
        return {
            "intent": "market_price",
            "text": "Price history is not yet available for this crop and market. Please try again later.",
            "data": {"available": False},
            "action_hint": "View nearby mandis",
        }

    latest = history[0]
    commodity = db.query(ProduceLot).filter(
        ProduceLot.id == req.lot_id
    ).first() if req.lot_id else None

    latest_price = latest.get("modal_price")
    avg_price = sum(h.get("modal_price", 0) for h in history) / len(history)

    direction = "stable"
    if latest_price and avg_price and len(history) >= 2:
        change_pct = ((latest_price - avg_price) / avg_price) * 100
        if change_pct > 2:
            direction = f"up {change_pct:.1f}%"
        elif change_pct < -2:
            direction = f"down {abs(change_pct):.1f}%"

    price_str = _format_inr(latest_price) if latest_price else "unavailable"
    lines = [
        f"Latest modal price: {price_str}.",
        f"14-day average: {_format_inr(avg_price)}.",
        f"Trend: {direction} compared to the recent average.",
        f"Records available: {len(history)} days.",
    ]

    return {
        "intent": "market_price",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "latest_price": latest_price,
            "avg_price": round(avg_price, 2),
            "direction": direction,
            "days": len(history),
        },
        "action_hint": "View full price history",
    }


def _handle_my_lots(db: Session, farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    lots = db.query(ProduceLot).filter(ProduceLot.farmer_id == farmer.id).all()

    if not lots:
        return {
            "intent": "my_lots",
            "text": "You have no produce lots yet. Create a lot to start receiving buyer offers.",
            "data": {"available": False, "count": 0},
            "action_hint": "Create a produce lot",
        }

    lines = [f"You have {len(lots)} lot(s):"]
    for lot in lots:
        lines.append(
            f"  Lot #{lot.id}: {lot.crop or 'Unknown crop'}, "
            f"{lot.quantity_kg or '?'} {lot.unit or 'kg'}, "
            f"Grade {lot.quality_grade}, Status: {lot.status}"
        )

    return {
        "intent": "my_lots",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "count": len(lots),
            "lots": [
                {
                    "id": l.id,
                    "crop": l.crop,
                    "quantity_kg": l.quantity_kg,
                    "unit": l.unit,
                    "quality_grade": l.quality_grade,
                    "status": l.status,
                }
                for l in lots
            ],
        },
        "action_hint": "View all lots",
    }


def _handle_offers(db: Session, farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    from app.models.offer import Offer

    lot_ids = [l.id for l in db.query(ProduceLot).filter(ProduceLot.farmer_id == farmer.id).all()]
    if not lot_ids:
        return {
            "intent": "offers",
            "text": "You have no lots published yet, so no buyer offers are available. Create a lot first.",
            "data": {"available": False, "count": 0},
            "action_hint": "Create a produce lot",
        }

    offers = db.query(Offer).filter(Offer.lot_id.in_(lot_ids)).order_by(Offer.created_at.desc()).all()

    if not offers:
        return {
            "intent": "offers",
            "text": "No buyer offers yet for your lots. Offers appear after buyers review your published lots.",
            "data": {"available": True, "count": 0},
            "action_hint": "Check back later",
        }

    pending = [o for o in offers if o.status == "pending"]
    accepted = [o for o in offers if o.status == "accepted"]

    lines = [f"You have {len(offers)} offer(s):"]
    if pending:
        lines.append(f"  {len(pending)} pending (awaiting your response)")
    if accepted:
        lines.append(f"  {len(accepted)} accepted")
    lines.append(f"  Latest: Offer #{offers[0].id} at {_format_inr(offers[0].offered_price)} for Lot #{offers[0].lot_id}")

    return {
        "intent": "offers",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "count": len(offers),
            "pending": len(pending),
            "accepted": len(accepted),
            "latest_offer": {
                "id": offers[0].id,
                "price": offers[0].offered_price,
                "lot_id": offers[0].lot_id,
                "status": offers[0].status,
            },
        },
        "action_hint": "Review offers",
    }


def _handle_shipments(db: Session, farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    from app.models.transaction import Transaction
    from app.models.shipment import Shipment

    tx_ids = [t.id for t in db.query(Transaction).filter(Transaction.farmer_id == farmer.id).all()]
    if not tx_ids:
        return {
            "intent": "shipments",
            "text": "You have no transactions yet, so no shipments are in progress. Shipments begin after an offer is accepted.",
            "data": {"available": False, "count": 0},
            "action_hint": "Accept a buyer offer",
        }

    shipments = db.query(Shipment).filter(Shipment.transaction_id.in_(tx_ids)).order_by(Shipment.created_at.desc()).all()

    if not shipments:
        return {
            "intent": "shipments",
            "text": "No shipments have been created yet. Shipments are arranged after offer acceptance.",
            "data": {"available": True, "count": 0},
            "action_hint": "Accept a buyer offer",
        }

    active = [s for s in shipments if s.status not in ("delivered", "cancelled")]
    lines = [f"You have {len(shipments)} shipment(s):"]
    for s in shipments[:5]:
        lines.append(f"  Shipment #{s.id}: {s.status}, {s.pickup_location} → {s.delivery_location}")
    if active:
        lines.append(f"{len(active)} currently in progress.")

    return {
        "intent": "shipments",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "count": len(shipments),
            "active_count": len(active),
            "shipments": [
                {
                    "id": s.id,
                    "status": s.status,
                    "pickup": s.pickup_location,
                    "delivery": s.delivery_location,
                }
                for s in shipments
            ],
        },
        "action_hint": "Track shipments",
    }


def _handle_payments(db: Session, farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    from app.models.transaction import Transaction
    from app.models.payment import Payment

    tx_ids = [t.id for t in db.query(Transaction).filter(Transaction.farmer_id == farmer.id).all()]
    if not tx_ids:
        return {
            "intent": "payments",
            "text": "You have no transactions yet. Payments are processed after delivery is confirmed.",
            "data": {"available": False, "count": 0},
            "action_hint": "Complete a transaction",
        }

    payments = db.query(Payment).filter(Payment.transaction_id.in_(tx_ids)).order_by(Payment.created_at.desc()).all()

    if not payments:
        return {
            "intent": "payments",
            "text": "No payments have been initiated yet. Payments start after delivery confirmation.",
            "data": {"available": True, "count": 0},
            "action_hint": "Confirm delivery",
        }

    completed = [p for p in payments if p.status == "completed"]
    pending = [p for p in payments if p.status not in ("completed", "failed")]
    total_completed = sum(p.amount for p in completed)

    lines = [f"You have {len(payments)} payment record(s):"]
    lines.append(f"  Total received: {_format_inr(total_completed)}")
    lines.append(f"  Completed: {len(completed)}, Pending: {len(pending)}")
    if pending:
        lines.append(f"  Latest pending: Payment #{pending[0].id}, {_format_inr(pending[0].amount)}")

    return {
        "intent": "payments",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "count": len(payments),
            "completed_count": len(completed),
            "pending_count": len(pending),
            "total_received": total_completed,
        },
        "action_hint": "View payment details",
    }


def _handle_buyers(db: Session, farmer: Farmer, req: VoiceQueryRequest) -> dict:
    from app.models.offer import Offer

    lot_ids = [l.id for l in db.query(ProduceLot).filter(ProduceLot.farmer_id == farmer.id).all()]
    if not lot_ids:
        return {
            "intent": "buyers",
            "text": "You have no lots published yet. Buyers find you through your published produce lots.",
            "data": {"available": False},
            "action_hint": "Create a produce lot",
        }

    target_lot_id = req.lot_id or lot_ids[0]
    try:
        matches = find_matches_for_lot(db, target_lot_id)
    except Exception:
        matches = None

    if not matches:
        return {
            "intent": "buyers",
            "text": f"No matched buyers found for Lot #{target_lot_id} right now. Buyers appear as demand records match your produce.",
            "data": {"available": False, "lot_id": target_lot_id},
            "action_hint": "Check the Offers tab",
        }

    top = matches[:3]
    lines = [f"Found {len(matches)} buyer match(es) for Lot #{target_lot_id}:"]
    for m in top:
        lines.append(
            f"  Buyer #{m.get('buyer_id')}: match score {m.get('match_score', 0):.0f}%, "
            f"grade {m.get('grade_compatibility')}"
        )

    return {
        "intent": "buyers",
        "text": "\n".join(lines),
        "data": {
            "available": True,
            "lot_id": target_lot_id,
            "match_count": len(matches),
            "top_matches": top,
        },
        "action_hint": "Review buyer offers",
    }


def _handle_help(_db: Session, _farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    return {
        "intent": "help",
        "text": (
            "You can ask about:\n"
            "  - When to sell or store your crops\n"
            "  - Current crop prices and trends\n"
            "  - Your produce lots\n"
            "  - Buyer offers\n"
            "  - Shipments and payments\n"
            "  - Matched buyers\n"
            "  - Or ask for general help."
        ),
        "data": None,
        "action_hint": None,
    }


def _handle_unknown(_db: Session, _farmer: Farmer, _req: VoiceQueryRequest) -> dict:
    return {
        "intent": "unknown",
        "text": "Try asking about today's price, when to sell, your lots, buyers, or payments.",
        "data": None,
        "action_hint": None,
    }


_INTENT_HANDLERS = {
    "recommendation": _handle_recommendation,
    "market_price": _handle_market_price,
    "price_trend": _handle_market_price,
    "my_lots": _handle_my_lots,
    "produce": _handle_my_lots,
    "offers": _handle_offers,
    "buyers": _handle_buyers,
    "shipments": _handle_shipments,
    "payments": _handle_payments,
    "help": _handle_help,
    "unknown": _handle_unknown,
}


@router.post("/query", response_model=VoiceQueryResponse)
def voice_query(
    req: VoiceQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.farmer,
        UserRole.fpo_manager,
        UserRole.field_agent,
        UserRole.admin,
    )),
):
    farmer = _get_farmer(db, current_user)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found for this account",
        )

    intent = detect_intent(req.query)
    handler = _INTENT_HANDLERS.get(intent, _handle_help)

    try:
        result = handler(db, farmer, req)
    except Exception:
        result = {
            "intent": intent,
            "text": "Something went wrong while processing your request. Please try again.",
            "data": {"error": True},
            "action_hint": None,
        }

    return VoiceQueryResponse(**result)
