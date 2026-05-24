# Build History

> **Why this exists:** If you look at the prototype and wonder "why is X built this way?" — the answer is usually in here. Each version was an explicit directive with constraints, and decisions made earlier carry forward.

---

## v2 → v3: The design-system lockdown

**Directive:** "Transition from basic dashboard UI to state-of-the-art operational command system UI."

What changed:
- Locked the design tokens: specific hex palette (#020617 / #0f172a / #3b82f6 / #ef4444 / #f59e0b / #10b981)
- Locked the typography: Inter for UI, JetBrains Mono for data/timestamps/IDs
- Established the Case Detail View as the most important screen — 3-zone layout (summary / workflow / case-scoped Athena)
- Established the six canonical workflow stages
- Established Athena severity types (critical / warning / info) and action buttons (Acknowledge / Take Action / View Case / Escalate / View Matches)
- Established the motion vocabulary (hover-lift, slide-in, pulse, ease curve)

What was deferred to "next phase":
- Drag-and-drop case board
- Notifications system
- Self-serve workflow builder

**Decision that carries forward:** The design system is locked. Tokens, fonts, motion patterns. Don't drift.

---

## v3 → v4: Restoring full system completeness

**Directive:** "Restore full system completeness while preserving v3 UI/UX quality. No 'coming soon' stubs."

What changed:
- Real Case Board with four columns (Pending / Rapid / Active / Completed) and click-to-progress
- Real Workflow Aggregate page (stage distribution, per-case progress strips)
- Real Matching page (recipient cards with scores)
- Real Scheduling page (OR suites + transport legs)
- Real Reports page (KPIs + risk/status distribution bars)

What was preserved exactly: Case Detail View, all v3 design tokens, Athena, Dashboard, Intake.

What was held back: Drag-and-drop, notifications. Per the v3 "next phase" callout.

**Decision that carries forward:** No stubs. Every nav item renders real content. If a feature isn't ready, defer the nav item itself rather than ship a "coming soon" placeholder.

---

## v4 → v5: Strategic repositioning

**Directive:** Reposition the prototype to demo the four strategic wedges identified in the opportunity assessment: FHIR-native referral intake, OPTN/UNOS automation, mobile chain-of-custody, immutable audit ledger.

What changed:
- **Dashboard:** Added connector status row at the top (Epic / Cerner / UNOS / HL7 / Audit Ledger). First impression shift from "case list" to "control plane".
- **Donor Intake → Referrals (FHIR Inbox).** Tab-based UI with structured FHIR referrals showing EHR source badges, GCS, bundle previews, organ candidates. "Open as Case" auto-completes the Intake stage because the EHR provided structured intake. Manual Entry buried as the inferior path.
- **New module: OPTN Hub.** Policy-versioned field mappings, reconciliation queue, auto-map coverage KPI. Directly attacks the "manual XML upload" pain.
- **New module: Audit Ledger.** Cross-case event stream, hash-linked chain, exportable, verifiable. Every `addEvent()` call now writes to the audit chain automatically — making coverage universal without scattered changes.
- **Scheduling → Scheduling & Chain of Custody.** Added the chain-of-custody section below OR/transport — vertical timeline with hash fingerprints, signatures, temperature, custodian per leg.
- **Case Detail:** Added cross-org context bar (donor hospital + EHR badge / transplant center / organ + donor type / audit chain count). 3-zone layout preserved exactly.
- **Data model extensions:** Cases now carry hospital, center, organType, ehrSource, donorType, auditChain, custody. New top-level `data.referrals[]` array.

What was preserved exactly: All v4 design tokens, Case Detail 3-zone grid, Workflow engine, Athena severity system + slide-in + case-scoped switching, Board, Workflow aggregate, Matching, Reports.

**Decisions that carry forward:**
- The connector row stays at the top of the Dashboard. It's the primary perception signal that this is a control plane.
- The Referrals tab order is deliberate: New > Triaged > Manual Entry. Manual is the worst path; FHIR is the best.
- `addEvent()` writes to both `events` and `auditChain`. Don't bypass this — the audit chain's completeness depends on it.
- Cases are organ-aware and donor-type-aware (DBD vs DCD). The beta should keep extending this — different organs have different workflows.

---

## Items deferred across all versions

These are real and on the roadmap, but explicitly not in the prototype:

| Item | Why deferred | Where it lands |
|---|---|---|
| Drag-and-drop board | v3 directive: "next phase" | v1 or v2 |
| Toast notifications + bell | v3 directive: "next phase" | v1 |
| Self-serve workflow / form builder | High complexity, research §wedges: "v2" | v2 |
| Patient / waitlist / offer module (center-side) | Research §"build sequence": v2 | v2 |
| Predictive risk models | Research §"AI strategy": v2 | v2 |
| Tissue / eye module-specific UIs | Cross-module rollout framework, research: "enterprise" | Enterprise |
| Migration factory (sidecar / dual-run / read-only archive) | Pitch-side artifact for now; product surface comes with first real customer | v1 |
| Multi-tenancy | Not a prototype concern | Beta foundation |
| Real authentication / SSO / RBAC | Not a prototype concern | Beta foundation |

---

## Open items for the beta

These were identified in v5 but not addressed in the prototype:

1. **Hash function.** Prototype uses `pseudoHash()` for display. Beta needs real SHA-256.
2. **Real FHIR persistence.** Prototype shows fake bundle previews. Beta needs actual FHIR R4 resource storage with provenance.
3. **Real EHR connectors.** Connector row is decorative. Beta needs actual Epic Connection Hub and Cerner integration paths.
4. **OPTN/UNOS API client.** OPTN Hub displays simulated state. Beta needs a real UNOS API client with policy-versioned field mapping infrastructure.
5. **WORM storage for audit ledger.** Beta needs a storage layer that enforces append-only and 7-year retention.
6. **PHI handling.** Prototype has no real PHI. Beta needs encryption-at-rest, tenant isolation, BAA-ready vendor stack from day one.

---

## 2026-05-23: Modular frontend foundation

Converted the Claude v5 single-file prototype into a Vite + React + TypeScript frontend foundation with typed seeded data, app-level reducer state, reusable shell/components, all core product screens, workflow/status interactions, audit-entry side effects, and global/case-scoped Athena insight generation.

## 2026-05-23: V1 investor-demo planning

Merged the frontend foundation into `main`, created the `codex/v1-investor-demo` working branch, and added `build-pack/10-v1-execution-plan.md` as the source-of-truth plan for the frontend-only V1 deepening pass.

## 2026-05-23: V1 product deepening

Added clinical Case Detail panels, case-linked task ownership and blocker modeling, richer FHIR intake-to-case context, categorized Athena insights with provenance and routing, urgency-aware Board/Workflow surfaces, live-state Reports/Matching/Scheduling credibility improvements, and an investor demo walkthrough.
