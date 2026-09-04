# AgriPulse Exchange — Product Rules 

Document owner: Product Management Status: Draft v1.0 

### Last updated: August 24, 2026 

This document defines the operating rules that govern behavior, permissions, validations, matching, payment, disputes, and transparency across AgriPulse Exchange. Rules use MUST (mandatory), SHOULD (strong default, exceptions must be justified), and MAY (optional/permitted) per standard usage. 

## 1. Scope 

### What the system does: 

The system MUST provide farmers and FPOs with market intelligence (prices, trends, demand) and an explainable recommendation on when, where, and to whom to sell. 

- The system MUST support the full transaction lifecycle for a sale decision once made: lot creation, buyer matching, offer/negotiation, logistics coordination, and payment tracking. 

The system MUST support grievance/dispute handling for transactions executed on the platform. 

### What the system does not do: 

- The system MUST NOT function as a pure price-display board; every price surface MUST be paired with context (trend, comparison, or recommendation). 

- The system MUST NOT hold or custody farmer/buyer funds in MVP; it tracks payment status, it does not process settlement (see Section 9). 

- The system MUST NOT guarantee a sale; it facilitates matching and negotiation, not forced transactions. 

### Decision support vs. transaction execution: 

- Decision support (price intelligence, Sale Window Score, Demand Radar) MUST always be available to a user independent of whether they proceed to a transaction — a farmer MAY check prices and recommendations without creating a lot. 

- Transaction execution (lot, offer, shipment, payment) MUST always be traceable back to the decision-support data that informed it, so every transaction record 

references the price benchmark and recommendation state at the time of listing. 

## 2. Roles and Permissions 

