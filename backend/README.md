# KrishiConnect — Backend Service

FastAPI-based modular backend service for the KrishiConnect agricultural decision engine and transaction platform.

## Architecture

```
backend/
├── app/
│   ├── main.py              # Application entrypoint & CORS middleware
│   ├── core/
│   │   └── config.py        # Pydantic BaseSettings & environment variables
│   ├── api/
│   │   ├── api_router.py    # Main API router
│   │   └── endpoints/
│   │       ├── health.py    # Health check endpoint (GET /api/health)
│   │       ├── auth.py      # Authentication endpoints (login, /me)
│   │       ├── farmers.py   # Farmer CRUD endpoints (authenticated)
│   │       └── lots.py      # Produce lot endpoints (authenticated)
│   ├── db/
│   │   └── session.py       # SQLAlchemy engine & SQLite / PostgreSQL session factory
│   ├── models/
│   │   ├── enums.py         # Domain enums (UserRole, LotStatus, etc.)
│   │   ├── base.py          # Declarative Base & common mixins
│   │   ├── user.py          # User / account foundation with password_hash
│   │   ├── farmer.py        # Farmer profile
│   │   ├── fpo.py           # FPO entity
│   │   ├── fpo_member.py    # FPO membership
│   │   ├── buyer.py         # Buyer entity
│   │   ├── commodity.py     # Commodity / crop entity
│   │   ├── market.py        # Market / mandi entity
│   │   ├── market_price.py  # Market price time-series
│   │   ├── storage_option.py # Storage option entity
│   │   └── produce_lot.py   # Produce lot entity
│   ├── schemas/
│   │   ├── health.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── farmer.py
│   │   ├── fpo.py
│   │   ├── fpo_member.py
│   │   ├── buyer.py
│   │   ├── commodity.py
│   │   ├── market.py
│   │   ├── market_price.py
│   │   ├── storage_option.py
│   │   └── produce_lot.py
│   ├── services/            # Domain services (Phase 2+)
│   ├── utils/
│   │   ├── auth.py          # Password hashing & JWT utilities
│   │   └── dependencies.py  # Auth & RBAC FastAPI dependencies
│   └── seeds/
│       └── seed.py          # Deterministic development seed data
├── alembic/                 # Alembic migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_health.py       # Health check tests
│   ├── test_auth.py         # Authentication & RBAC tests
│   ├── test_api.py          # Farmer & lot API tests
│   └── test_models.py       # Model & relationship tests
├── requirements.txt
└── README.md
```

## Getting Started (Windows)

### 1. Create and activate a virtual environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure environment (optional)
Create a `.env` file in the `backend/` directory if you need to override defaults:
```env
DATABASE_URL=sqlite:///./krishiconnect.db
PROJECT_NAME=KrishiConnect API
VERSION=0.1.0
API_PREFIX=/api

# JWT - Override these for any non-local use
JWT_SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 4. Run database migrations
```powershell
alembic upgrade head
```

This creates the SQLite database at `backend/krishiconnect.db` and applies all schema migrations.

To create a new migration after model changes:
```powershell
alembic revision --autogenerate -m "description"
```

### 5. Seed development data (optional)
```powershell
python -m app.seeds.seed
```

This loads deterministic fictional demo data into `backend/krishiconnect.db`.

### 6. Run the development server
```powershell
python -m uvicorn app.main:app --reload
```
The server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 7. Run tests
```powershell
pytest
```

## Authentication

### Demo Accounts
The seed script creates the following development accounts. **Password for all accounts:** `demo-password`

| Role | Phone |
|------|-------|
| Farmer | +919876543210 |
| FPO Manager | +919876543211 |
| Buyer | +919876543212 |
| Field Agent | +919876543213 |
| Admin | +919876543214 |

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "+919876543210",
  "password": "demo-password"
}
```

Response:
```json
{
  "access_token": "<JWT>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ramesh Patil",
    "phone": "+919876543210",
    "email": null,
    "role": "farmer"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <JWT>
```

### Protected Endpoints
All farmer and lot endpoints require a valid Bearer token. Include the token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### RBAC
- **Farmer endpoints**: Authenticated farmers, FPO managers, field agents, and admins
- **Lot endpoints**: Any authenticated user
- **Admin endpoints** (future): Admin only

## Database

- **Development**: SQLite at `backend/krishiconnect.db`
- **Production**: Override `DATABASE_URL` with PostgreSQL connection string
- **Migrations**: Managed by Alembic in `backend/alembic/`

## Endpoints

- **Health Check**: [GET http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **Login**: [POST http://127.0.0.1:8000/api/auth/login](http://127.0.0.1:8000/api/auth/login)
- **Current User**: [GET http://127.0.0.1:8000/api/auth/me](http://127.0.0.1:8000/api/auth/me)
- **Farmers**: POST/GET under `/api/farmers/` (authenticated)
- **Lots**: POST/GET under `/api/lots/` (authenticated)
- **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Security Notes

- This is a prototype authentication system for development/demo purposes.
- Passwords are hashed using bcrypt via passlib.
- JWT tokens expire after 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
- The default `JWT_SECRET_KEY` is a development-only value. **Change it for any non-local deployment.**
- Never expose password hashes or JWT secrets in API responses or logs.
