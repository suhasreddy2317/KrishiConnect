# KrishiConnect (AgriPulse Exchange)

> **Farmer-first agricultural decision-support and trading platform.**
> The product is **decision-engine first** and **transaction platform second**, directly addressing the fundamental farmer question: *"What should I do right now, and why?"*

---

## 1. Project Overview

KrishiConnect is built to eliminate information asymmetry and distress selling in agricultural commodities. It empowers smallholder farmers and Farmer Producer Organizations (FPOs) with explainable sell/store intelligence, connects them with verified buyers, and manages the transaction lifecycle to secure payment settlement.

### The Five Platform Roles

1. **Farmer (`/farmer`)**: Sell/Wait decision support, Sale Window Score, Demand Radar, Produce Lot creation, and offer negotiation.
2. **FPO Manager (`/fpo`)**: Member lot pooling, bulk demand visibility, aggregated transaction management, and member payout distribution.
3. **Buyer (`/buyer`)**: Procurement demand posting, quality-matched lot discovery, counteroffers, and logistics tracking.
4. **Field Agent (`/field-agent`)**: Assisted farmer onboarding, in-field grading, checklist verification, and grievance routing.
5. **Admin / Moderator (`/admin`)**: Buyer KYC verification, dispute resolution audit, and system oversight.

---

## 2. Phase 1 Scope: Architecture Foundation

This repository currently hosts the **Phase 1: Project Foundation**:
- **Zero-Docker Windows Workflow**: Standard local Python 3.13 and Node.js v24.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, with "Trust Ledger" design tokens (#0A0B1C base, #14152E surface, #2C2B73 primary, #C4FF4D cyber lime accent).
- **Backend**: FastAPI modular architecture, Pydantic v2 schemas, CORS middleware, and API router.
- **Database**: SQLite (`krishiconnect.db`) via SQLAlchemy declarative ORM, designed for seamless PostgreSQL migration in later phases.
- **Role Routing**: Dedicated routes for all 5 roles (`/farmer`, `/fpo`, `/buyer`, `/field-agent`, `/admin`).

---

## 3. Directory Structure

```
KrishiConnect/
├── frontend/               # React + Vite + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/     # Layout and reusable UI elements
│   │   ├── pages/          # 5 role-based placeholder pages & hub
│   │   ├── lib/            # Utilities (cn class merger)
│   │   ├── App.tsx         # Route definitions
│   │   └── main.tsx        # React entrypoint
│   ├── index.html
│   ├── tailwind.config.ts
│   └── package.json
├── backend/                # FastAPI + SQLAlchemy backend
│   ├── app/
│   │   ├── api/            # API routers and endpoints
│   │   ├── core/           # Configuration and settings
│   │   ├── db/             # SQLAlchemy engine & session factory
│   │   ├── models/         # Database models (portable abstraction)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Domain business logic (Phase 2+)
│   │   ├── utils/          # Helper utilities
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # Pytest suite
│   └── requirements.txt
├── docs/                   # Product & Architecture Specifications
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── PHASES.md
│   └── RULES.md
├── .gitignore
└── README.md
```

---

## 4. Quickstart Guide (Windows + VS Code)

### Prerequisites
- Node.js (v18+ recommended, verified on v24) & npm
- Python (v3.10+ recommended, verified on v3.13)

---

### Backend Setup

1. Open a terminal in the `backend` directory:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```powershell
   python -m uvicorn app.main:app --reload
   ```

5. Verify backend health check:
   - In browser or curl: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   - Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Frontend Setup

1. Open a terminal in the `frontend` directory:
   ```powershell
   cd frontend
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

4. Access the application in your browser:
   - [http://localhost:5173/](http://localhost:5173/)

---

### Available Routes

- `/` — Platform Overview & Role Directory Hub
- `/farmer` — Farmer Workspace (Decision Support & Lot Management)
- `/fpo` — FPO Manager Workspace (Lot Aggregation & Bulk Procurement)
- `/buyer` — Buyer Portal (Demand Radar & Verified Procurement)
- `/field-agent` — Field Agent Workspace (Assisted Grading & Onboarding)
- `/admin` — Admin & Audit Console (Verification & Dispute Oversight)
- `/api/health` — Backend Service & Database Health Indicator

