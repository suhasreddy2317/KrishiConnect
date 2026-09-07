from enum import Enum


class UserRole(str, Enum):
    farmer = "farmer"
    fpo_manager = "fpo_manager"
    buyer = "buyer"
    field_agent = "field_agent"
    admin = "admin"


class LotStatus(str, Enum):
    draft = "draft"
    published = "published"
    matched = "matched"
    sold = "sold"
    archived = "archived"


class BuyerStatus(str, Enum):
    unverified = "unverified"
    pending_review = "pending_review"
    verified = "verified"
    escalated = "escalated"
    suspended = "suspended"


class FPOStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    pending_verification = "pending_verification"


class MembershipStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"


class DisputeStatus(str, Enum):
    open = "open"
    under_review = "under_review"
    awaiting_evidence = "awaiting_evidence"
    escalated = "escalated"
    resolved = "resolved"


class TransactionStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    confirmed = "confirmed"
    dispatched = "dispatched"
    in_transit = "in_transit"
    delivered = "delivered"
    payment_pending = "payment_pending"
    completed = "completed"
    disputed = "disputed"


class OfferStatus(str, Enum):
    submitted = "submitted"
    countered = "countered"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"


class DemandStatus(str, Enum):
    active = "active"
    fulfilled = "fulfilled"
    expired = "expired"
    cancelled = "cancelled"


class GradeCompatibility(str, Enum):
    exact = "exact"
    compatible = "compatible"
    incompatible = "incompatible"
