from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DisputeStatus, UserRole
from app.models.farmer import Farmer
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.dispute import DisputeCreate, DisputeUpdate, DisputeResponse, DisputeListResponse
from app.schemas.dispute_evidence import DisputeEvidenceCreate, DisputeEvidenceResponse, DisputeEvidenceListResponse
from app.services.disputes import DisputeError, open_dispute, update_dispute_status, add_dispute_evidence, get_dispute_evidence, get_dispute, get_disputes
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


def _user_farmer(db: Session, user: User) -> Farmer | None:
    return db.query(Farmer).filter(Farmer.user_id == user.id).first()


def _assert_dispute_visible(db: Session, dispute: DisputeResponse, current_user: User) -> None:
    transaction = db.get(Transaction, dispute.transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if current_user.role in (UserRole.fpo_manager, UserRole.admin):
        return
    if current_user.role == UserRole.farmer:
        farmer = _user_farmer(db, current_user)
        if not farmer or transaction.farmer_id != farmer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
    elif current_user.role == UserRole.buyer:
        from app.models.buyer import Buyer
        buyer = db.query(Buyer).filter(Buyer.user_id == current_user.id).first()
        if not buyer or transaction.buyer_id != buyer.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this dispute")


@router.post("/", response_model=DisputeResponse, status_code=201)
def create_dispute(
    payload: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.farmer, UserRole.buyer, UserRole.admin)),
):
    try:
        dispute = open_dispute(
            db,
            transaction_id=payload.transaction_id,
            opened_by_user_id=current_user.id,
            reason=payload.reason,
            description=payload.description,
            priority=payload.priority,
        )
    except DisputeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return dispute


@router.get("/", response_model=DisputeListResponse)
def list_disputes(
    transaction_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    disputes = get_disputes(db, transaction_id=transaction_id)
    items = [DisputeResponse.model_validate(d) for d in disputes]
    return DisputeListResponse(items=items, total=len(items))


@router.get("/{dispute_id}", response_model=DisputeResponse)
def get_dispute_endpoint(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    dispute = get_dispute(db, dispute_id)
    _assert_dispute_visible(db, dispute, current_user)
    return DisputeResponse.model_validate(dispute)


@router.patch("/{dispute_id}/status", response_model=DisputeResponse)
def update_dispute_status_endpoint(
    dispute_id: int,
    payload: DisputeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    dispute = get_dispute(db, dispute_id)
    _assert_dispute_visible(db, dispute, current_user)
    if payload.status is None:
        raise HTTPException(status_code=400, detail="status is required")
    try:
        dispute = update_dispute_status(
            db,
            dispute_id=dispute_id,
            next_status=payload.status,
            actor_user_id=current_user.id,
            resolution_notes=payload.resolution_notes,
        )
    except DisputeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return DisputeResponse.model_validate(dispute)


@router.post("/{dispute_id}/evidence", response_model=DisputeEvidenceResponse, status_code=201)
def create_dispute_evidence(
    dispute_id: int,
    payload: DisputeEvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    dispute = get_dispute(db, dispute_id)
    _assert_dispute_visible(db, dispute, current_user)
    try:
        evidence = add_dispute_evidence(
            db,
            dispute_id=dispute_id,
            uploaded_by_user_id=current_user.id,
            evidence_type=payload.evidence_type,
            file_name=payload.file_name,
            file_path=payload.file_path,
            description=payload.description,
        )
    except DisputeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    return evidence


@router.get("/{dispute_id}/evidence", response_model=DisputeEvidenceListResponse)
def list_dispute_evidence(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.buyer, UserRole.farmer, UserRole.fpo_manager, UserRole.field_agent, UserRole.admin
    )),
):
    dispute = get_dispute(db, dispute_id)
    _assert_dispute_visible(db, dispute, current_user)
    evidences = get_dispute_evidence(db, dispute_id)
    items = [DisputeEvidenceResponse.model_validate(e) for e in evidences]
    return DisputeEvidenceListResponse(items=items, total=len(items))
