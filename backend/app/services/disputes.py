"""Dispute and evidence service with append-only audit logging."""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.enums import DisputeStatus, TransactionStatus, UserRole
from app.models.audit_log import AuditLog
from app.models.dispute import Dispute
from app.models.dispute_evidence import DisputeEvidence
from app.models.transaction import Transaction
from app.services.audit import record_audit


class DisputeError(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


VALID_DISPUTE_TRANSITIONS = {
    DisputeStatus.open: {DisputeStatus.under_review},
    DisputeStatus.under_review: {DisputeStatus.open, DisputeStatus.awaiting_evidence},
    DisputeStatus.awaiting_evidence: {DisputeStatus.under_review, DisputeStatus.escalated},
    DisputeStatus.escalated: {DisputeStatus.awaiting_evidence, DisputeStatus.resolved},
    DisputeStatus.resolved: set(),
}


def _assert_valid_dispute_transition(current: DisputeStatus, next_status: DisputeStatus) -> None:
    allowed = VALID_DISPUTE_TRANSITIONS.get(current, set())
    if next_status not in allowed:
        raise DisputeError(
            f"Invalid dispute status transition from '{current.value}' to '{next_status.value}'",
            status_code=409,
        )


def _assert_dispute_visible(db: Session, dispute: Dispute, current_user, transaction: Transaction) -> None:
    if current_user.role in (UserRole.fpo_manager, UserRole.admin):
        return
    if current_user.role == UserRole.farmer:
        from app.models.farmer import Farmer
        farmer = db.query(Farmer).filter(Farmer.user_id == current_user.id).first()
        if not farmer or transaction.farmer_id != farmer.id:
            raise DisputeError("Not authorized to view this dispute", status_code=403)
    elif current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer or transaction.buyer_id != buyer.id:
            raise DisputeError("Not authorized to view this dispute", status_code=403)
    else:
        raise DisputeError("Not authorized to view this dispute", status_code=403)


def _update_transaction_to_disputed(db: Session, transaction_id: int, actor_user_id: Optional[int] = None) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise DisputeError("Transaction not found", status_code=404)
    if transaction.status != TransactionStatus.disputed:
        transaction.status = TransactionStatus.disputed
        db.commit()
        db.refresh(transaction)
        record_audit(
            db,
            action="transaction.status.updated",
            entity_type="transaction",
            entity_id=transaction.id,
            actor_user_id=actor_user_id,
            details=f"status -> {TransactionStatus.disputed.value}",
        )
    return transaction


def open_dispute(
    db: Session,
    transaction_id: int,
    opened_by_user_id: int,
    reason: str,
    description: Optional[str] = None,
    priority: str = "medium",
) -> Dispute:
    transaction = db.get(Transaction, transaction_id)
    if transaction is None:
        raise DisputeError("Transaction not found", status_code=404)

    from app.models.buyer import Buyer
    from app.models.farmer import Farmer
    buyer = db.get(Buyer, transaction.buyer_id)
    farmer = db.get(Farmer, transaction.farmer_id)

    authorized_user_ids = set()
    if buyer and buyer.user_id:
        authorized_user_ids.add(buyer.user_id)
    if farmer and farmer.user_id:
        authorized_user_ids.add(farmer.user_id)

    if opened_by_user_id not in authorized_user_ids:
        raise DisputeError("Only buyer or farmer can open a dispute for this transaction", status_code=403)

    dispute = Dispute(
        transaction_id=transaction_id,
        opened_by_user_id=opened_by_user_id,
        reason=reason,
        description=description,
        status=DisputeStatus.open,
        priority=priority,
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)

    _update_transaction_to_disputed(db, transaction_id, actor_user_id=opened_by_user_id)

    record_audit(
        db,
        action="dispute.opened",
        entity_type="dispute",
        entity_id=dispute.id,
        actor_user_id=opened_by_user_id,
        details=f"transaction_id={transaction_id} reason={reason}",
    )
    db.commit()
    db.refresh(dispute)
    return dispute


def update_dispute_status(
    db: Session,
    dispute_id: int,
    next_status: DisputeStatus,
    actor_user_id: Optional[int] = None,
    resolution_notes: Optional[str] = None,
) -> Dispute:
    dispute = db.get(Dispute, dispute_id)
    if dispute is None:
        raise DisputeError("Dispute not found", status_code=404)

    _assert_valid_dispute_transition(dispute.status, next_status)

    previous_status = dispute.status
    dispute.status = next_status
    if next_status == DisputeStatus.resolved:
        dispute.resolved_by_user_id = actor_user_id
        dispute.resolved_at = datetime.utcnow()
        dispute.resolution_notes = resolution_notes

    db.commit()
    db.refresh(dispute)

    record_audit(
        db,
        action="dispute.status.updated",
        entity_type="dispute",
        entity_id=dispute.id,
        actor_user_id=actor_user_id,
        details=f"status {previous_status.value} -> {next_status.value}",
    )
    db.commit()
    db.refresh(dispute)
    return dispute


def add_dispute_evidence(
    db: Session,
    dispute_id: int,
    uploaded_by_user_id: int,
    evidence_type: str,
    file_name: str,
    file_path: Optional[str] = None,
    description: Optional[str] = None,
) -> DisputeEvidence:
    dispute = db.get(Dispute, dispute_id)
    if dispute is None:
        raise DisputeError("Dispute not found", status_code=404)

    evidence = DisputeEvidence(
        dispute_id=dispute_id,
        uploaded_by_user_id=uploaded_by_user_id,
        evidence_type=evidence_type,
        file_name=file_name,
        file_path=file_path,
        description=description,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    record_audit(
        db,
        action="evidence.added",
        entity_type="dispute_evidence",
        entity_id=evidence.id,
        actor_user_id=uploaded_by_user_id,
        details=f"dispute_id={dispute_id} type={evidence_type}",
    )
    db.commit()
    db.refresh(evidence)
    return evidence


def get_dispute_evidence(db: Session, dispute_id: int) -> list[DisputeEvidence]:
    return db.query(DisputeEvidence).filter(DisputeEvidence.dispute_id == dispute_id).order_by(DisputeEvidence.created_at).all()


def get_dispute(db: Session, dispute_id: int) -> Dispute:
    dispute = db.get(Dispute, dispute_id)
    if dispute is None:
        raise DisputeError("Dispute not found", status_code=404)
    return dispute


def get_disputes(db: Session, transaction_id: Optional[int] = None) -> list[Dispute]:
    query = db.query(Dispute)
    if transaction_id is not None:
        query = query.filter(Dispute.transaction_id == transaction_id)
    return query.order_by(Dispute.created_at.desc()).all()
