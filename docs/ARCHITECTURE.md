# — x AgriPulse E change S stem Architecture y 

Document owner: Engineering / Architecture Status: Draft v1.0 Last updated: August 24, 2026 

## 1. System Overview 

AgriPulse Exchange is a farmer-first decision engine and transaction layer for agricultural commerce, built as a modular, API-first, event-driven system. The architecture is organized around two tightly coupled but independently scalable halves: an intelligence layer that ingests price, demand, quality, logistics, and payment signals to produce explainable sell/store/buyer recommendations, and a transaction layer that turns an accepted recommendation into a verified lot, a matched buyer, a negotiated offer, and a tracked transaction through to payment settlement. 

The system is deliberately not architected as a pricedisplay dashboard with a bolt-on marketplace. Every 

service in the intelligence layer exists to produce a decision (when/where/to whom to sell), and every service in the transaction layer exists to execute that decision reliably. The two layers share a common data model (Farmer, FPO, Lot, Buyer, Offer, Transaction) so that a recommendation is always traceable to a concrete, actionable next step, and every completed transaction feeds back into the intelligence layer to improve future recommendations (buyer trust scores, price forecasts, demand patterns). 

## 2. Design Principles 

- Trust-first: every recommendation, score, and buyer profile is backed by traceable data and shown with a plain-language "why." Trust signals (Buyer Confidence Score, verified KYC, transaction history) are first-class data, not metadata. 

- Mobile-first and offline-tolerant: the 

- farmer/field-agent experience must function on low-end Android devices over intermittent 2G/3G connectivity, with local caching and deferred sync as a core (not optional) capability. 

#### Explainable recommendations: the Sale 

Window Score and Buyer Confidence Score are 

built from inspectable, weighted factors rather than opaque models, so the reasoning can always be surfaced to the user. 

#### Modularity and API-first integration: every 

capability (price intelligence, grading, matching, payments, disputes) is a distinct service behind a stable API, so external data sources (Agmarknet/e-NAM, buyer ERPs, logistics partners) and future channels (SMS/IVR, WhatsApp) can be integrated without touching core logic. 

#### Low-friction workflows for farmers and FPOs: 

every core farmer journey (check price, get recommendation, create a lot, accept an offer) is designed for minimal steps, voice-assisted input, and regional-language UI, with FPO aggregation treated as a first-class workflow rather than a farmer-flow variant. 

## 3. High-Level Architecture 

The system is organized into six layers. Data flows upward from ingestion through intelligence into farmer/buyer-facing decisions, and downward from accepted decisions into transaction execution and settlement. 

┌─────────────────────────────────── ───────────────────────────────┐ │ `FRONTEND LAYER` │ 

│ `Farmer App (Android, offline-tolerant) · Field Agent App` │ 

│ `FPO Web Dashboard · Buyer Portal (web) · Admin/Ops Console` │ 

└───────────────────────────────┬─── ─────────────────────────────────┘ │ `REST/GraphQL over API Gateway` 

┌───────────────────────────────▼─── ─────────────────────────────────┐ │ `API GATEWAY & AUTH` │ │ `Routing · Rate limiting · Auth (JWT/OAuth2) · RBAC enforcement` │ └───────────────────────────────┬─── ─────────────────────────────────┘ │ ┌───────────────────────────────▼─── ─────────────────────────────────┐ │ `BACKEND SERVICES LAYER (domain services, independently deployable)` │ 

│ `Farmer/FPO Service · Lot & Grading Service · Matching/RFQ Service` │ 

- │ `Transaction Service · Payment Tracking Service · Dispute Service` │ 

│ `Notification Service · Identity/Verification Service` │ └───────────────────────────────┬─── 

