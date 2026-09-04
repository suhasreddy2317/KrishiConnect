# Product Requirements Document: AgriPulse 

# Ex change 

Document owner: Product Management Status: Draft v1.0 Last updated: August 24, 2026 

## 1. Problem Statement 

Smallholder farmers and Farmer Producer Organizations (FPOs) make one of their higheststakes financial decisions — when, where, and to whom to sell their harvest — with almost no reliable information. 

Today, a farmer typically knows only the price at the single nearest mandi, often relayed by word of mouth or a local trader with a conflict of interest. They rarely know: 

What prices look like at other mandis, processors, or institutional buyers within reach 

- Whether prices are likely to rise or fall in the coming days or weeks 

- Which buyers are actively demanding their crop and grade, and at what volume 

- Which buyers pay reliably and on time versus which have a history of delays, rejections, or disputes 

- What quality/grading standards a buyer requires, and whether their lot meets them 

- What it will cost, in money and time, to transport and store the produce as an alternative to an immediate sale 

The result is a structurally weak negotiating position: farmers sell immediately after harvest under financial pressure (loan repayment, storage cost, spoilage risk), accept the first offer from a nearby trader, and absorb the transaction costs of rejection, 

underpayment, or delayed payment. Existing digital mandi-price apps only solve the "what is the price today at the mandi" problem — they do not help a farmer decide, do not connect them to a vetted set of buyers, and do not carry the transaction through to a completed, paid sale. 

Core gap: there is no system that combines market intelligence, a sell/store decision, verified buyer matching, and transaction support (logistics, 

payment tracking, dispute resolution) into one trusted flow. 

## 2. Product Vision and Goals 

### Vision 

AgriPulse Exchange is a farmer-first decision engine and transaction layer for agricultural commerce. It tells a farmer or FPO when to sell, where to sell, and to whom to sell — with evidence, not guesswork — and then carries that decision through to a completed, paid, dispute-free transaction. 

AgriPulse Exchange is not a price ticker and not a generic marketplace. It is a decision-support system that happens to also close the loop on the transaction, because a recommendation without an execution path is not useful to a farmer under harvest pressure. 

### Goals 

1. Improve price realization — help farmers 

capture prices closer to the best available option in their reachable market, not just the nearest one. 

#### 2. Reduce distress selling — give farmers 

evidence-based store-vs-sell guidance so timing decisions are informed, not forced. 

#### 3. Increase transaction reliability — reduce 

rejected lots, payment delays, and disputes through quality grading, buyer trust scoring, and structured logistics. 

#### 4. Build trust as the core product asset — every 

- recommendation must be explainable, and every buyer/counterparty must be scored on verifiable behavior. 

#### 5. Be usable by low digital-literacy users — 

voice, vernacular language, and low-bandwidth design are first-class requirements, not later additions. 

### Non-goals (v1) 

- AgriPulse is not a lender or an escrow bank; it tracks and surfaces payment status but does not initially hold funds. 

- AgriPulse does not attempt to cover every crop nationally at launch — it starts with a small set of high-volume commodities in a defined pilot geography. 

## 3. Primary Users and Personas 

### 3.1 Smallholder Farmer — "Ramesh" 

- Owns/farms 1–3 acres, grows 1–2 cash crops per season (e.g., tomato, soybean, wheat). 

- Has a basic smartphone, moderate literacy, comfortable with voice notes and simple regional-language UI more than dense text or English. 

- Primary need: "Should I sell now or wait? Who will pay me a fair price on time?" 

- Pain point: no visibility beyond the nearest mandi; no leverage to negotiate; often sells to the first trader who shows up. 

### 3.2 FPO Manager — "Sunita" 

- Aggregates produce from 50–500 member farmers, manages pooled sales, sometimes owns/rents a collection center or basic storage. 

- Digitally more literate than individual farmers; operates from a phone or shared computer. 

- Primary need: aggregate member lots into sellable volumes, secure better bulk pricing, track which buyer is reliable, manage payment distribution back to members. 

