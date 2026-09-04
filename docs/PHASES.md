# AgriPulse Exchange — Product Phases 

## 1. Product Vision 

AgriPulse Exchange is a farmer-first decision engine and transaction layer for agricultural commodity sales. It exists to answer three questions a farmer or FPO faces every harvest: when to sell, where to sell, and to whom to sell — and then to carry that decision through to a completed, trustworthy transaction. The platform is not a price ticker and not a generic marketplace; it combines decision intelligence (price trends, sale-window scoring, buyer trust signals), transaction execution (offers, logistics, payments, disputes), and rural-first design (low-connectivity support, simple language, verified actors) into a single system that helps farmers realize better prices with less risk. 

## 2. Phase Strategy 

The product will be built in six stages, each shipping a working, demonstrable increment rather than a set of disconnected features. Every phase must add value along three dimensions simultaneously: 

- User value — a farmer or FPO can do something meaningfully better than before (not just view more data). 

- Data maturity — the system's underlying price, buyer, and transaction data gets richer, more current, and more structured. 

- Transaction reliability — the path from "decision" to "money in the farmer's account" gets shorter, safer, and more verifiable. 

Early phases (0–1) prioritize speed and demonstrability for the SIH context. Middle phases (2–3) build the actual differentiators — decision intelligence and trusted transactions. Later phases (4–5) are about scale, resilience, and production-grade trust. No phase should be started until the prior phase's go/no-go criteria (Section 13) are met. 

## 3. Phase 0: Discovery and Design 

Goal: Validate the problem, scope the first commodity/region, and produce a design that a small team can actually build. 

Key tasks: 

Conduct farmer and FPO interviews (5–10 minimum) to confirm pain points around price discovery, buyer trust, and payment delays. 

Select 1–2 pilot commodities and 1–2 pilot mandis/districts based on data 

availability and farmer access. 

Map available data sources: government mandi price APIs (e.g., 

Agmarknet/eNAM), local mandi bulletins, buyer networks. 

Map the end-to-end farmer workflow today: harvest → price check → sale decision → buyer contact → transport → payment. 

Produce low-fidelity UX wireframes for the core screens (lot entry, price view, recommendation, buyer shortlist). 

Validate assumptions with 2–3 prospective buyers and 1–2 FPOs (do they see value, would they participate). 

### Deliverables: 

Interview notes/summary (farmer + buyer + FPO). 

Commodity and geography selection document with rationale. 

Data source inventory (source, format, refresh rate, reliability, access method). Workflow diagram (as-is and target to-be). 

Wireframes for MVP screens. 

Buyer/FPO validation memo confirming willingness to pilot. 

### Definition of done: 

Commodity + region locked and documented. 

At least one usable, accessible price data source confirmed. 

Wireframes reviewed and approved by team. 

- At least 2 buyers and 1 FPO have verbally agreed to participate in a pilot/demo. 

## 4. Phase 1: MVP Prototype 

Goal: Ship a demo-ready product that proves the core loop — farmer sees their lot, gets a simple sell-or-wait signal, and can reach a shortlisted buyer. 

### Key tasks: 

Build farmer/FPO login (simple phone-number or ID-based auth; no heavy KYC yet). 

Build crop/lot entry (commodity, quantity, quality grade, location, expected sale date). 

Integrate live/near-live mandi price feed for the selected commodity(ies). 

Build basic market comparison (compare price across 2–3 nearby mandis). 

Implement a simple rule-based sell-or-wait recommendation (e.g., "current price is above 7-day average — consider selling"). 

- Build a buyer shortlist view (static or lightly curated list of verified buyer contacts). Enable manual RFQ/offer capture (farmer or buyer records an offer manually; no live negotiation yet). 

- Add basic notification flow (SMS or in-app alert for price changes or new offers). Assemble a demo-ready dashboard tying the above into one coherent farmer journey. 

### Deliverables: 

- Working prototype (web or lightweight mobile-web) covering login → lot entry → price view → recommendation → buyer shortlist → offer capture. 

- Seeded dataset of real or realistic mandi prices for the demo commodity. Demo script and walkthrough covering a full farmer journey. 

- Basic notification mechanism (even if simulated/manual for demo). 

