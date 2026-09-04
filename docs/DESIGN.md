version: alpha name: AgriPulse Exchange 

description: Farmer-first decision engine and transaction layer for agricultural — - - commodity sales dark mode first, - - enterprise grade, trust heavy. Decision support leads; transaction execution follows. colors: primary: "#2C2B73" primary-hover: "#3A38A0" secondary: "#5B5E8C" tertiary: "#C4FF4D" tertiary-active: "#AEE83A" neutral: "#0A0B1C" surface: "#14152E" surface-raised: "#1D1F3D" on-surface: "#EEF0FA" on-surface-muted: "#A7ABC9" success: "#2FBF8F" warning: "#F5A623" error: "#E5484D" trust: "#2FBF8F" 

typography: 

display: 

fontFamily: IBM Plex Sans fontSize: 32px fontWeight: 600 lineHeight: 1.15 

- letterSpacing: 0.01em 

h1: 

fontFamily: IBM Plex Sans fontSize: 24px fontWeight: 600 lineHeight: 1.2 h2: fontFamily: IBM Plex Sans fontSize: 18px fontWeight: 600 lineHeight: 1.3 

body-md: 

fontFamily: IBM Plex Sans fontSize: 16px fontWeight: 400 lineHeight: 1.5 body-sm: fontFamily: IBM Plex Sans fontSize: 13px 

fontWeight: 400 lineHeight: 1.45 

label-caps: fontFamily: IBM Plex Sans fontSize: 12px fontWeight: 600 lineHeight: 1 letterSpacing: 0.06em data-lg: fontFamily: IBM Plex Mono fontSize: 28px fontWeight: 600 lineHeight: 1.1 data-md: fontFamily: IBM Plex Mono fontSize: 16px fontWeight: 500 lineHeight: 1.4 rounded: sm: 6px md: 12px lg: 20px full: 999px spacing: base: 8px 

xs: 4px 

sm: 8px md: 16px lg: 24px 

xl: 32px "2xl": 48px 

gutter: 20px margin-mobile: 16px margin-desktop: 32px components: button-primary: backgroundColor: "{colors.tertiary}" textColor: "{colors.neutral}" rounded: "{rounded.md}" padding: 14px 

button-primary-hover: backgroundColor: "{colors.tertiary-active}" button-secondary: backgroundColor: transparent textColor: "{colors.on-surface}" rounded: "{rounded.md}" nav-item-active: backgroundColor: "{colors.primary-hover}" textColor: "{colors.on-surface}" rounded: "{rounded.sm}" 

card: 

backgroundColor: "{colors.surface}" rounded: "{rounded.lg}" padding: 16px - badge trust: 

backgroundColor: "{colors.trust}" textColor: "{colors.neutral}" rounded: "{rounded.full}" typography: "{typography.label-caps}" chip-grade: 

backgroundColor: "{colors.surface-raised}" textColor: "{colors.on-surface}" rounded: "{rounded.full}" typography: "{typography.label-caps}" - - status step complete: backgroundColor: "{colors.success}" textColor: "{colors.neutral}" - - status step pending: 

backgroundColor: "{colors.surface-raised}" textColor: "{colors.on-surface-muted}" input: 

backgroundColor: "{colors.surface}" textColor: "{colors.on-surface}" rounded: "{rounded.sm}" padding: 12px 

## banner-warning: 

backgroundColor: "{colors.warning}" textColor: "{colors.neutral}" rounded: "{rounded.sm}" 

# AgriPulse Exchange — DESIGN.md 

Spec conformance: <u>google-labs-code/design.md,</u> version `alpha` . Sections below are Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, and Components, Do's and Don'ts — in canonical order — interleaved with unrecognizedbut-preserved sections (Design Principles, Iconography, Information Architecture, Core Screens, Interaction Patterns, Data Visualization, Accessibility & Localization, Responsive Design, Motion & Feedback, Design Tokens Reference, Sample Flows, Theme Direction, Deliverables) that this project adds for its own workflow. Validate with `npx @google/design.md lint DESIGN.md` before shipping UI. 