- Pain point: manual aggregation, no systematic way to grade/pool lots, no visibility into institutional buyer demand. 

### — " 3.3 Buyer / Processor Anand Agro 

### Foods" 

- Mandi trader, FPO-level bulk buyer, food processor, or institutional procurement team (e.g., retail chain, exporter). 

- Primary need: source a defined quality and 

- volume reliably, at predictable cost, with minimal manual sourcing effort. 

- Pain point: fragmented sourcing, inconsistent quality from unknown sellers, no shared trust signal about farmer/FPO reliability. 

### 3.4 Field Agent — "Deepak" 

- AgriPulse's (or a partner NGO/FPO federation's) on-ground representative who supports digital onboarding, quality grading assistance, and dispute mediation in villages with low 

- connectivity or literacy. 

- Primary need: a lightweight mobile tool to onboard farmers, capture lot photos/grading, and flag/escalate disputes. 

- Pain point: no structured tool today; relies on 

- phone calls and paper records. 

## 4. Key User Journeys 

### 4.1 Check Market Intelligence 

Farmer opens the app (or asks via voice) → sees current price at nearby mandis/buyers for their crop, a short price trend (up/down/flat, plain language), and a Sale Window Score for their crop today. Works in regional language, with a voice-read-aloud option. 

### 4.2 Decide Sell vs Store 

Farmer inputs (or the app already knows) crop, quantity, harvest date, and available storage option → engine returns a clear recommendation ("Sell within 5 days" / "Hold up to 2 weeks — prices trending up") with the reasoning shown in plain terms (price trend, storage cost estimate, spoilage risk for that crop). 

### 4.3 Create a Graded Lot 

Farmer or field agent photographs the produce, answers a short guided quality checklist (moisture, size, damage, foreign matter) → system assigns a provisional grade, farmer confirms quantity → lot is published as a listing with grade, quantity, location, and earliest availability. 

### 4.4 Match with Verified Buyers 

System matches the lot against active buyer demand (by crop, grade, quantity, location radius) → 

farmer/FPO sees a ranked shortlist of buyers with a Buyer Confidence Score, historical payment speed, and typical offer range — not just a single anonymous bid. 

### 4.5 Negotiate and Accept an Offer 

Buyer sends an offer (price, quantity, pickup terms) → farmer sees it alongside the market benchmark price so they know if it's fair → farmer can counteroffer, accept, or decline → accepted offer becomes a confirmed transaction with terms locked (price, quantity, grade, payment terms, pickup window). 

### 4.6 Arrange Logistics 

On confirmed transaction, system suggests transport options (partner vehicles, distance/cost estimate) and, if selling is delayed, nearby storage options (warehouse, cold storage) with capacity and indicative cost — so "store" is a real, actionable choice, not just advice. 

### 4.7 Track Payment and Resolve Disputes 

Farmer/FPO tracks transaction status (harvested → picked up → delivered → payment initiated → payment received) on a simple timeline → if payment is late or the lot is rejected/short-paid at delivery, farmer raises a grievance in one tap → field agent or support team mediates, with all lot/offer/quality 

evidence attached, and the outcome updates the buyer's trust score. 

## 5. Core Modules 

### 5.1 Price Intelligence Engine 

Aggregates and normalizes prices and arrival volumes across mandis, processor procurement rates, and any digital trading channel data available, for the farmer's crop and reachable radius. Surfaces current price, a short historical trend, and nearbymarket comparison — in plain language, not just raw tables. 

### 5.2 Demand Radar 

Surfaces active buyer demand: which buyers are currently seeking which crop, grade, and volume, within what radius, and by when. Distinguishes "someone might buy" from "someone is actively sourcing right now." 

### 5.3 Sale Window Score 

A single, explainable 0–100 (or Low/Medium/High "sell now" confidence) score per crop/lot combining price trend, seasonal price pattern, current demand signal, and perishability, translated into a plain- 

