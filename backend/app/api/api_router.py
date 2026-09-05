from fastapi import APIRouter

from app.api.endpoints import health
from app.api.endpoints import auth
from app.api.endpoints import farmers
from app.api.endpoints import lots
from app.api.endpoints import recommendations
from app.api.endpoints import market_prices


api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"],
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

api_router.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["Recommendations"],
)

api_router.include_router(
    market_prices.router,
    prefix="/market-prices",
    tags=["Market Prices"],
)