─────────────────────────────────┘ │ ┌───────────────────────────────▼─── ─────────────────────────────────┐ │ `INTELLIGENCE LAYER` │ │ `Price Intelligence Service · Sale Window Score Engine` │ │ `Buyer Confidence Score Engine · Demand Radar · Forecasting Models` │ └───────────────────────────────┬─── ─────────────────────────────────┘ │ ┌───────────────────────────────▼─── ─────────────────────────────────┐ │ `INTEGRATION LAYER` │ │ `Mandi price feeds (Agmarknet/e-NAM) · Buyer KYC/verification APIs` │ │ `Maps/logistics APIs · SMS/WhatsApp gateway · Payment gateway/UPI` │ └───────────────────────────────┬─── ─────────────────────────────────┘ │ ┌───────────────────────────────▼─── ─────────────────────────────────┐ │ `DATA LAYER` │ │ `Relational store (core entities) · Timeseries store (prices)` │ │ `Object storage (lot photos/evidence) · Cache · Event queue/log` │ └─────────────────────────────────── ───────────────────────────────┘ 

```
           ADMIN / MODERATION TOOLS (cross-
cutting)
   Buyer verification review · Dispute
mediation console
   Price feed monitoring · Manual data
correction · Audit log viewer
```

Mandi price data, buyer demand postings, logistics/storage availability, and payment status all enter through the integration layer, land in the data layer (time-series store for prices, relational store for structured entities), and are consumed by the intelligence layer to produce scores and 

recommendations that the backend services expose to the frontend layer. Admin/moderation tools sit alongside the backend services layer with elevated-privilege access for verification, dispute mediation, and data quality correction. 

## 4. Core Components 

|Component|Responsibility|
|---|---|
|Farmer App/<br>Field Agent<br>App|Mobile-frst(ofine-tolerant)app<br>for price checks,<br>recommendations,lot creation,<br>ofer review,transaction tracking,<br>and grievancefling.Field agent|



|Component|Responsibility<br>mode adds assisted onboarding<br>and grading.|
|---|---|
|FPO<br>Dashboard|Web/mobile dashboard for<br>aggregating member lots into<br>pooled lots, viewing bulk buyer<br>demand,and managing pooled<br>transactions and payment<br>distribution.|
|Buyer Portal|Web portal for<br>buyers/processors to post<br>demand, viewmatched lots,<br>submit ofers,and track<br>procurement transactions.|
|Price<br>Intelligence<br>Service|Ingests,normalizes,and serves<br>current and historical<br>price/arrival data across mandis<br>and buyerswithin a farmer's<br>reachable radius.|
|Sale Window<br>Score Engine|Computes an explainable<br>sell/store recommendation per<br>crop/lot from price trend,<br>demand signal,perishability,and<br>storage cost inputs.|
|Buyer<br>Confdence|Computes a trust score per<br>buyer from KYC status,payment|



|Component|Responsibility|
|---|---|
|Score Engine|history,rejection/dispute rate,<br>and seller ratings;recalculated<br>after everytransaction.|
|Lot Builder<br>and Grading<br>Service|Manages the guided photo+<br>checklistfowthat turns raw<br>produce into a structured,<br>gradeable lot;supports FPO<br>pooling of multiple member lots.|
|Matching and<br>RFQ Service|Matches published lots to active<br>buyer demand records bycrop,<br>grade,quantity,location,and<br>timeline;ranks candidates by ft<br>and Buyer Confdence Score.|
|Transaction<br>and Payment<br>Tracking<br>Service|Manages the ofer→acceptance<br>→locked-terms→transaction<br>lifecycle and tracks status<br>through pickup,delivery,and<br>payment.|
|Dispute<br>Resolution<br>Service|Manages grievance intake,<br>evidence atachment,routing to<br>feld agents/support,and<br>resolution outcomes that feed<br>back into Buyer Confdence<br>Score.|



|Component|Responsibility|
|---|---|
|Notifcation<br>Service|Delivers status updates and<br>alerts(price change,ofer<br>received,payment due,dispute<br>update) via push,SMS,or<br>WhatsApp.|
|Identity /<br>Verifcation<br>Service|Handles farmer onboarding(with<br>feld-agent assistance)and<br>buyer KYC/business registration<br>verifcation before market<br>participation.|



