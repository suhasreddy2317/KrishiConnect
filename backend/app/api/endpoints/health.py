from fastapi import APIRouter
from app.core.config import settings
from app.db.session import check_db_connection
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Backend health check")
def health_check() -> HealthResponse:
    """Returns the operational status of the KrishiConnect backend and database connection."""
    db_connected = check_db_connection()
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        database="connected" if db_connected else "unavailable"
    )