#### Project design settings 

|Seting|Value|
|---|---|
|Product brief&<br>aesthetic|Clean,dark-mode-frst,enterprise-grade<br>agricultural intelligence platform—<br>trustworthy,modern,action-oriented|
|Primarybrand<br>color|Deep Indigo(<br>`primary`token)|
|Secondary /accent<br>color|Cyber Lime(<br>`tertiary`token)|
|UI framework|Tailwind CSS/shadcn/ui|





<!-- Start of picture text -->
Setting Value<br>Theme directions Trust Ledger · Harvest Signal · Market<br>considered Command · Rural Access · Precision Trade<br>Trust Ledger (primary), Precision Trade<br>Recommended<br>(fallback for buyer/FPO power surfaces) —<br>theme<br>see Theme Direction<br><!-- End of picture text -->

## Overview 

AgriPulse Exchange is a decision engine first, a transaction platform second. Every screen must answer "what should I do right now, and why" before it asks a farmer, FPO manager, buyer, or field agent to take an action. The UI must never read as a generic e-commerce or - — price ticker app it reads as an operating system for agricultural trade decisions, where trust and clarity are load-bearing, not decorative. 

#### Target users and what they need from the UI: 

- Farmers — low-friction, high-trust, mobile-first, tolerant of poor connectivity and variable literacy. They need the sell/wait decision and the "who do I trust" answer in under 10 seconds of screen time. 

- FPO managers — aggregation and oversight across many farmers/lots; need density and control without losing the plainlanguage decision layer underneath. 

- Buyers — a faster, more credible sourcing and negotiation tool than phone calls and word of mouth; need speed and verifiable counterpart data. 

- Field agents — an assistive, often offline-first tool used standing in a field or mandi yard; large touch targets, minimal typing, voice/photo capture where possible. 

Brand personality: measured, competent, unhurried under pressure. Not playful, not cold. The tone is a trusted cooperative's senior field officer, not a fintech growth app and not a government portal. Dense enough to hold real financial and logistics information; spacious enough that a first-time farmer user is never intimidated. 

#### Enterprise dashboard vs. rural-first companion: the product leans rural-first companion at the core, with enterprisedashboard density available as an earned, secondary mode. 

The default experience (farmer home, recommendation, lot entry) must pass the "handed to someone's parent in a field with patchy signal" test. FPO and buyer surfaces may progressively increase density and information hierarchy, because those users have opted into more complex workflows and typically use larger screens. This is why the design system defines one token set with two expression modes rather than two separate products — see Responsive Design and Theme Direction. 

## Design Principles 

- Trustworthy and transparent — every number that affects 

- money (price, score, fee, payout) shows its source and freshness. Nothing is presented as fact without a visible "as of" timestamp. 

- Fast to scan — the single most important decision or number per screen is always the largest, highest-contrast element on it. Secondary data recedes. 

- Mobile-first — designed at 360px width first; larger breakpoints are additive, never a redesign. 

- Offline-tolerant — every core farmer action (lot entry, viewing last-synced recommendation) must work with no network and clearly show sync state. 

- Multilingual — Hindi at parity with English from day one; layout must not break when strings run 30–40% longer or shorter than English. 

- Accessible for low-literacy users — icon + color + text together, never text alone, for any status or action; plain everyday words over financial or technical jargon. 

- Explainable recommendations — a score or suggestion 

- without a visible "why" is a policy violation of this design system, not a missing nice-to-have. 

- Transaction-safe interactions — anything that moves a lot, sends an offer, or confirms a payment requires a confirmation step; nothing irreversible happens on a single accidental tap. 

## Colors 

The palette is built around one restrained rule: Cyber Lime is the sole driver of primary interaction across the entire product. If a user can act on something, and it's the single best action on that screen, it's lime. Everything else — including Deep Indigo — is structural, not interactive, so the eye never has to guess what's clickable. 