language recommendation with the top 2–3 reasons behind it. This is the centerpiece "decision" output of the product. 

### 5.4 Buyer Confidence Score 

A trust score per buyer built from verified KYC/registration status, on-time payment history, rejection/dispute rate, and rating from past sellers. Shown wherever a buyer appears, so trust is visible before a farmer commits, not discovered afterward. 

### 5.5 Lot Builder and Quality Grading 

Guided, photo- and checklist-based flow to turn raw produce into a structured, gradeable, listable "lot" (crop, variety, quantity, grade, harvest date, location, photos). Supports FPO-level aggregation of multiple farmers' produce into one pooled lot. 

### 5.6 Logistics and Storage Suggestions 

Given a lot's location and a transaction (or a "hold" decision), suggests nearby transport partners/cost estimates and storage/warehousing options with capacity, cost, and suitability for the crop (e.g., cold storage for perishables). 

### 5.7 Payment Tracking 

A simple, timeline-based tracker for each transaction from confirmation through pickup, delivery, and payment, with status updates and expected-vsactual payment date, visible to both farmer/FPO and buyer. 

### 5.8 Grievance / Dispute Workflow 

Structured flow to raise a dispute (rejected lot, short weight, delayed/partial payment, quality disagreement) with evidence auto-attached (lot photos, agreed grade, offer terms), routed to a field agent or support team for mediation, with an auditable resolution that feeds back into the Buyer Confidence Score. 

## 6. Functional Requirements 

#### Market Intelligence 

- FR1: System shall display current price and recent trend for a selected crop across all mandis/buyers within a configurable radius of the user's location. 

- FR2: System shall support voice input and 

- voice/audio output of price and recommendation information in at least one regional language for v1. 

- FR3: System shall show a plain-language 

- explanation (not just a number) for every Sale Window Score. 

#### Decision Support 

- FR4: System shall generate a Sell/Store recommendation per crop given current price trend, demand signal, and (if available) userentered storage access. 

- FR5: System shall let the user override the recommendation and record the reason (for future model improvement), without blocking the action. 

#### Lot Management 

- FR6: System shall allow a farmer or field agent to create a lot with photos, guided quality checklist answers, quantity, and location. 

- FR7: System shall allow an FPO manager to aggregate multiple member lots of the same crop/grade into a single pooled lot. 

- FR8: System shall assign a provisional grade based on checklist/photo input and allow manual override by a field agent. 

#### Buyer Matching and Negotiation 

- FR9: System shall match a published lot against active buyer demand records and return a ranked 

list of eligible buyers with Buyer Confidence Score. 

- FR10: System shall allow a buyer to submit a structured offer (price, quantity, pickup window, payment terms) against a lot. 

- FR11: System shall allow the farmer/FPO to accept, reject, or counter an offer, and shall display the current market benchmark price alongside every offer. 

- FR12: System shall lock transaction terms (price, quantity, grade, payment terms) upon mutual acceptance and generate a transaction record. 

#### Logistics 

- FR13: System shall suggest available transport options and estimated cost for a confirmed transaction based on pickup and delivery locations. 

- FR14: System shall suggest nearby storage options with indicative cost when a user selects "store" instead of "sell." 

#### Payments and Trust 

- FR15: System shall track transaction status through defined stages (confirmed → picked up → delivered → payment initiated → payment received) and display it to both parties. 

- FR16: System shall allow either party to mark payment as received/not received, and flag mismatches for review. 

- FR17: System shall compute and display a Buyer Confidence Score, updated after each completed transaction. 

#### Grievances 

- FR18: System shall allow a farmer/FPO to raise a dispute against a specific transaction with a reason category (rejection, short weight, quality disagreement, payment delay, other). 

- FR19: System shall auto-attach relevant lot, offer, and transaction evidence to a raised dispute. 

- FR20: System shall notify a field agent/support role of new disputes and track resolution status and outcome. 

#### Identity and Access 

- FR21: System shall verify buyer identity 