### Definition of done: 

- A single user can complete the full journey (login → see recommendation → shortlist buyer → record an offer) without developer intervention. 

- Price data displayed is real or clearly labeled as representative. 

- Demo has been run end-to-end at least twice without breaking. 

## 5. Phase 2: Decision Intelligence 

Goal: Replace simple rules with a genuine decision-support layer that farmers can trust and understand. 

### Key tasks: 

- Design and implement the Sale Window Score (a composite score indicating how favorable the current moment is to sell, based on price trend, seasonality, and volatility). 

- Design and implement the Buyer Confidence Score (based on buyer transaction history, responsiveness, payment reliability, and any available ratings). Build price trend analysis (historical trend lines, moving averages, simple seasonal patterns). 

- Add route/mandi recommendation (which nearby market/buyer combination nets the best realized price after transport cost). 

- Make recommendations explainable — every score or suggestion should show the top 2–3 factors driving it, in plain language. 

Improve lot grading and aggregation (support quality grades, and allow small lots to be pooled via FPOs for better pricing). 

Add storage-based suggestions (e.g., "holding 5 more days historically improves price by X%, but check storage loss risk"). 

### Deliverables: 

Sale Window Score model (v1) with documented methodology. 

Buyer Confidence Score model (v1) with documented methodology. 

Trend visualization on the price screens. 

Explainability panel/component attached to every recommendation. 

Lot aggregation feature for FPO-pooled lots. 

Storage advisory logic. 

### Definition of done: 

Recommendations are score-based (not static rules) and each shows a plainlanguage explanation. 

- Buyer Confidence Score is populated for all buyers in the shortlist, not placeholder values. 

- At least one round of farmer feedback confirms the recommendations are understandable and perceived as useful. 

## 6. Phase 3: Transaction Enablement 

Goal: Move from "decision support" to "decision-to-cash" by enabling real, trackable transactions. 

### Key tasks: 

Build verified buyer profiles (identity verification, transaction history, ratings). Enable digital offers and counteroffers (structured negotiation flow, not just manual notes). 

- Build shipment creation (link a confirmed sale to a logistics record: pickup point, vehicle, expected delivery). 

Add logistics coordination (transporter assignment, status updates, ETA). 

- Build payment status tracking (offer accepted → dispatched → delivered → payment initiated → payment confirmed). 

- Add document storage (weighbridge slips, quality certificates, invoices, receipts). Build a dispute workflow (raise dispute, attach evidence, track resolution status, escalation path). 

### Deliverables: 

Buyer verification and profile system. 

Digital offer/counteroffer flow with status history. 

- Shipment and logistics tracking module. 

- Payment status tracker with clear stage definitions. 

- Document upload/storage tied to each transaction. 

Dispute filing and resolution tracker. 

### Definition of done: 

- A transaction can be tracked end-to-end in-app from offer to payment confirmation with a visible status at every stage. 

- At least one full transaction (real or simulated with real actors) completes through the dispute-free path. 

- Dispute flow has been tested with at least one simulated dispute case. 

## 7. Phase 4: Scale and Automation 

Goal: Extend the platform beyond a single pilot commodity/region into a multi-market system with predictive capability. 

### Key tasks: 

- Add multi-commodity support (generalize lot, grading, and pricing logic beyond the pilot crop). 

Onboard multiple states and additional mandi/market data sources. 

- Build forecasting models (short-term price forecasts to strengthen the Sale Window Score). 

Integrate external APIs (government schemes, warehousing/e-NWR systems, payment gateways, logistics providers). 

- Build advanced FPO dashboards (aggregated view across many farmers/lots, bulk negotiation tools). 

Add role-based analytics (different views for farmers, FPO admins, buyers, and internal ops). 

Scale the notification system (segmented, high-volume, multi-channel — SMS, app, voice/IVR where useful). 

### Deliverables: 

Multi-commodity data model and configuration system. 

Expanded data source integrations with monitoring for feed health. Forecasting model (v1) integrated into the Sale Window Score. FPO admin dashboard. 

Role-based access and analytics views. 

Scaled notification infrastructure. 

### Definition of done: 