- Primary — Deep Indigo ( #2C2B73 ): the brand's structural color. Used for app chrome, navigation, headers, selected-but-inactive states, and large brand surfaces. Reads as a ledger at dusk — serious, financial, calm. Never used for a button a user is meant to tap to move forward. 

- Secondary — Dusk Slate ( #5B5E8C ): muted indigo-gray for borders, dividers, secondary icons, and de-emphasized text. Keeps the UI from feeling monochrome without competing with lime. 

- Tertiary / Accent — Cyber Lime ( #C4FF4D ): the only color used for primary calls to action — "Get recommendation," "Send offer," "Confirm sale," live-data pulse indicators. Because it appears nowhere else, a lime element is always unambiguously the next thing to do. 

- Neutral — Night Soil ( #0A0B1C ): the base app background. A near-black indigo-charcoal, not pure black — pure black on 

OLED rural devices tends to crush shadow detail in cards; Night Soil keeps just enough depth. 

- Surface — Loam ( #14152E ): the first elevation layer — cards, list rows, the fertile layer that sits just above the base. 

- Surface Raised — Topsoil ( #1D1F3D ): modals, sheets, and anything that floats above the page. 

- On-Surface — Chalk ( #EEF0FA ): primary text on dark surfaces. Deliberately not pure white, to reduce glare when a farmer is checking the app in direct sun with screen brightness maxed out. 

- On-Surface Muted — Mist ( #A7ABC9 ): secondary text, timestamps, helper copy. 

- Status — Verified Teal ( #2FBF8F ): success, payment confirmed, buyer verified. Chosen as teal rather than a yellowgreen so it is never mistaken for the lime accent. 

- Status — Harvest Amber ( #F5A623 ): pending, awaiting response, hold-and-watch. 

- Status — Blight Red ( #E5484D ): dispute, failed payment, urgent action needed. Named for crop blight deliberately — in this product, red always means "something is threatening the outcome of a sale." 

Field Mode note: dark mode is right for evening review and for a premium enterprise feel, but it is genuinely hard to read in harsh midday sun in a field. The UI must ship a Field Mode — a highcontrast light override using the same token names remapped to light values — rather than treating dark mode as the only mode. See Accessibility & Localization. 

## Typography 

Two type families, one shared visual logic: IBM Plex Sans for interface and reading text, IBM Plex Sans Devanagari as its samefamily pairing for Hindi and Devanagari-script regional languages, and IBM Plex Mono exclusively for anything numeric that 

represents money, quantity, or time. Because the Devanagari cut shares Plex's proportions and weights, mixed-script sentences (common in real farmer UI copy) don't visually clash the way an English-only font paired with a default system Devanagari fallback would. 

- Display (32px/600): the one number or headline per screen that matters most — the Sale Window Score, a price headline. 

- H1 (24px/600) / H2 (18px/600): screen titles and section headers. 

- Body MD (16px/400): default reading size. 16px is a floor, not a default to shrink — this is a low-literacy, often-outdoor, oftenolder-user product. 

- Body SM (13px/400): captions, helper text, metadata only — never for primary content. 

- Label Caps (12px/600, uppercase, tracked): status chips and grade tags, used sparingly — more than one uppercase label per component reads as noisy. 

- Data LG / Data MD (IBM Plex Mono): every price, score, quantity, and timestamp. Tabular figures keep columns of numbers aligned, which matters enormously when a farmer is visually comparing two mandi prices. 

## Iconography 

A single rounded-line icon set (2px stroke) with filled variants reserved for active/selected states only — never mix stroke and filled icons within the same list or nav. Supplement the base set with a small number of custom, domain-specific glyphs the generic sets don't cover well: a grain sack, a mandi weighing scale, a covered truck, a rupee coin stack, a handshake-with-checkmark for verified buyers. No icon is ever used without an adjacent text label in farmer-facing surfaces — this is a low-literacy accessibility requirement, not a style preference, and it also keeps the product from reading like a generic app that assumes icon literacy. 

## Layout 

Layout follows a fluid single-column grid on mobile and a 12column fixed-max-width grid (1280px) on desktop, both built on an 8px spacing scale (with a 4px half-step reserved for icon-tolabel gaps only). Farmer-facing screens stay single-column even on tablet, to avoid forcing a decision-critical number to compete visually with a secondary panel. FPO and buyer surfaces are the only places multi-column layouts appear, and only from tablet width up. 

Cards use generous internal padding (16px mobile / 24px desktop) and 20px external gutters — enough breathing room that a screen never feels like a spreadsheet, even on the FPO aggregation dashboard where information density is highest. 

## Information Architecture 

```
Home / Dashboard (role-aware landing)
```

- ├── `Market Intelligence` 

- │ ├── `Market Comparison (multi-mandi)` 

- │ └── `Price Trend Detail` 

- ├── `Sale Recommendation` 

- │ └── `Sale Window Score Detail (explainability)` 

- ├── `Lot Creation` 

- │ └── `Lot Builder & Grading` 

- ├── `Buyer Matching` 

- │ └── `Buyer Shortlist & Verification` 

- ├── `Offers & Negotiation` 

- │ └── `Offer Detail / Counteroffer Timeline` 

- ├── `Logistics` 

- │ └── `Shipment Tracking` 

- ├── `Payments` 

- │ └── `Payment Status / Milestone Tracker` ├── `Disputes` 

- │ └── `Dispute Case Detail` 

- └── `Admin / Verification (FPO + internal ops only)` 

Farmer and FPO nav uses 4–5 bottom-tab primary destinations max (Home, Market, My Lots, Offers, Profile) with everything else reached from Home — deep nav trees are an anti-pattern for this audience. Buyer and admin surfaces may use a left rail with more destinations, consistent with an enterprise ops tool. 

## Elevation & Depth 

Depth is conveyed through tonal layering, not shadows. Darkmode drop shadows read muddy and add little on a near-black base, so each elevation step is a lighter surface token (Night Soil → Loam → Topsoil) plus a 1px hairline border at 12% white opacity. The one exception: a soft, restrained lime glow ( `box-shadow: 0 0 12px rgba(196,255,77,0.25)` ) is reserved for exactly two situations — the single primary CTA on a screen, and the live pulse indicator described under Motion & Feedback. Overusing the glow anywhere else dilutes it as a signal. 

## Shapes 

Corners use a 12px default radius — enough softness to feel like a companion app a farmer trusts, not so much that it reads as a consumer social app. Small controls (chips, badges) use `full` (pill) radii; large containment (cards, sheets) use `lg` (20px); dense, dashboard-style controls on buyer/FPO surfaces may drop to `sm` (6px) for a more instrumented, precision feel — this is the one deliberate place the system flexes toward "Precision Trade." Never mix sharp and pill radii within the same component family. 

## Components 

- Market cards — mandi name, distance, current price (Data LG), 7-day trend sparkline, freshness timestamp. 

- Trend charts — simple line charts, thick 3px stroke, no gridlines, large end-of-line value label instead of an axis legend. 

- Recommendation cards — Sale Window Score as the dominant element, one-line plain-language verdict ("Good time to sell"), tap-to-expand explanation. 

- Trust badges — pill, Verified Teal, checkmark icon + "Verified buyer" label, always paired with a tap target to view verification detail. 

- 

- Quality grade chips Label Caps on Topsoil surface, grade letter/name only, never color-coded to avoid implying a grade is "good/bad" out of market context. 

- Offer timeline — vertical stepped list, each offer/counteroffer as a row with actor, amount, timestamp, and status dot. 

- Status steps — horizontal on desktop, vertical on mobile; 

- complete steps use `status-step-complete` , future steps use `status-step-pending` , current step gets the lime glow. 

- Payment milestone tracker — identical step pattern to Status Steps, reused rather than reinvented, with explicit stage names (Offer accepted → Dispatched → Delivered → Payment initiated → Payment confirmed). 

- Notification banners — full-width, `banner-warning` for pending action, Blight Red variant for disputes, dismissible only when non-critical. 

- Filter bars — horizontal scroll chip row on mobile, never a hidden dropdown for anything decision-relevant (commodity, mandi, grade). 

- Bottom sheets — used for any secondary action from a card (view offer, contact buyer) rather than full-screen navigation, to preserve context on small screens. 

- Chat / voice assistant entry point — a persistent, labeled (not icon-only) floating action on farmer-facing screens, since voice input matters more than typing for this audience. 

## Core Screens 

### Farmer home dashboard 

- Purpose: answer "what should I do today" in one glance. 

- Key components: recommendation card, market card carousel, active lots summary, notification banner slot. 

- Primary actions: view full recommendation, create a lot, open buyer shortlist. 

- Empty state: no lots yet — large illustration-free prompt, one primary CTA "Add your first lot," no blank dashboard. 

- Error state: if price data fails to load, show last-synced data with a clear "showing data from [time]" banner rather than a blank error screen. 

- Mobile behavior: single column, recommendation card always first, sticky bottom nav. 

### Market comparison screen 

- Purpose: compare price across nearby mandis at a glance. 

- Key components: market cards in a ranked list, distance + netprice-after-transport toggle. 

- Primary actions: select a mandi to route a lot to, view trend detail. 

- Empty state: no data for selected commodity/region — suggest nearest available market instead of a dead end. 

- Error state: stale feed clearly timestamped, never silently substituted. 

- Mobile behavior: vertical list, sort control as a bottom sheet. 

### Sale Window Score screen 

- Purpose: explain the sell/wait recommendation in plain language. 

- Key components: large score (Data LG), verdict line, top 2–3 

- explanation factors, historical trend context. 

- Primary actions: act on recommendation (create lot / view buyers), dismiss/save for later. 

- Empty state: insufficient history for this commodity — say so explicitly, degrade gracefully to a simpler price-trend view. 

- Error state: model unavailable — fall back to raw trend data, never show a broken or blank score. 

- Mobile behavior: score and verdict above the fold; explanation is tap-to-expand, not default-open, to keep scan speed high. 

### Lot builder and grading screen 

- Purpose: capture a sellable lot with enough detail to match buyers accurately. 

- Key components: commodity picker, quantity input, quality grade selector, photo capture, location. 

- Primary actions: save draft, submit lot. 

- Empty state: n/a (always a form); first-time users see inline example values as placeholders. 

- Error state: inline field-level validation, never a top-of-page error summary alone. 

- Mobile behavior: one field group per screen/step rather than one long scroll form; camera-first for grading photos. 

### Buyer shortlist / verification screen 

Purpose: show who a farmer can trust to sell to. 

- Key components: buyer card with Buyer Confidence Score, trust badge, transaction history summary. 

- Primary actions: shortlist, contact, view verification detail. 

- Empty state: no matching buyers yet for this lot — show what would need to change (grade, quantity, location) to unlock matches. 

- Error state: verification data unavailable — clearly mark buyer as "unverified," never hide the gap. 

Mobile behavior: ranked vertical card list, confidence score always visible without scrolling into the card. 

### Offer detail / negotiation screen 

Purpose: track and respond to a specific offer. 

- Key components: offer timeline, current terms summary, counteroffer input. 

- Primary actions: accept, counter, decline. 

- Empty state: no offers yet on this lot — link back to buyer shortlist. 

- Error state: if a counteroffer fails to send, preserve the draft and clearly flag it as unsent. 

- Mobile behavior: timeline scrolls, action buttons pinned to the bottom. 

### Logistics tracking screen 

- Purpose: show shipment status from pickup to delivery. 

- Key components: status steps, transporter contact, ETA. 

- Primary actions: confirm pickup, report an issue. 

- Empty state: shipment not yet created — CTA to create from an accepted offer. 

- Error state: transporter data unavailable — show last known status with timestamp, offer manual status update. 

- Mobile behavior: status steps stacked vertically, map optional/collapsed by default to save data. 

### Payment status screen 

Purpose: show exactly where money is in the process. 

- Key components: payment milestone tracker, amount, linked documents. 

- Primary actions: view receipt, raise a dispute. 

- Empty state: n/a — always tied to an active or completed transaction. 

- Error state: payment delayed past expected window — autosurface a "raise a dispute" prompt rather than waiting for the farmer to find it. 

- Mobile behavior: milestone tracker as the hero element, documents in a collapsed list below. 

### Dispute resolution screen 

- Purpose: file and track a dispute with clear next steps. 

- Key components: dispute status, evidence upload, escalation path, resolution timeline. 

- Primary actions: submit evidence, escalate, mark resolved. 

- Empty state: n/a (always tied to a transaction). 

- Error state: never show "pending" with no further information — always show what happens next and roughly when. 

- Mobile behavior: camera-first evidence capture, status always visible at the top. 

### FPO aggregation dashboard 

- Purpose: give an FPO manager oversight across many farmers/lots at once. 

- Key components: aggregated lot table, bulk actions, per-farmer drill-down. 

- Primary actions: pool lots, bulk-negotiate, drill into a farmer's detail. 

- Empty state: no member farmers onboarded yet — CTA to invite/add. 

- Error state: partial data sync across members — flag which records are stale rather than blocking the whole view. 

- Mobile behavior: table becomes a stacked card list; full table view is tablet/desktop only. 

### Buyer portal dashboard 

- Purpose: give verified buyers an efficient sourcing and negotiation tool. 

- Key components: available lot feed, active offers, transaction history. 

- Primary actions: send RFQ/offer, message farmer/FPO, view lot detail. 

- Empty state: no lots matching sourcing criteria — surface criteria to adjust. 

- Error state: same stale-data pattern as farmer surfaces, but denser presentation is acceptable here. 

- Mobile behavior: buyer portal is desktop-primary, tabletsecondary; mobile is a functional but reduced view, not the primary target. 

## Interaction Patterns 

- One-tap primary actions — the single best next action is always one tap away from any screen's hero content; never buried in a menu. 

- Progressive disclosure — explanations, historical detail, and secondary data are tap-to-expand, not default-open. 

- Confirmation for irreversible actions — sending an offer, confirming a sale, or accepting terms always requires an explicit confirm step with a plain-language summary of what's about to happen. 

- Inline explanation for recommendations — the "why" lives 

- next to the score, not on a separate help page. 

- Optimistic UI where appropriate — non-critical actions (saving a draft, shortlisting a buyer) update instantly; anything involving money or a binding offer waits for confirmed server response. 

- Offline-first behavior indicators — a persistent, unobtrusive 

- sync-state indicator (synced / syncing / offline, queued) on every screen with unsynced data. 

- Save-draft and sync-later — any form (lot entry, counteroffer) can be saved locally and completed without connectivity, syncing automatically on reconnect. 

## Data Visualization 

Charts favor large labels over dense axes. Price trends use simple line charts with the current/end value called out directly on the line rather than requiring an axis read. Arrivals and volume use simple bar charts with values labeled on or above each bar. Confidence scores render as a single filled arc or bar, never a multi-metric radar chart. Logistics cost and payment status use the shared Status Steps component rather than a separate chart type, so a user learns one visual pattern and reuses it everywhere. Avoid dual-axis charts, stacked charts with more than 3 series, and any chart requiring a legend to be understood — if it needs a legend, it needs to be simplified or split into two charts. 

## Accessibility & Localization 

- Color contrast: minimum WCAG AA (4.5:1) for body text against its surface in both Trust Ledger (dark) and Field Mode (light); status colors are never the sole carrier of meaning — always paired with an icon and a text label. 

- Text size: 16px minimum body size app-wide; a system-level 

- "Large Text" toggle scales the type scale up by ~20% without breaking layout. 

- Voice support: voice input for lot entry and buyer messaging, and text-to-speech for the recommendation verdict line, prioritized for low-literacy users over any other assistive feature. 

- Multilingual layout handling: all containers must tolerate Hindi/regional strings running 30–40% longer than English; no 

fixed-width text containers on primary actions. 

- Hindi and regional expansion: IBM Plex Sans Devanagari ships at launch for Hindi; the type token structure (same role names, swapped font family per locale) is designed to extend to Marathi, Punjabi, and other regional scripts without new component work. 

- Non-text cues for low-literacy users: every status (pending, verified, disputed, complete) is communicated through color + icon + short plain-language label together, never through text or color alone. 

## Responsive Design 

|Breakpoint|Range|Layout behavior|
|---|---|---|
|Mobile|360–<br>767px|Single column,botom tab nav,cards<br>full-width|
|Tablet|768–<br>1023px|Farmer/FPO:still single-column<br>primarycontent,secondarypanels<br>appear;Buyer/Admin:two-column<br>layout begins|
|Desktop|1024px+|12-column grid,max-width1280px,left<br>rail navfor buyer/admin,multi-panel<br>FPO dashboard|



Farmer-facing screens deliberately stay close to their mobile layout even at desktop width — this is a mobile-first product used mostly in the field, and desktop farmer usage should feel like a larger version of the same trusted screen, not a different product. 

## Motion & Feedback 

Signature motif — the Pulse: a small animating ring (600ms easeout, lime, low-opacity) fires on any live-data refresh — a price tick, a 

new offer, a status change — a literal, restrained expression of the product's own name. It is the only motion allowed to draw the eye unprompted; everything else is quiet. 

- Loading states: skeleton screens matching final layout, never a generic spinner on content-bearing screens. 

- Success feedback: a brief Verified Teal check animation plus a plain-language confirmation line ("Offer sent to Ramesh Traders"), not just a toast. 

- Warning states: Harvest Amber banner, persistent until 

- acknowledged if it affects an active transaction. 

- Performance discipline: all animation stays under ~250ms, respects `prefers-reduced-motion` , and is tested on low-end Android devices at throttled network speeds — this audience's hardware and connectivity are the real constraint, not the design ambition. 

## Do's and Don'ts 

- Do use Cyber Lime only for the single most important action per screen. 

- Don't mix rounded and sharp corner styles within the same component family. 

- Do maintain WCAG AA contrast (4.5:1 normal text) in both Trust Ledger and Field Mode. 

- Don't rely on color alone for any status — always pair with icon and text. 

- Do show a visible "as of [time]" freshness marker on every price, score, or status. 

- Don't use more than two font weights on a single screen. 

- Do require explicit confirmation for anything that sends money, an offer, or a binding commitment. 

- Don't let the buyer/FPO enterprise density leak into farmerfacing core screens. 

- Do design every core farmer flow offline-first; sync is a background state, not a blocker. 

- Don't ship an icon-only action anywhere a low-literacy user is the primary audience. 

- Do explain every recommendation with its top 2–3 driving factors, visibly, not on a separate page. 

- Don't use decorative animation; the only unprompted motion is the Pulse live-data indicator. 

## Design Tokens Reference 

|Token|Value|Use|
|---|---|---|
|`colors.primary`|`#2C2B73`|Brand chrome,<br>headers,non-<br>interactive brand<br>surfaces|
|`colors.secondary`|`#5B5E8C`|Borders,secondary<br>icons,de-emphasized<br>text|
|`colors.tertiary`|`#C4FF4D`|Sole primary-action/<br>interaction color|
|`colors.neutral`|`#0A0B1C`|App background|
|`colors.surface`|`#14152E`|Cards,list rows|
|`colors.surface-`<br>`raised`|`#1D1F3D`|Modals,sheets|
|`colors.on-surface`|`#EEF0FA`|Primarytext on dark<br>surfaces|
|`colors.on-surface-`<br>`muted`|`#A7ABC9`|Secondarytext,<br>timestamps|



|Token|Value|Use|
|---|---|---|
|`colors.success` /<br>`trust`|`#2FBF8F`|Confrmed, verifed|
|`colors.warning`|`#F5A623`|Pending,needs<br>atention|
|`colors.error`|`#E5484D`|Disputed,failed|
|`rounded.sm / md /`<br>`lg / full`|6 / 12 / 20 /<br>999px|Dense controls/<br>default/containers/<br>pills|
|`spacing.base`|8px|Grid unit for all layout|



## Sample Flows 

Farmer flow (decision → transaction): Home dashboard → Sale Window Score detail (see the "why") → Lot builder (create/confirm lot) → Buyer shortlist (pick a trusted buyer) → Offer detail (accept/counter) → Logistics tracking → Payment status → (optional) Dispute. 

FPO flow: FPO aggregation dashboard → drill into member farmers' lots → pool eligible lots → bulk view of Sale Window Scores across the pool → shortlist buyers at pooled volume → negotiate as one aggregated offer → oversee logistics/payment status across all member farmers from one screen. 

Buyer flow: Buyer portal dashboard → filter available lot feed by commodity/grade/location → view lot + farmer/FPO trust signals → send RFQ/offer → negotiate via offer timeline → confirm shipment logistics → track payment milestone completion. 

## Theme Direction 





<!-- Start of picture text -->
Theme Strength Tradeoff Best used for<br>Implemented as<br>High- Field Mode, a<br>contrast, A full separate visual light/high-<br>Rural low- theme would fragment contrast override<br>Access the brand across user<br>literacy- of the same<br>types<br>friendly tokens, not a<br>second theme<br>Sleek Too Fallback theme,<br>B2B scoped to the<br>PrecisionTrade trading- instrumentedfor farmer-facing/impersonal Buyer Portal<br>terminal and FPO power-<br>screens<br>feel user surfaces<br><!-- End of picture text -->

Recommendation: ship Trust Ledger as the single primary theme across the product — it is the direction the brief already names in its own words, and it is the only one of the five that natively supports - both the trust requirement and the enterprise grade requirement at once. Use Precision Trade as a scoped fallback expression (tighter radii, denser tables, more instrumented data display) specifically for the Buyer Portal and FPO aggregation dashboard, where users have opted into a more professional tool. Do not adopt Harvest Signal, Market Command, or Rural Access as competing themes — fold their best ideas into Trust Ledger as, respectively, naming/warmth language, selective data-overlay components, and the Field Mode accessibility override. 

## Deliverables 

Final recommended theme: Trust Ledger (primary) with a Precision Trade–scoped Buyer/FPO mode and a Field Mode high-contrast light override. 

Moodboard description: a mandi ledger at dusk — deep indigo dark, a single sharp lime signal light, warm earth-toned naming 

underneath a cool enterprise surface, tabular monospace numbers lined up like a well-kept account book. 

- Suggested palette: Deep Indigo `#2C2B73` , Dusk Slate `#5B5E8C` , Cyber Lime `#C4FF4D` , Night Soil `#0A0B1C` , Loam `#14152E` , Chalk `#EEF0FA` , Verified Teal `#2FBF8F` , Harvest 

- Amber `#F5A623` , Blight Red `#E5484D` . 

- Suggested font pairing: IBM Plex Sans (UI/body) + IBM Plex Sans Devanagari (Hindi/regional, same family) + IBM Plex Mono (all prices, quantities, timestamps). 

- Suggested icon style: rounded-line, 2px stroke, filled only for active states, always paired with text labels; custom agri glyphs for sack/scale/truck/rupee/verified-handshake. 

- Suggested component style: tonal elevation over shadows, 12px default radius, lime reserved exclusively for the single primary action per screen. 

- Suggested hero/dashboard layout: Sale Window Score as the dominant hero element on the farmer home screen — large Data LG score, one-line plain-language verdict, tap-to-expand explanation — with market cards and active lots receding beneath it as clearly secondary. 

