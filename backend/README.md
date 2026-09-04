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
│   │       └── health.py    # Health check endpoint (GET /api/health)
│   ├── db/
│   │   └── session.py       # SQLAlchemy engine & SQLite / PostgreSQL session factory
│   ├── models/
│   │   └── base.py          # Declarative Base & common mixins
│   ├── schemas/
│   │   └── health.py        # Pydantic schemas
│   ├── services/            # Domain services (Phase 2+)
│   └── utils/               # Utility functions
├── tests/
│   └── test_health.py       # Health check tests
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

### 3. Run the development server
```powershell
python -m uvicorn app.main:app --reload
```
The server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 4. Endpoints

- **Health Check**: [GET http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 5. Run tests
```powershell
pytest
```