At least 3 commodities and 2 states/regions are live with real data feeds. 

- Forecasting model shows measurable improvement in recommendation accuracy over the Phase 2 baseline. 

FPO dashboard is in active use by at least one FPO managing multiple farmers. 

## 8. Phase 5: Production Hardening 

Goal: Make the platform safe, reliable, and compliant enough to be trusted with real money and real farmer data at scale. 

### Key tasks: 

Implement security and access control (proper auth, role-based permissions, secure API access). 

Add audit logs for all transaction-affecting and data-affecting actions. 

- Improve reliability and failover (redundant data sources, graceful degradation when a feed is down). 

- Strengthen offline sync (queue actions taken with poor connectivity, sync reliably when connection returns). 

- Add observability and monitoring (uptime, error tracking, data feed health dashboards, alerting). 

- Address compliance and data governance (data retention policy, consent management, financial transaction compliance). 

### Deliverables: 

Security audit report and remediation log. 

Audit log system covering all critical actions. 

- Documented failover/redundancy plan and tested failure scenarios. 

- Offline-first sync mechanism for core farmer actions (lot entry, viewing cached recommendations). 

- Monitoring dashboards and alerting rules. 

- Data governance and compliance documentation. 

### Definition of done: 

- System passes an internal security review with no critical/high findings unresolved. 

Core farmer actions (lot entry, viewing prices/recommendations) work offline and sync correctly when reconnected. 

Monitoring is in place with alerts for data feed failure and system downtime. A documented data governance policy exists and is followed. 

## 9. Phase Deliverables Summary 

|Phase|KeyFeatures|Target<br>Users|Success Criteria|Dependencies|
|---|---|---|---|---|
|0 –<br>Discovery|Interviews,<br>commodity/region<br>selection,data<br>mapping,<br>wireframes|Internal<br>team|Commodity,region,<br>and data source<br>locked;buyers/FPO<br>commited to pilot|Access to<br>farmers/buyers<br>for interviews|
|1 –MVP|Login,lot entry,<br>priceview,basic<br>recommendation,<br>buyer shortlist,<br>manual ofers|Individual<br>farmers,<br>FPO reps<br>(demo)|Full journey<br>demoable end-to-<br>end|Working mandi<br>price feed|
|2 –<br>Decision<br>Intelligence|Sale Window<br>Score,Buyer<br>Confdence<br>Score,trends,<br>explainability,<br>aggregation|Farmers,<br>FPOs|Farmers understand<br>and trust<br>recommendations|Sufcient<br>historical price<br>data|
|3 –<br>Transaction<br>Enablement|Verifed buyers,<br>ofers,shipments,<br>payment tracking,<br>disputes|Farmers,<br>buyers,<br>FPOs|End-to-end<br>transaction tracked<br>in-app|Buyer<br>participation,<br>logistics<br>partners|
|4 –Scale|Multi-commodity,<br>multi-state,<br>forecasting,FPO<br>dashboards,<br>integrations|Farmers,<br>FPOs,<br>buyers<br>across<br>regions|Multiple<br>commodities/regions<br>livewith real usage|Reliable data<br>partnerships,<br>funding/team<br>capacity|
|5 –<br>Hardening|Security,audit<br>logs,ofine sync,<br>monitoring,<br>compliance|All users,<br>internal<br>ops|Passes security<br>review;reliable under<br>real load|Mature<br>engineering<br>resourcing|



## 10. Timeline Suggestion (Student / Hackathon Team) 

In 2 weeks (SIH-style sprint): 

Phase 0 (compressed): pick one commodity, one mandi/region, map one data source. 

Phase 1 core: login, lot entry, live price view, one static recommendation rule, static buyer shortlist, manual offer capture. 

Basic demo dashboard and a rehearsed demo script. 

In 1 month: 

Complete and polish Phase 1. 

Begin Phase 2: Sale Window Score (v1, rule-based-plus-trend), basic explainability, price trend charts. 

Add lightweight FPO lot aggregation for a single village/cluster. 

In 3 months: 

Complete Phase 2 fully, including Buyer Confidence Score and storage suggestions. 

Deliver a working slice of Phase 3: digital offer/counteroffer flow and basic payment status tracking (even if manually updated at first) for a small number of real or simulated transactions. 

