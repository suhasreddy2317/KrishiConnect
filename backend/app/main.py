from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_router import api_router
from app.db.session import SessionLocal
from app.services.transactions import reconcile_missing_payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        reconcile_missing_payments(db)
        db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KrishiConnect: Agricultural Decision-Support and Trading Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for local frontend development (Vite @ port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints under /api prefix
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", summary="Root index")
def root_index():
    return {
        "message": "Welcome to KrishiConnect API",
        "health_endpoint": f"{settings.API_PREFIX}/health",
        "documentation": "/docs"
    }