## 5. Data Flow 

### 5.1 End-to-end flow 

1. Ingestion: Mandi price feeds, buyer demand postings, logistics/storage availability, and payment confirmations are ingested continuously (via scheduled pulls or partner APIs) into the integration layer and normalized into the data layer. 

2. Farmer input: Farmer (or field agent) selects a crop and location; the Price Intelligence Service returns current price and trend; the Sale Window 

Score Engine returns a sell/store recommendation with reasoning. 

3. Decision: Farmer decides to sell (create a lot) or store (view storage suggestions). This decision is logged as an event, including any override of the recommendation. 

4. Lot creation: Farmer/field agent builds a lot (photos, checklist, quantity); FPO manager may pool multiple member lots. The Lot & Grading Service assigns a provisional grade and publishes the lot as available. 

5. Matching: The Matching/RFQ Service matches the published lot against active buyer demand, ranks eligible buyers by fit and Buyer Confidence Score, and surfaces the shortlist to the farmer/FPO. 

6. Offer and negotiation: A buyer submits a 

   - structured offer via the Buyer Portal; the Transaction Service presents it to the farmer alongside the current market benchmark price; farmer accepts, counters, or rejects. 

7. Acceptance and locking: On mutual 

acceptance, the Transaction Service locks terms (price, quantity, grade, payment terms) and creates a transaction record; this triggers a logistics suggestion (transport partner/cost estimate). 

8. Dispatch and delivery: Transport is arranged; transaction status is advanced through pickup and delivery, with quality confirmation captured at delivery (matched against the agreed grade). 

9. Payment settlement: Payment status is tracked (initiated → received) via buyer self-report or, in later phases, a verified payment gateway/UPI integration; mismatches are flagged. 

10. Feedback loop: Completed transaction 

outcomes (on-time payment, rejection/quality mismatch, dispute filed) feed back into the Buyer Confidence Score Engine and into the price/demand history used for future Sale Window Score calculations. 

### 5.2 Asynchronous and event-driven processing 

Key domain events ( `lot.created` , 

`offer.submitted` , `offer.accepted` , `transaction.status.updated` , 

`payment.status.updated` , `dispute.raised` , 

`dispute.resolved` ) are published to an event 

queue/log. Downstream consumers (Notification Service, Buyer Confidence Score Engine, analytics pipeline) subscribe independently, so a transaction status update can simultaneously trigger a push notification, a trust-score recalculation, and an analytics record without coupling those services to 

the Transaction Service directly. This also supports offline-first mobile clients: farmer app actions taken offline are queued locally and replayed as events once connectivity resumes. 

## 6. Suggested Tech Stack 

### Hackathon / SIH prototype stack 

|Layer|Recommendation|
|---|---|
|Mobile frontend|React Native(or Fluter)for<br>a single cross-platform<br>farmer/feld-agent app;<br>ofine storagevia<br>SQLite/WatermelonDB|
|Web frontend<br>(FPO/Buyer/Admin)|React+Vite,Tailwind CSS|
|Backend|Node.js(Express/NestJS)<br>or Python(FastAPI) —<br>monolithwith clearly<br>separated modules<br>mirroring the service<br>boundaries in Section4|
|Database|PostgreSQL(core entities)<br>+a simple time-series table|



|Layer|Recommendation|
|---|---|
||(or TimescaleDB extension)<br>for price history|
|Cache|Redis(session,price cache,<br>rate limiting)|
|Queue/events|Redis Streams or a<br>lightweight message broker<br>(e.g.,RabbitMQ)for domain<br>events|
|File/object storage|Local disk or a free-tier<br>object store(e.g.,S3-<br>compatible/MinIO)for lot<br>photos|
|Analytics|Simple event logging to<br>Postgres or a lightweight<br>tool(e.g.,Metabase for<br>dashboards)|
|Deployment|Docker Compose on a<br>single cloud VM or free-tier<br>PaaS(Render/Railway)|
|Auth|JWT-based authwith role<br>claims(farmer,FPO<br>manager,buyer, feld agent,<br>admin)|