Begin groundwork for Phase 4 (second commodity or second market added as a stretch goal). 

Phases 4 and 5 are realistically post-hackathon, post-funding milestones (6–12+ months) requiring a larger, more permanent team and real data/logistics/payment partnerships. 

## 11. MVP Scope Boundaries (SIH Demo) 

### Must include: 

Farmer/FPO login and lot entry. 

Live or near-live mandi price data for the chosen commodity. 

- A visible, explainable sell/wait style recommendation (even if rule-based). 

- A buyer shortlist with at least a few real or realistic buyer profiles. 

- A way to capture an offer/interest (manual is acceptable). 

- A coherent, working demo dashboard that tells the "decide → connect" story endto-end. 

### Should be deferred: 

Automated payment processing and real money movement. 

Full logistics/shipment tracking with live transporter integration. Multi-commodity and multi-state support. 

- Forecasting models and machine-learning-based scoring (rule-based/statistical is sufficient for MVP). 

Formal dispute resolution workflows. 

### Should be avoided to stay focused: 

- Building a generic open marketplace where any buyer can list/browse freely (dilutes the decision-support narrative and adds trust/moderation burden). 

- Over-engineering authentication/KYC before there is a real transaction to protect. Trying to support every commodity or every mandi at once — depth on one commodity beats shallow breadth. 

- Adding chat/negotiation UI complexity before the underlying recommendation and buyer-matching logic is solid. 

## 12. Metrics by Phase 

|Phase|PrimaryMetrics|
|---|---|
|0 –Discovery|Number of farmer/buyer interviews completed;data source<br>coverage(%of pilot commodityprice historyavailable)|
|1 –MVP|Demo completion rate(journeys completedwithout failure);<br>recommendation shown per session;buyer shortlistviews|
|2 –Decision<br>Intelligence|Recommendation accuracy (backtested against historical price<br>moves);farmer-reported trust/understanding score; %of<br>recommendationswith explanationviewed|
|3 –Transaction<br>Enablement|Buyer conversion rate(ofers→accepted);payment completion<br>time;dispute rate; %of transactions fullytracked in-app|
|4 –Scale|Number of active commodities/regions;user adoption(active<br>farmers/FPOs per month);forecast accuracy vs.Phase2baseline;<br>notifcation delivery/response rate|
|5 –Hardening|System uptime;incident response time; %of core actions<br>supported ofine;audit log coverage;security fndings resolved|



Cross-phase metrics worth tracking from Phase 2 onward: price realization (farmer's actual sale price vs. same-day market average), buyer conversion, payment completion time, dispute rate, and recommendation accuracy. 

## 13. Go/No-Go Checkpoints 

After Phase 0 → Phase 1: 

- Go if: commodity/region locked, at least one reliable data source confirmed, wireframes approved, buyer/FPO interest confirmed. 

- No-go if: no accessible price data source exists for the chosen commodity/region — return to commodity/region selection. 

### After Phase 1 → Phase 2: 

- Go if: full farmer journey demoable end-to-end without manual workarounds; live price data displaying correctly. 

- No-go if: core data feed is too unreliable to build recommendations on — fix data pipeline before adding intelligence. 

### After Phase 2 → Phase 3: 

- Go if: farmers in feedback sessions report the recommendations are understandable and useful; Buyer Confidence Score is populated with real or credible data. 

- No-go if: recommendations are not trusted or understood — invest further in explainability before adding transaction complexity. 

### After Phase 3 → Phase 4: 

- Go if: at least one full transaction has been tracked end-to-end in-app; buyers show willingness to use digital offers; dispute flow tested. 

- No-go if: buyers are not adopting the digital offer flow — investigate trust/usability blockers before scaling to more markets. 

### After Phase 4 → Phase 5: 

- Go if: multiple commodities/regions are live with real usage; forecasting shows measurable improvement; FPO dashboard actively used. 

- No-go if: data quality has degraded with scale — stabilize data pipelines before hardening for production. 

Ongoing (Phase 5): 

Production launch gated on: passing security review, offline sync working for core actions, monitoring and alerting live, and a documented data governance policy in place. 

