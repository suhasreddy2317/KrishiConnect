# KrishiConnect — Frontend Web Application

The frontend client for KrishiConnect, built with React, Vite, TypeScript, and Tailwind CSS using the "Trust Ledger" design system.

## Architecture

- **Engine-First Experience**: Emphasizes *"What should I do right now, and why?"*
- **Aesthetic**: Dark-mode-first, high trust, data clarity, no gratuitous animations.
- **Color Palette (Trust Ledger)**:
  - Base Background: `#0A0B1C` (Night Soil)
  - Surface: `#14152E` (Loam)
  - Raised Surface: `#1D1F3D` (Topsoil)
  - Primary Structural: `#2C2B73` (Deep Indigo)
  - Accent / Primary CTA: `#C4FF4D` (Cyber Lime)
  - Active CTA: `#AEE83A`
  - Text: `#EEF0FA` (Chalk)
  - Muted: `#A7ABC9` (Mist)
  - Trust / Success: `#2FBF8F` (Verified Teal)
  - Warning: `#F5A623` (Harvest Amber)
  - Error: `#E5484D` (Blight Red)
- **Typography**: IBM Plex Sans (system/labels) & IBM Plex Mono (data figures, timestamps).

## Roles & Routes

- `/` — Platform Overview & Role Directory Hub
- `/farmer` — Farmer Workspace (Sale Window Score, Sell/Store Decision)
- `/fpo` — FPO Manager Hub (Member Lot Pooling, Bulk Demands)
- `/buyer` — Buyer Procurement Portal (Demand Posting, Match Radar)
- `/field-agent` — Field Agent Terminal (Assisted Onboarding, Grading)
- `/admin` — Admin & Audit Console (KYC Verification, Dispute Mediation)

## Getting Started (Windows)

### 1. Install dependencies
```powershell
cd frontend
npm install
```

### 2. Start development server
```powershell
npm run dev
```
The app will be accessible at [http://localhost:5173](http://localhost:5173).

### 3. Build for production
```powershell
npm run build
```
Production output is generated in `dist/`.