|Role|View|Create|Edit|Approve|
|---|---|---|---|---|
|Farmer|Own lots,<br>prices/recommendations,<br>matched buyers,own<br>transactions|Lots,ofer<br>responses,<br>disputes|Own draft<br>lots(pre-<br>publish),<br>own profle|Accept/re<br>ofers on o|
|FPO Manager|Member lots,pooled lots,<br>FPO-level transactions,<br>member payment status|Pooled lots<br>(from<br>member<br>lots),FPO-<br>level ofers<br>responses|Pooled lot<br>composition<br>(pre-<br>publish),<br>FPO profle|Accept/re<br>ofers on p|
|Buyer|Own demand postings,<br>matched lots,own<br>ofers/transactions,own<br>trust score|Demand<br>postings,<br>ofers|Own draft<br>ofers(pre-<br>submission),<br>own profle|N/A(buye<br>theydo no<br>farmer-sid|
|Field Agent|Assigned farmers'/FPOs'<br>profles and lots,dispute<br>queue|Farmer<br>profles<br>(onboarding),<br>assisted lots,<br>grading<br>overrides|Farmer<br>profle(with<br>consent),lot<br>grade(with<br>justifcation)|N/A|
|Admin/Moderator|All platform data|Buyer<br>verifcation<br>records,data<br>corrections|Anyrecord,<br>with a<br>mandatory<br>audit reason|Buyerveri<br>dispute re<br>data quali|



- A role MUST NOT view another user's contact or payment details outside the context of a confirmed transaction between them (see Section 15). 

- Field agents MUST record a reason when editing farmer-submitted data; farmers SHOULD be notified of any edit made on their behalf. 

- Admin edits to historical (locked) transaction records MUST be append-only amendments, never in-place overwrites (see Section 15). 

## 3. Market Data Rules 

Price data MUST be labeled with its source and as-of date/time; the UI MUST NOT imply real-time accuracy for data that is not real-time. 

- Freshness MUST be shown in plain language (e.g., "updated today," "updated 2 days ago"); prices older than a configurable threshold (default: 3 days) MUST be visually flagged as stale. 

- Missing price data for a crop/market MUST be shown explicitly as "not available" — the system MUST NOT interpolate or estimate a price and present it as an actual reported price without a "estimated" label. 

When multiple sources report a price for the same crop/market/date, the system MUST apply a defined priority order (e.g., government mandi feed > verified buyerreported price > field-agent-reported price) and SHOULD display which source was used. 

- A price confidence indicator (e.g., High/Medium/Low) SHOULD be shown, driven by source reliability, data recency, and number of corroborating sources. 

- The system MUST NOT display a single price without at least one comparison point (nearby market, trend, or historical average) — a bare number is not a permitted UI state. 

## 4. Sale Recommendation Rules 

- The Sale Window Score MUST be generated from a defined, inspectable set of inputs: price trend, demand signal strength, crop perishability, and (if available) storage cost/access. 

- Sell / Wait / Reroute-to-another-market suggestions MUST each be accompanied by the top 2–3 contributing reasons in plain language. 

- If input data is insufficient (e.g., no recent price data, no demand signal) the recommendation MUST be shown as low-confidence or withheld, never presented with false certainty. 

- Low-confidence recommendations MUST be visually distinguished (e.g., "Limited data — recommendation may be less reliable") rather than hidden. 

- A user MUST be able to view the recommendation's reasoning on demand (not just a score), and MAY override the recommendation; overrides SHOULD be logged with an optional reason to improve future scoring. 

- The system MUST NOT recommend a specific buyer as part of the Sale Window Score — buyer ranking is a separate, explicit step (Section 7). 

## 5. Buyer Verification Rules 

- A buyer account MUST complete identity/business verification (KYC or equivalent) before it can post demand or submit offers. 

- Minimum verification MUST include: business/entity identity confirmation and a valid contact channel; SHOULD include business registration or equivalent documentation where available. 

- Buyers MUST be assigned a trust tier (e.g., Verified / Provisionally Verified / Unverified) visible on every buyer-facing surface (matches, offers, transactions); unverified buyers MUST NOT appear in farmer-facing buyer match lists. 

- A buyer's trust tier MUST downgrade automatically if dispute rate or late-payment rate exceeds a defined threshold within a rolling window. 

- A buyer under active suspension MUST NOT be able to submit new offers; existing open transactions with a suspended buyer MUST be flagged to the farmer/FPO with a clear warning. 

- Reinstatement of a suspended buyer MUST require admin review and MUST be logged. 

## 6. Lot Creation and Grading Rules 

- A lot MUST include at minimum: crop/commodity, variety (if applicable), quantity, harvest date, location, and at least one photo. 

- A provisional grade MUST be assigned via the guided checklist (moisture, size, damage, foreign matter, or crop-specific parameters); the system MUST record who assigned the grade (farmer self-report, field-agent-assisted, or future lab/CV verification). 

- A lot MUST NOT be published to buyers until required fields and at least a provisional grade are complete. 

- FPO pooled lots MUST retain a reference to each contributing member lot, including individual quantities and grades, for payment distribution and audit purposes. 

- Once a lot has received buyer interest (an active offer), core fields (quantity, grade, harvest date) MUST NOT be silently edited; changes MUST be flagged to any buyer with an open offer, and MAY invalidate pending offers requiring reconfirmation. 

- A field agent's grade override MUST include a reason and MUST be visible in the lot's history. 

## 7. Matching and Offer Rules 

- Buyer-to-lot matching MUST use crop, grade, quantity, location radius, and buyer demand timeline as hard filters before ranking. 

- Ranking within eligible matches SHOULD prioritize Buyer Confidence Score and proximity; the ranking logic MUST be consistent (not paid placement or arbitrary ordering) per Section 11. 

- An RFQ (request for quote) MAY be initiated by a buyer against demand criteria or by a farmer/FPO broadcasting a published lot to matched buyers. 

- Every offer MUST specify price, quantity, pickup window, and payment terms, and MUST have a defined expiry (default: 48 hours unless otherwise configured); expired offers MUST auto-close and notify both parties. 

- A farmer/FPO MUST be able to counteroffer at least once; the system SHOULD cap negotiation rounds (e.g., 3 rounds) to avoid indefinite stalling, configurable per crop/market. 

- Nearby buyers within a shorter transport radius SHOULD be prioritized in ranking, all else equal, to reduce logistics cost and spoilage risk. 

- For FPO-aggregated lots, buyers requiring a minimum volume MUST only be matched once the pooled quantity meets their stated minimum. 

- Simultaneous acceptance conflicts (see Section 16) MUST be resolved deterministically and transparently, not silently. 

## 8. Logistics Rules 

- Transport suggestions MUST be surfaced automatically once a transaction is confirmed (offer accepted); they MAY also be surfaced when a farmer selects "store" as an alternative decision. 

- Transport cost estimates MUST be based on distance, crop type (e.g., refrigeration need), and quantity, and MUST be shown as an estimate, not a guaranteed final price, unless sourced from a confirmed partner quote. 

- Pickup/drop responsibility (farmer-arranged, buyer-arranged, or platform-partnerarranged) MUST be explicitly stated in the transaction terms before confirmation. Shipment status MUST be updated at defined checkpoints (dispatched, in transit, delivered) and MUST be visible to both farmer/FPO and buyer in real time or nearreal time. 

- If pickup is delayed beyond the agreed window, the system MUST notify both parties and MUST allow the farmer to flag the delay as a potential dispute trigger if it exceeds a defined grace period (default: 24 hours). 

## 9. Payment Rules 

- Every transaction MUST have a payment status in one of: Pending, Partial, Completed, or Failed/Disputed, visible on the transaction timeline. 

- Payment confirmation MUST require evidence: a buyer-submitted confirmation (reference/transaction ID or receipt) at minimum; farmer/FPO confirmation of receipt SHOULD be captured as a secondary confirmation. 

- A mismatch between buyer-claimed and farmer-confirmed payment status MUST auto-flag the transaction for review rather than resolving silently in either party's favor. 

- Milestone-based settlement (e.g., partial payment on pickup, balance on delivery/quality confirmation) MAY be supported per transaction terms agreed at offer acceptance; each milestone MUST be tracked as a distinct payment record. A payment marked "Completed" by a buyer without corresponding farmer confirmation within a defined window (default: 3 days) SHOULD prompt an automatic farmer check-in notification. 

- Payment disputes MUST route into the standard grievance workflow (Section 10) and MUST NOT be resolved outside the logged, auditable dispute path. 

- The system MUST NOT mark a transaction as fully complete while any payment milestone is in a Failed/Disputed state. 

## 10. Dispute and Grievance Rules 

- Disputable events MUST include at minimum: lot rejection at delivery, short weight/quantity, quality disagreement, payment delay, and non-payment. 

- A dispute MUST reference a specific transaction and MUST auto-attach available evidence (lot photos, agreed grade, offer terms, shipment status, payment records). 

- The filer MAY add additional evidence (photos, notes) at submission or during review. 

- Every dispute MUST be assigned a response SLA (default: acknowledgment within 24 hours, resolution target within 5 business days) and the filer MUST be able to view current status. 

- Unresolved disputes at first level (field agent or support) MUST have a defined escalation path to admin/moderator review. 

- Final dispute decisions MUST be recorded with the reasoning and outcome, and MUST update the relevant party's trust indicators (Buyer Confidence Score for buyer-side outcomes). 

- A dispute outcome MUST NOT be reversible without a new, separately logged review — no silent edits to a resolved dispute record. 

## 11. Fairness and Transparency Rules 

The platform MUST NOT charge or deduct any fee that is not disclosed to the farmer before offer acceptance. 

- Any deduction (platform fee, logistics cost passed through, quality-based price adjustment) MUST be itemized and shown as part of net realization, not bundled into a single opaque final number. 

- Buyer/match ranking MUST NOT be influenced by paid placement, sponsorship, or any factor not disclosed in the ranking methodology (Section 7). 

- Every recommendation (Sale Window Score, buyer ranking) MUST be explainable on demand — "why am I seeing this" MUST always have an answer available to the user. 

- The farmer-facing offer/transaction view MUST show net realization (offer price minus disclosed deductions/logistics cost, where applicable) alongside the gross offer price, so the farmer sees what they will actually receive. 

## 12. Offline and Low-Connectivity Rules 

The farmer/field-agent app MUST allow price/recommendation viewing from local cache when offline, with a clear "last synced" indicator. 

- Lot creation and offer responses MUST be permitted offline and stored as local drafts/queued actions. 

- Queued offline actions MUST sync automatically when connectivity resumes, in the order they were created. 

- Sync conflicts (e.g., a lot edited offline while its published state changed serverside, or an offer accepted server-side while a conflicting local action is queued) MUST be resolved by favoring server-side authoritative state, with the user notified of any discarded or superseded local action — the system MUST NOT silently apply a stale offline action over newer server state. 

- Time-sensitive actions (offer acceptance, counteroffer) queued offline MUST be re-validated against current offer status/expiry on sync; an expired or alreadyresolved offer MUST NOT be force-applied. 

## 13. Data Validation Rules 

- Profiles: name, role, location, and a valid contact channel MUST be mandatory; language preference SHOULD be captured at onboarding. 

- Lots: crop, quantity (positive numeric, within a plausible range for the crop), harvest date (not in the future), location, and at least one photo MUST be mandatory. 

- Offers: price (positive numeric), quantity (not exceeding lot's available quantity), pickup window (valid future date range), and payment terms MUST be mandatory. Shipments: pickup location, drop location, and an assigned transport mode/partner MUST be mandatory before a shipment can be marked "dispatched." 

- Payments: amount, currency, and a status value from the defined enum (Section 9) MUST be mandatory; amount MUST NOT exceed the agreed transaction value without an explicit amendment record. 

- Duplicate lot submissions (same farmer, crop, quantity, and harvest date within a short window) SHOULD be flagged for confirmation before publishing to prevent accidental double-listing. 

- Corrupted, malformed, or out-of-range data (e.g., negative quantity, impossible date) MUST be rejected at input with a clear error message, not silently coerced to a default value. 

## 14. Notification Rules 

- Push/in-app notifications MUST be sent for: new offer received, offer accepted/rejected/countered, shipment status change, payment status change, and dispute status change. 

- SMS or WhatsApp notifications SHOULD be used as a fallback or primary channel for users without reliable app connectivity, particularly for time-sensitive events (offer expiry approaching, pickup delay, payment received). 

- Urgent alerts (offer expiring within a short window, dispute deadline approaching, pickup significantly delayed) MUST be sent through the user's highest-reliability configured channel, not queued behind lower-priority notifications. 

- Users MUST be able to set channel preferences (push/SMS/WhatsApp) per notification category; the system MUST respect these preferences except for legally or contractually required notices (e.g., dispute resolution outcomes). Notification content MUST avoid exposing sensitive counterparty data (e.g., full payment details) in SMS previews where the channel is not secure. 

## 15. Audit and Compliance Rules 

The following actions MUST be logged with actor, timestamp, and reason where applicable: lot creation/edit, offer submission/response, transaction status change, payment status change, dispute filing/resolution, buyer verification status change, and any admin edit to a user or transaction record. 

- Historical (locked) transaction records MUST NOT be edited in place; corrections MUST be recorded as new, linked amendment entries preserving the original. 

Only admins MAY amend historical records, and every such amendment MUST include a logged justification. 

- Transaction and dispute history MUST be tamper-evident (e.g., append-only log or equivalent integrity mechanism) so a resolved dispute or completed transaction cannot be silently altered. 

- Access to another user's personal data MUST be logged (who viewed what, when), particularly for admin and field-agent roles with elevated access. 

User consent for data collection (KYC documents, location, contact info) MUST be captured at onboarding and MUST be revocable per applicable data protection requirements. 

## 16. Edge Cases 

- No market data available: the system MUST clearly state no reliable price data exists for the crop/market rather than showing a stale or interpolated number as current; the Sale Window Score MUST default to low-confidence or withheld (Section 4). 

- Same bid from multiple buyers: ties MUST be broken by a defined, disclosed rule (e.g., Buyer Confidence Score, then earliest submission time); the farmer MUST still retain final choice among tied offers where the UI allows manual selection. 

- Quality rejection after dispatch: MUST trigger a mandatory quality-mismatch evidence capture (photos, buyer-stated reason) before any payment adjustment is applied, and MUST be dispute-eligible by default. 

- Partial shipment: MUST be recorded as a distinct shipment record against the original transaction quantity, with payment tracked proportionally; the remaining quantity MUST retain its own status rather than being marked complete prematurely. 

- Buyer no-show at pickup: MUST auto-flag after the agreed pickup window plus grace period (Section 8), notify the farmer/FPO, and MUST negatively impact the buyer's trust score if unresolved or unexplained. 

- Payment delay: MUST trigger the automated check-in flow (Section 9) before escalating to a formal dispute, giving the buyer a defined window to resolve before trust-score impact. 

- Network failure during offer acceptance: the client MUST NOT show a false "accepted" state until server confirmation is received; on reconnect, the system MUST re-check offer status and MUST NOT double-submit a duplicate acceptance. 

## 17. MVP Rules 

### Mandatory for the hackathon/SIH prototype: 

- Price data MUST always show source and freshness (Section 3) — no unlabeled numbers, even with seeded/static data. 

- Sale Window Score MUST always show its reasoning (Section 4), even if using a simplified rule-based calculation. 

Lots MUST enforce required fields before publishing (Section 6). 

- Offers MUST have a visible expiry and a locked-terms transaction record on acceptance (Section 7). 

- Transaction status timeline (Section 8/9) MUST be present, even if advanced manually/simulated for demo purposes. 

- Dispute filing MUST work end-to-end with evidence auto-attachment (Section 10), even if resolution is manually handled by a demo "field agent" role. 

- Net realization MUST be shown on any offer/transaction screen (Section 11) — this is a trust-critical rule and MUST NOT be simplified away. 

### Rules that MAY be simplified for MVP: 

- Buyer verification (Section 5) MAY use a lightweight/manual check instead of a live KYC API integration, provided the trust-tier label is still shown accurately. 

- Offline sync conflict resolution (Section 12) MAY use a simplified "server always wins, notify user" model rather than field-level merge logic. 

- Payment confirmation (Section 9) MAY rely on self-reported status only, with no live payment gateway integration, provided the mismatch-flagging behavior still functions. 

- Notification channels (Section 14) MAY be limited to in-app/push only, deferring SMS/WhatsApp integration. 

### Behaviors that must remain realistic and trustworthy regardless of simplification: 

- The system MUST NOT fabricate certainty (a fake "verified" badge, a hidden fee, an unexplained score) anywhere in the demo, even where underlying data is seeded. 

- Every simplified rule above MUST still produce the correct user-facing signal (e.g., a mock-verified buyer is still clearly labeled as such, not indistinguishable from a fully verified one) so the trust model remains honest even at prototype fidelity. 