- (KYC/business registration) before a buyer account can post demand or make offers. 

- FR22: System shall support farmer onboarding via field agent assistance for users without independent smartphone/digital access. 

## - 7. Non Functional Requirements 

- Usability: Core farmer flows (check price, get recommendation, view offers) must be usable by a low-literacy user in under 3 taps/voice commands from home screen; UI in regional language by default. 

- Performance: Price/recommendation screens shall load in under 3 seconds on a 3G/lowbandwidth connection; app shall degrade gracefully (cached last-known prices) when offline. 

- Reliability: Transaction status and payment tracking data must be durable and auditable; no silent data loss on a confirmed transaction. 

- Trust and Transparency: Every score (Sale Window Score, Buyer Confidence Score) must have a visible, plain-language "why" — no blackbox numbers. 

- Security/Privacy: Farmer personal and financial data shall be encrypted at rest and in transit; access to farmer contact/payment data restricted to authorized counterparties in an active transaction. 

- Scalability: Architecture shall support horizontal scaling of price ingestion and matching services as commodity/geography coverage grows. 

- Accessibility: Support for voice interaction and large-text/low-literacy UI modes; SMS/IVR - 

- fallback path considered for feature phone users in future iterations. 

- Auditability: All offers, acceptances, and grievance resolutions must be logged immutably for dispute resolution and regulatory needs. 

## 8. Data Inputs and Integrations 

|Data domain|Examples|Possible<br>sources|
|---|---|---|
|Mandi prices<br>and arrivals|Daily<br>modal/min/max<br>price,arrival<br>volume bycrop<br>and market|Government<br>mandi price<br>APIs(e.g.,<br>Agmarknet-<br>style feeds),<br>state agri-<br>marketing<br>boards,<br>manualfeld-<br>agent entryas<br>fallback|
|Buyer demand|Active<br>procurement<br>requirements by<br>crop,grade,|Buyer self-<br>reported<br>postings,<br>processor/FPO|



|Data domain|Examples|Possible<br>sources|
|---|---|---|
||volume,location,<br>timeline|federation<br>procurement<br>plans,<br>institutional<br>buyer APIs|
|Quality<br>parameters|Moisture,<br>size/grade,<br>foreign mater,<br>damage%,<br>variety|Guided app<br>checklist+<br>photo capture,<br>optional<br>partner<br>lab/testing<br>integration|
|Transport and<br>storage<br>availability|Vehicle<br>availabilityand<br>rates,<br>warehouse/cold-<br>storage capacity<br>and cost|Local transport<br>partner<br>network,<br>warehousing<br>partners,<br>government<br>cold-storage<br>directories|
|Payment status|Payment<br>initiated/received<br>timestamps,<br>amount,method|Buyer self-<br>report,<br>UPI/bank<br>confrmation<br>integration<br>(future), feld|



|Data domain|Examples|Possible<br>sources|
|---|---|---|
|||agent<br>verifcation|
||Buyer business<br>registration,|Government ID<br>verifcation<br>APIs,FPO|
|Verifcation/KYC|farmer ID|federation|
|data|(Aadhaar-linked<br>or equivalent),<br>FPO registration|records,<br>manualfeld-<br>agent<br>verifcation|



Integration approach for MVP: prioritize free/public mandi price feeds and manual/CSV ingestion where APIs are unavailable, with a clear fallback of fieldagent-entered data to avoid blocking the demo/pilot on integration availability. 

## 9. AI/Algorithm Features 

### 9.1 Price Trend Forecasting 

Time-series model (starting simple: moving averages/seasonal decomposition; evolving to ML forecasting) over historical mandi price and arrival data to project short-term (3–14 day) price direction 

per crop/market. Output is directional and confidence-banded (e.g., "likely to rise 5–8% over next week"), not a false-precision point forecast. 

### 9.2 Sale Recommendation (Sale Window Score) 

