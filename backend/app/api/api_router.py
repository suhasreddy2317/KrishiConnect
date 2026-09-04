from fastapi import APIRouter

from app.api.endpoints import health
from app.api.endpoints import farmers
from app.api.endpoints import lots


api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"],
)

api_router.include_router(
    farmers.router,
    prefix="/farmers",
    tags=["Farmers"],
)

api_router.include_router(
    lots.router,
    prefix="/lots",
    tags=["Produce Lots"],
)