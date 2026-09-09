from fastapi import APIRouter

from app.api.endpoints import health
from app.api.endpoints import admin_health
from app.api.endpoints import auth
from app.api.endpoints import farmers
from app.api.endpoints import lots
from app.api.endpoints import recommendations
from app.api.endpoints import market_prices
from app.api.endpoints import commodities
from app.api.endpoints import demands
from app.api.endpoints import buyer_confidence
from app.api.endpoints import demand_radar
from app.api.endpoints import matching
from app.api.endpoints import offers
from app.api.endpoints import transactions
from app.api.endpoints import shipments
from app.api.endpoints import payments
from app.api.endpoints import disputes
from app.api.endpoints import audit
from app.api.endpoints import voice
from app.api.endpoints import users
from app.api.endpoints import markets


api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"],
)

api_router.include_router(
    admin_health.router,
    prefix="/admin",
    tags=["Admin"],
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

api_router.include_router(
    commodities.router,
    prefix="/commodities",
    tags=["Commodities"],
)

api_router.include_router(
    demands.router,
    prefix="/demands",
    tags=["Demands"],
)

api_router.include_router(
    buyer_confidence.router,
    prefix="/buyers",
    tags=["Buyer Confidence"],
)

api_router.include_router(
    demand_radar.router,
    prefix="/demand-radar",
    tags=["Demand Radar"],
)

api_router.include_router(
    matching.router,
    prefix="/matches",
    tags=["Matching"],
)

api_router.include_router(
    offers.router,
    prefix="/offers",
    tags=["Offers"],
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["Transactions"],
)

api_router.include_router(
    shipments.router,
    prefix="/shipments",
    tags=["Shipments"],
)

api_router.include_router(
    payments.router,
    prefix="/payments",
    tags=["Payments"],
)

api_router.include_router(
    disputes.router,
    prefix="/disputes",
    tags=["Disputes"],
)

api_router.include_router(
    audit.router,
    prefix="/audit",
    tags=["Audit"],
)

api_router.include_router(
    voice.router,
    prefix="/voice",
    tags=["Voice Assistant"],
)

api_router.include_router(
    markets.router,
    prefix="/markets",
    tags=["Markets"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)