Rule-based-plus-model scoring function combining: price trend output, current demand signal strength, crop perishability/spoilage curve, and (if provided) user's storage access and cost. Designed to be explainable by construction (weighted, inspectable factors) rather than a pure opaque model, so every score ships with its top contributing reasons. 

### 9.3 Buyer Ranking (Buyer Confidence 

### Score) 

Composite score from: verified KYC status, historical on-time payment rate, historical rejection/dispute rate, seller ratings, and transaction volume/consistency. Recency-weighted so recent behavior matters more than old history; recalculated after every completed transaction. 

### 9.4 Lot Matching and Aggregation 

Matching engine that pairs published lots to active buyer demand records on crop, grade, quantity, location radius, and timeline, ranked by fit and Buyer 

Confidence Score. Includes an aggregation assist for FPOs: suggests which member lots can be pooled to meet a buyer's minimum volume requirement at a compatible grade. 

## 10. MVP Scope (Student Hackathon / SIH Prototype) 

Goal of the prototype: demonstrate the full decision-to-transaction loop end-to-end for one crop and one pilot geography, even if underlying data is partly seeded/simulated. 

#### In scope: 

1. One crop (e.g., tomato or soybean) in one district/region with seeded mandi price data (real historical data where available, simulated/interpolated where not). 

2. Farmer app flow: view price + trend for 3–5 nearby mandis, see a Sale Window Score with plain-language reasoning. 

3. Lot Builder: photo + short guided checklist producing a provisional grade (can be rulebased, not a trained CV model, for the prototype). 

4. Seeded buyer demand records (5–10 mock/pilot buyers) with a basic Buyer Confidence Score computed from seeded historical data. 

5. Matching screen: lot matched to ranked buyer shortlist. 

6. Offer flow: buyer sends offer, farmer 

   - accepts/counters/rejects, benchmark price shown alongside. 

7. Transaction status timeline (manually advanced for demo: confirmed → picked up → delivered → paid). 

8. One-tap grievance flow with auto-attached evidence, routed to a mock "field agent" dashboard. 

9. Basic FPO aggregation demo: combine 2–3 sample farmer lots into one pooled lot. 

10. Regional-language UI for at least the core farmer screens; voice read-aloud for the price/recommendation screen is a stretch goal. 

#### Explicitly out of scope for MVP: 

- Real payment/escrow processing (simulate status only). 

- Live integration with government price APIs (use downloaded/seeded datasets). 

- Multi-crop, multi-state coverage. 

- Trained ML forecasting model (use a transparent rule/statistical baseline; note ML upgrade path in roadmap). 

- SMS/IVR feature-phone access. 

## 11. Metrics for Success 

#### Primary (farmer outcome) metrics 

- Price realization improvement: average % uplift in price received vs. the farmer's single-nearestmandi baseline price for the same date. 

- Reduced time to sell: median days from lot creation to confirmed transaction, vs. baseline (typically immediate distress sale or multi-day informal search). 

- Reduced rejection rate: % of lots rejected or downgraded at delivery, vs. baseline trader rejection rates. 

- Payment completion time: median days from delivery to confirmed payment received. 

#### Secondary (platform health) metrics 

- Sale Window Score adoption rate (% of users who view recommendation before listing/deciding). 

- Recommendation override rate and stated reasons (signal for model quality). 

- Buyer Confidence Score correlation with actual dispute rate (model validity check). 

- Dispute rate per completed transaction, and % of disputes resolved within target SLA (e.g., 5 days). 

- Repeat usage rate (farmers/FPOs returning for a second sale cycle). 

- Buyer retention and offer response rate. 

## 12. Risks, Assumptions, and Constraints 

#### Risks 

- Data availability/quality risk: government mandi price feeds may be delayed, incomplete, or inconsistent across states. 

- Cold-start risk: recommendations and buyer scores are weak until sufficient transaction history exists; early users see less value. 

- Trust adoption risk: farmers may not trust an app-driven price/recommendation over a known local trader relationship. 