### Production-ready alternatives 

|Layer|Production recommendation|
|---|---|
|Mobile frontend|Native Android(Kotlin)for<br>performance-critical ofine<br>sync,or React Nativewith a<br>hardened ofine-sync SDK|
|Backend|Microservices per domain<br>(Section4),<br>Node.js/Go/Python per<br>service,behind an API<br>Gateway (Kong/AWS API<br>Gateway)|
|Database|PostgreSQL(core,multi-AZ) +<br>TimescaleDB or InfuxDB(price<br>time-series) +a document<br>store(MongoDB)forfexible<br>grading/checklist schemas if<br>needed|
|Cache|Redis Cluster|
|Queue/events|Kafka or AWS SQS/SNS for<br>durable,replayable event<br>streaming|



|Layer|Production recommendation|
|---|---|
|File/object<br>storage|AWS S3 /GCP Cloud Storage<br>with CDN for lot photos and<br>evidence|
|Search/matching|Elasticsearch or a dedicated<br>matching servicewith geo-<br>indexing(PostGIS)for<br>location-radius queries|
|Analytics|A dedicatedwarehouse<br>(BigQuery/Redshift) +BI tool<br>(Looker/Metabase)fedvia a<br>CDC or event pipeline|
|Deployment|Kubernetes(EKS/GKE) with<br>per-service CI/CD,or a<br>managed container platform<br>for smaller scale|
|Observability|Prometheus+Grafana<br>(metrics),ELK/Loki(logs),<br>Sentry (error tracking)|
|Auth|OAuth2/OIDCvia a managed<br>identityprovider<br>(Auth0/Keycloak), with RBAC<br>enforced at the API gateway|



## 7. APIs and Integrations 

### 7.1 Major internal APIs 

- 

- `GET /prices/{crop}?lat=&lng=&radius=` 

- current price and trend across nearby markets 

- `GET /recommendations/sale-window?` 

- `crop=&lotId=` — Sale Window Score and reasoning 

- `POST /lots` / `GET /lots/{id}` / `POST` 

- `/lots/{id}/pool` — lot creation, retrieval, and FPO pooling 

- `GET /buyers/{id}/confidence-score` — Buyer 

- Confidence Score and contributing factors 

- `POST /demand` / `GET /matches?lotId=` — buyer 

- demand posting and lot-to-buyer matching 

- `POST /offers` / `POST` 

- `/offers/{id}/accept|counter|reject` — offer lifecycle 

- `POST /transactions/{id}/status` — advance 

- transaction status (pickup, delivery, payment) 

- 

- `POST /disputes` / `GET /disputes/{id}` 

- grievance intake and tracking 

- `POST /verification/kyc` — buyer/farmer 

- verification submission 

### 7.2 External integrations 

- Mandi price data: Agmarknet, e-NAM, and state agri-marketing board feeds, treated purely as input data sources; product value comes from synthesis (trend detection, cross-market comparison, scoring), not from re-displaying this data. 

- Buyer KYC/verification: government business registration/ID verification APIs, or manual fieldagent-assisted verification where APIs are unavailable. 

- Maps/logistics: mapping APIs (e.g., Google Maps/OpenStreetMap) for distance/route estimates; transport partner APIs or a manually maintained partner directory for MVP. 

- SMS/WhatsApp: gateway providers (e.g., Twilio, Gupshup, or WhatsApp Business API) for notifications and, in future phases, an IVR/SMS access channel for feature-phone users. 

- Payment gateway: UPI-based payment confirmation integration (phase 2+); MVP tracks payment status via self-report only, with no fund custody. 

## 8. Data Model 

Key entities and their core relationships: 

