from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import check_db_connection, get_db
from app.models.enums import DisputeStatus, TransactionStatus, UserRole
from app.models.user import User
from app.schemas.health import (
    AdminHealthApiStatus,
    AdminHealthAuditActivity,
    AdminHealthDatabaseStatus,
    AdminHealthDisputeCounts,
    AdminHealthMarketDataStatus,
    AdminHealthPaymentCounts,
    AdminHealthResponse,
    AdminHealthShipmentCounts,
    AdminHealthTransactionCounts,
    AdminHealthUserCounts,
)
from app.utils.dependencies import require_roles

router = APIRouter()

_FRESHNESS_THRESHOLD = timedelta(days=7)


@router.get("/health", response_model=AdminHealthResponse, summary="Admin system health")
def get_admin_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
) -> AdminHealthResponse:
    db_connected = check_db_connection()
    database_status = "connected" if db_connected else "error"
    overall_status = "degraded" if not db_connected else "healthy"

    users_total = db.execute(select(func.count(User.id))).scalar_one()
    users_active = db.execute(select(func.count(User.id)).where(User.is_active.is_(True))).scalar_one()

    from app.models.transaction import Transaction
    transactions_total = db.execute(select(func.count(Transaction.id))).scalar_one()
    transactions_pending = db.execute(
        select(func.count(Transaction.id)).where(Transaction.status == TransactionStatus.pending)
    ).scalar_one()

    from app.models.payment import Payment
    payments_total = db.execute(select(func.count(Payment.id))).scalar_one()
    payments_pending = db.execute(select(func.count(Payment.id)).where(Payment.status == "pending")).scalar_one()

    from app.models.shipment import Shipment
    shipments_total = db.execute(select(func.count(Shipment.id))).scalar_one()
    shipments_pending = db.execute(select(func.count(Shipment.id)).where(Shipment.status == "pending")).scalar_one()

    from app.models.dispute import Dispute
    disputes_total = db.execute(select(func.count(Dispute.id))).scalar_one()
    open_disputes = db.execute(
        select(func.count(Dispute.id)).where(
            Dispute.status.in_([DisputeStatus.open, DisputeStatus.under_review, DisputeStatus.awaiting_evidence])
        )
    ).scalar_one()

    from app.models.audit_log import AuditLog
    cutoff = datetime.utcnow() - timedelta(hours=24)
    audit_events_24h = db.execute(select(func.count(AuditLog.id)).where(AuditLog.created_at >= cutoff)).scalar_one()

    from app.models.market_price import MarketPrice
    latest_price = db.execute(select(func.max(MarketPrice.created_at))).scalar_one_or_none()
    market_status = "no_data"
    latest_timestamp = None
    if latest_price is not None:
        latest_timestamp = latest_price.isoformat()
        if datetime.utcnow() - latest_price <= _FRESHNESS_THRESHOLD:
            market_status = "fresh"
        else:
            market_status = "stale"

    return AdminHealthResponse(
        status=overall_status,
        api=AdminHealthApiStatus(status="operational"),
        database=AdminHealthDatabaseStatus(status=database_status),
        market_data=AdminHealthMarketDataStatus(status=market_status, latest_timestamp=latest_timestamp),
        users=AdminHealthUserCounts(total=users_total, active=users_active),
        transactions=AdminHealthTransactionCounts(total=transactions_total, pending=transactions_pending),
        payments=AdminHealthPaymentCounts(total=payments_total, pending=payments_pending),
        shipments=AdminHealthShipmentCounts(total=shipments_total, pending=shipments_pending),
        disputes=AdminHealthDisputeCounts(total=disputes_total, open=open_disputes),
        audit=AdminHealthAuditActivity(events_last_24h=audit_events_24h),
    )