- Buyer honesty risk: self-reported payment status can be gamed absent a verified payment integration. 

- Connectivity risk: target users are often in lowbandwidth or intermittently offline areas. 

#### Assumptions 

- A meaningful share of target farmers or their FPOs have access to a basic smartphone, 

- directly or through a field agent/shared device. 

- At least a baseline public mandi price dataset is 

- available for the pilot crop/geography. 

- A pilot set of real or partner buyers can be onboarded to seed genuine (not purely simulated) demand for a credible demo/pilot. 

#### Constraints 

- No real-time payment/escrow integration at MVP stage — payment tracking is status-based, not fund-holding. 

- Limited initial crop and geography coverage by design, to prove the model before scaling. 

- Quality grading at MVP is checklist/photo-based, not lab-verified or computer-vision-verified. 

## 13. Future Roadmap 

- Phase 2: Expand crop and geography coverage; introduce verified payment integration (UPI/escrow) to reduce payment-status trust dependency. 

- Phase 3: Computer-vision-assisted quality grading from lot photos to reduce manual checklist reliance and disputes. 

- Phase 4: SMS/IVR access channel for featurephone farmers; deeper voice/vernacular 

coverage. 

- Phase 5: Financing integrations — e.g., 

- warehouse-receipt-backed credit for farmers who choose to store rather than sell, using the storage/lot data already captured. 

- Phase 6: Predictive demand signaling for buyers/processors (helping them plan procurement, not just react to postings), turning Demand Radar into a two-sided intelligence product. 

- Phase 7: API/data layer for government and NGO partners to plug into AgriPulse's price and transaction data for policy and extension planning. 

## 14. Suggested UI Screens 

1. Home / Market Snapshot — crop selector, current price at nearest markets, Sale Window Score badge, voice input icon. 

2. Price Trend Detail — trend chart (simple, large text), nearby-market comparison table, plainlanguage "why" panel. 

3. Sell vs Store Recommendation — 

   - recommendation card with reasoning, storage option suggestions if "store" is chosen. 

4. Lot Builder — step-by-step photo capture + guided quality checklist, quantity entry, provisional grade result. 

#### 5. FPO Aggregation Dashboard (FPO manager 

persona) — list of member lots, pooling tool, combined lot summary. 

6. Buyer Match List — ranked buyer cards showing Buyer Confidence Score, typical price range, distance. 

7. Offer / Negotiation Screen — offer details vs. market benchmark, accept/counter/reject actions. 

8. Transaction Timeline — status stages 

   - (confirmed, picked up, delivered, payment initiated, paid) with dates. 

9. Grievance Flow — reason selector, autoattached evidence summary, submit and track resolution status. 

10. Buyer Dashboard (buyer/processor persona) — post demand, view matched lots, manage offers. 

11. Field Agent Console — farmer onboarding, assisted lot grading, dispute mediation queue. 

12. Profile / Trust Snapshot — for buyers, a publicfacing Buyer Confidence Score and history summary; for farmers/FPOs, a transaction history summary. 

## 15. Open Questions 

1. Which crop(s) and geography should anchor the pilot, and is real historical mandi price data available for it at sufficient granularity? 

2. Should the Sale Window Score be crop-specific with hand-tuned weights initially, or should we invest in a generalized model even at MVP stage? 

3. What is the minimum viable KYC standard for buyers at launch — self-attestation, or a verified registration check? 

4. Who mediates disputes at scale — an internal AgriPulse team, field agents from a partner FPO federation, or a hybrid model? 

5. Should payment tracking remain self-reported indefinitely, or is a verified payment/escrow integration a near-term (not just roadmap) requirement for trust? 

6. What is the right unit of aggregation for FPOs — per-lot pooling only, or also cross-season/crossbuyer relationship management? 

7. Is voice-first interaction a v1 requirement or a fast-follow, given the target user's literacy profile? 

8. What government or NGO partnerships are realistically available to seed genuine (not simulated) buyer demand for the pilot? 