- Farmer — id, name, location, language preference, linked FPO (optional), verification status 

- FPO — id, name, registration details, member 

- farmers, collection center location(s) 

- Commodity — id, crop name, variety, perishability profile, standard grading parameters 

- Lot — id, commodity, farmer/FPO owner, quantity, harvest date, location, photos, status (draft, published, matched, sold), pooled-from (child lot references, for FPO aggregation) 

- QualityGrade — id, lot reference, grading parameters (moisture, size, damage %, foreign matter), assigned grade, assigned by (system/field agent), evidence photos 

- Buyer — id, business name, type (trader, processor, institutional), verification status, Buyer Confidence Score, location(s) 

- Offer — id, lot reference, buyer reference, price, quantity, pickup window, payment terms, status (submitted, countered, accepted, rejected, expired) 

- Transaction — id, offer reference (accepted), locked terms, status timeline (confirmed, picked up, delivered, payment initiated, payment received), linked shipment and payment records 

- Shipment — id, transaction reference, transport partner, route, cost estimate, actual 

- pickup/delivery timestamps 

- Payment — id, transaction reference, amount, method, status, expected date, actual date 

- Dispute — id, transaction reference, category (rejection, short weight, quality disagreement, payment delay), evidence references, status, resolution outcome, resolved by 

- MarketPrice — id, commodity, market/mandi/buyer reference, date, min/max/modal price, arrival volume (timeseries) 

- StorageOption — id, location, capacity, commodity suitability (e.g., cold storage), cost estimate, availability status 

## 9. AI and Decision Logic 

- Trend analysis and price forecasting: timeseries analysis (starting with moving averages/seasonal decomposition for MVP, evolving to ML forecasting models) over 

- `MarketPrice` history to project short-term (3–14 

- day) directional price movement per crop/market, output with a confidence band rather than a false-precision point estimate. 

#### Sale timing (Sale Window Score): a weighted, 

inspectable scoring function combining price trend direction/confidence, current demand strength (from Demand Radar), crop perishability, and storage cost/access — engineered so every score can be decomposed into its top 

contributing factors for the plain-language "why" shown to farmers. 

#### Buyer ranking (Buyer Confidence Score): 

composite, recency-weighted score from verified KYC status, on-time payment rate, 

rejection/dispute rate, and seller ratings; recalculated as an event-driven side effect of every completed transaction or resolved dispute. 

- Lot matching: a rules-plus-ranking engine matching lots to buyer demand on crop, grade, quantity, location radius, and timeline, with geoindexed queries (PostGIS or equivalent) for radius search, and Buyer Confidence Score as a ranking tiebreaker. 

- FPO aggregation assist: a suggestion algorithm that identifies which member lots can be pooled (compatible grade, complementary quantity) to meet a buyer's minimum-volume requirement. 

- Route optimization: for logistics suggestions, a straightforward distance/cost estimate at MVP (single best transport option), extensible to multi- 

stop route optimization for FPO bulk pickups in later phases. 

Explainability requirement: all scoring functions are built as weighted, inspectable factor combinations (not opaque end-to-end models) so that the top 2–3 contributing reasons can always be surfaced in the UI. Any future move to a less transparent ML model (e.g., gradient boosting) must ship with a featureattribution layer (e.g., SHAP) to preserve this requirement. 

## 10. Security and Trust 

