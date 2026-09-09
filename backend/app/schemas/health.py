from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    database: str


class AdminHealthApiStatus(BaseModel):
    status: str = "operational"


class AdminHealthDatabaseStatus(BaseModel):
    status: str


class AdminHealthMarketDataStatus(BaseModel):
    status: str
    latest_timestamp: str | None = None


class AdminHealthUserCounts(BaseModel):
    total: int
    active: int


class AdminHealthTransactionCounts(BaseModel):
    total: int
    pending: int


class AdminHealthPaymentCounts(BaseModel):
    total: int
    pending: int


class AdminHealthShipmentCounts(BaseModel):
    total: int
    pending: int


class AdminHealthDisputeCounts(BaseModel):
    total: int
    open: int


class AdminHealthAuditActivity(BaseModel):
    events_last_24h: int


class AdminHealthResponse(BaseModel):
    status: str
    api: AdminHealthApiStatus
    database: AdminHealthDatabaseStatus
    market_data: AdminHealthMarketDataStatus
    users: AdminHealthUserCounts
    transactions: AdminHealthTransactionCounts
    payments: AdminHealthPaymentCounts
    shipments: AdminHealthShipmentCounts
    disputes: AdminHealthDisputeCounts
    audit: AdminHealthAuditActivity