- Role-based access control (RBAC): enforced at the API gateway and service layer for five core roles — farmer, FPO manager, buyer, field agent, admin — with each role scoped to only the data and actions it needs (e.g., a buyer cannot see a farmer's phone number until a transaction is confirmed). 

- Data privacy: farmer personal and financial data encrypted at rest and in transit (TLS in transit, AES-256 at rest); contact/payment details visible to counterparties only within the context of an active transaction. 

- Audit logs: every offer, acceptance, status change, and dispute action is written to an 

append-only audit log, keyed by transaction ID, for dispute resolution and regulatory needs. 

- Verified buyer profiles: buyers must complete KYC/business registration verification before posting demand or submitting offers; verification status is visibly displayed alongside the Buyer Confidence Score. 

- Tamper-evident transaction history: locked transaction terms (price, quantity, grade, payment terms) are immutable once both parties accept; any subsequent change requires a new, - 

- logged amendment record rather than an in place edit, preserving a clean audit trail for disputes. 

## 11. Scalability and Resilience 

- Offline mode and delayed sync: the 

- farmer/field-agent app caches recent price and recommendation data locally and queues actions (lot creation, offer response) taken offline, replaying them as events once connectivity resumes; conflict resolution favors server-side state with clear user-facing sync status. 

- Peak harvest traffic: price ingestion and matching services are stateless and horizontally scalable behind the API gateway; read-heavy 

- price/recommendation endpoints are cache backed (Redis) to absorb traffic spikes during harvest season without hitting the primary database on every request. 

- Caching of market data: current price and trend data is cached with a short TTL (e.g., 15–30 minutes) and invalidated on new ingestion; historical time-series queries are served from the time-series store directly. 

- Retry logic: payment status checks and notification delivery use exponential-backoff retry with dead-letter queues for failures requiring manual review, ensuring a transient SMS/gateway failure doesn't silently drop a payment confirmation or dispute alert. 

## 12. Deployment Architecture 

MVP deployment: a single Docker Compose stack (backend monolith, PostgreSQL, Redis, object storage) deployed to one cloud VM or a free-tier PaaS, with the mobile app pointing to a single API base URL. Logs are collected to a simple centralized log (e.g., a hosted logging tier) and basic uptime monitoring is configured on the API endpoint. 

#### Evolution path to production: 

1. Split the backend monolith into the domain services listed in Section 4, each independently deployable and containerized. 

2. Introduce a proper API gateway (Kong/AWS API Gateway) for routing, rate limiting, and centralized auth enforcement. 

3. Move to a managed Kubernetes cluster (EKS/GKE) with per-service CI/CD pipelines and rolling deployments. 

4. Introduce full observability (Prometheus/Grafana for metrics, ELK/Loki for logs, Sentry for error tracking) and a proper event streaming backbone (Kafka) in place of the lightweight MVP queue. 

5. Add multi-AZ database deployment and automated backups/disaster recovery for production data durability guarantees. 

## 13. Mermaid Diagram 

##### `flowchart TD` 

```
    subgraph Frontend["Frontend Layer"]
        FA[Farmer App]
        FieldA[Field Agent App]
        FPOD[FPO Dashboard]
        BP[Buyer Portal]
        Admin[Admin Console]
    end
```

```
    subgraph Gateway["API Gateway & Auth"]
        GW[Routing · RBAC · Rate Limiting]
    end
```

```
    subgraph Backend["Backend Services"]
        LotSvc[Lot & Grading Service]
        MatchSvc[Matching / RFQ Service]
        TxnSvc[Transaction Service]
        PaySvc[Payment Tracking Service]
        DisputeSvc[Dispute Resolution
Service]
```

```
        NotifSvc[Notification Service]
        IdSvc[Identity / Verification
Service]
    end
```

```
    subgraph Intelligence["Intelligence
Layer"]
```

```
        PriceSvc[Price Intelligence
Service]
```

```
        SWScore[Sale Window Score Engine]
        BCScore[Buyer Confidence Score
Engine]
        Demand[Demand Radar]
    end
```

```
    subgraph Integration["Integration
Layer"]
```

```
        Mandi[Agmarknet / e-NAM Feeds]
        KYC[KYC / Verification APIs]
        Maps[Maps / Logistics APIs]
        SMS[SMS / WhatsApp Gateway]
        Pay[Payment Gateway / UPI]
    end
```

```
    subgraph Data["Data Layer"]
        RDB[(Relational Store)]
        TS[(Time-Series Store)]
        Obj[(Object Storage)]
        Cache[(Redis Cache)]
        Queue[(Event Queue)]
    end
```

```
    FA & FieldA & FPOD & BP & Admin --> GW
    GW --> LotSvc & MatchSvc & TxnSvc &
PaySvc & DisputeSvc & NotifSvc & IdSvc
```

```
    LotSvc --> RDB
    LotSvc --> Obj
    MatchSvc --> PriceSvc
    MatchSvc --> BCScore
    MatchSvc --> Demand
    TxnSvc --> Queue
    PaySvc --> Pay
    PaySvc --> Queue
    DisputeSvc --> Obj
    DisputeSvc --> Queue
    NotifSvc --> SMS
    IdSvc --> KYC
```

```
    PriceSvc --> TS
    PriceSvc --> Cache
    SWScore --> PriceSvc
    SWScore --> Demand
    BCScore --> RDB
    Demand --> RDB
```

```
    Mandi --> PriceSvc
```

```
    Maps --> MatchSvc
    Queue --> NotifSvc
    Queue --> BCScore
```

##### `classDef layer` 

```
fill:#f8f8f8,stroke:#999,stroke-width:1px;
    class
```

```
Frontend,Gateway,Backend,Intelligence,Integ
ration,Data layer
```

## 14. MVP Scope 

#### In scope for hackathon/SIH demo: 

- Single-crop, single-geography price ingestion (seeded/downloaded dataset standing in for live Agmarknet/e-NAM feeds). 

- Backend as a modular monolith (not full microservices) implementing the service boundaries in Section 4 as internal modules. 

- Sale Window Score computed via a transparent rule/statistical baseline (no trained ML model required). 

- Lot Builder with photo + checklist grading (rulebased provisional grade, no computer vision). Seeded buyer demand records (5–10 buyers) with Buyer Confidence Score computed from seeded transaction history. 

- Full offer → accept → transaction-status-timeline flow, manually advanced for demo purposes. 

- Basic grievance flow with evidence autoattachment, routed to a mock field-agent console. 

- FPO lot-pooling demo (2–3 sample farmer lots combined). 

- Regional-language UI for core farmer screens; Docker Compose deployment on a single VM. 

#### Explicitly deferred beyond MVP: 

- Live government price API integration (Section 7.2) — use seeded/static datasets. 

- Real payment gateway/UPI integration — track status only, no fund custody. 

- Microservice decomposition, Kubernetes deployment, and full observability stack (Section 12 evolution path). 

- Trained ML forecasting/scoring models and computer-vision-based grading. 

- SMS/IVR access channel. 

## 15. Risks and Tradeoffs 

- Data freshness: external mandi price feeds may 

- be delayed, incomplete, or inconsistent across 

states/sources; the Price Intelligence Service must clearly surface data recency (e.g., "as of yesterday") rather than implying real-time accuracy it doesn't have. 

- Buyer verification quality: KYC/verification depends on external APIs or manual field-agent checks that may be slow or inconsistent at scale, creating a tradeoff between onboarding friction and trust reliability — MVP leans toward fieldagent-assisted verification to unblock pilot buyers quickly, with a clear upgrade path to automated checks. 

- Connectivity constraints: offline-first design adds real engineering complexity (local caching, conflict resolution, event replay); MVP simplifies this to a basic cache-and-queue model, deferring robust conflict resolution to a later phase. 

- Adoption challenges: the modular architecture supports many future channels (SMS/IVR, WhatsApp), but the MVP's app-only channel may under-serve the least digitally literate farmers — this is a conscious MVP tradeoff, not an architectural limitation, since the integration layer is designed to add these channels without core rework. 

- Model accuracy and explainability: the rulebased scoring approach favored for MVP trades 

some predictive accuracy for transparency; moving to ML-based forecasting/scoring in later phases requires an explicit feature-attribution layer to preserve the explainability principle in Section 2, and this should be treated as a hard requirement, not an optional enhancement. 

