# Product Specification

> **Purpose:** Translate the strategic wedges in `RESEARCH.md` into concrete modules, behaviors, and sequencing. This is what Codex builds from.

---

## Product positioning

**One-line:** AtlasOS + Vitae is the operations and interoperability control plane for the deceased-donor transplant workflow.

**Three-line elevator:**
- iTransplant covers ~75% of U.S. deceased donations but treats donor management as a record-keeping system inside a fragmented ecosystem.
- We treat the ecosystem itself as the product — FHIR-native intake from any EHR, policy-versioned OPTN/UNOS automation, hash-linked audit ledger, mobile chain-of-custody, real-time command center.
- We replace iTransplant from the highest-friction layer down, starting with referral intake, logistics, reporting automation, and mobile operations.

**The product is not:**
- A donor EMR (records-first framing)
- A general-purpose hospital workflow tool
- A consumer health app
- A clinical decision-making system

---

## Modules (from the v5 prototype)

The prototype implements ten modules. The beta should preserve all ten and the data they share. Module-by-module spec:

### 1. Dashboard
Operational overview. Opens with the **connector status row** — Epic, Cerner, UNOS/OPTN, HL7 lab feeds, Audit Ledger — showing live/warn/error state. Below: KPI cards (total cases, completed, avg time to action, high-risk active). Below that: active case rows showing donor name, organ + donor type, hospital → center routing, EHR source badge, risk, status. Every case row is clickable to open Case Detail.

**Why the connector row matters:** It is the single biggest visual cue that this is a control plane, not a records system. Do not move it down the page.

### 2. Case Board
Four columns: Pending, Rapid, Active, Completed. Cards show donor name, risk, stage progress (6 ticks for the 6-stage workflow). Click to open Case Detail. Each card has a click-to-progress mini-button ("→ Rapid", "→ Active", "→ Completed"). Rapid cards and high-risk Active cards get a red pulse-glow. No drag-and-drop yet (deferred — see HISTORY).

### 3. Referrals (FHIR Inbox)
Three tabs: New, Triaged, Manual Entry. Each new referral shows source EHR badge (Epic green / Cerner blue), FHIR R4 version, GCS, bundle size, organ candidates, and a literal FHIR Bundle preview snippet. "Open as Case →" creates the case with Intake stage already complete (because the EHR provided structured intake) and writes two audit-ledger entries: the EHR bundle reception and the coordinator acceptance. Manual Entry is the third tab, intentionally labeled "no EHR provenance" — it should feel like the inferior path.

**This module is the wedge.** It directly attacks the "minimal data + manual transcription" pain. Treat it as load-bearing.

### 4. Workflow (Aggregate)
Six stage tiles (Intake → Evaluation → Authorization → Allocation → Recovery → Transport) showing case counts per stage. Below: each active case as a row with current stage, 6-segment progress bar, risk tag, status pill. Click to open Case Detail.

### 5. Matching
Five recipient cards. Each shows: score (color-coded — green ≥85, yellow 70–84, muted <70), name, HLA/CPRA/age/region tags, reasoning text. Top of page has a legend explaining score thresholds.

### 6. Scheduling & Chain of Custody
Two-column layout at top: OR Suites + Transport Legs. **Below those**: the differentiator — full custody chains for cases past Allocation. Each stop shows location, custodian, temperature, hash fingerprint, signed/pending status. Vertical timeline with green/blue/grey dots.

**The custody chain is the iTransplant gap most visible to a logistics buyer.** Do not bury it.

### 7. Reports
KPI cards + risk distribution bar + status distribution bar. Standard analytics — not the differentiator, but expected.

### 8. OPTN Hub
Four-tile status grid (submitted today, auto-map coverage, reconciliation queue depth, UNOS API health). Below: policy-versioned mappings table showing DDR/DNR/lung/tissue field maps with active/pending/archived status. Below that: reconciliation queue rows showing field-mismatch and sync-failure cases with resolve actions.

**The differentiator on reporting burden.** When OPTN changes a field, AtlasOS does not generate a remap project — it generates a new policy version with auto-mapping coverage.

### 9. Audit Ledger
Cross-case event stream, most recent first. Hash-linked chain (each entry has prevHash + hash, displayed as 12-char fingerprints). Search filter, Export and Verify Chain buttons. Retention metadata (7-year WORM). Every action across the system writes to this chain automatically — wire it through a single `addEvent()`-equivalent function so coverage is universal.

### 10. Case Detail
The single most important screen. Three-zone layout:
- **Left:** Case Summary (donor info, risk, status, time-since-intake, current stage, key flags, **cross-org context bar** with donor hospital + EHR badge + transplant center + organ/donor type + audit chain status, timeline, notes)
- **Center:** Workflow Engine — 6 stages stacked vertically, each clickable to expand into checklist + per-stage actions. Current stage glows blue with pulsing dot; high-risk current stage gets red border.
- **Right:** Athena — case-scoped insights with severity (critical / warning / info), action buttons (Acknowledge, Take Action, View Case, Escalate, View Matches), slide-in animation.

Header carries detail-id + name + status pill + risk tag + elapsed time + action buttons (Back, Add Note, Trigger Allocation, Escalate, Advance Workflow).

---

## Data model

Authoritative schema is in `DATA_MODEL.md`. Summary:

- **Case** carries id, name, risk, status, createdAt, hospital, center, organType, ehrSource, donorType, flags, currentStageIdx, workflowSteps[], events[], notes[], insights[], auditChain[], custody[]
- **Referral** (inbound, not yet a case) carries id, receivedAt, hospital, ehr, fhirVersion, donorName, triggerType, glasgowComa, riskHint, organCandidates[], bundleSize, status
- **WorkflowStep** carries name, status (complete | current | pending), checklist[], completedAt
- **AuditEntry** carries seq, t, actor, action, severity, prevHash, hash
- **CustodyStop** carries stage, location, custodian, t, tempC, hash, status, signed
- **Insight** (Athena) carries text, severity, t, actions[], dismissed

---

## Workflow stages (canonical)

In order: **Intake → Evaluation → Authorization → Allocation → Recovery → Transport**

Per-stage checklists in the prototype. Beta should make these configurable (per OPO, per organ type) but stage names are stable across all configurations.

---

## AI strategy (Athena)

Athena is the AI layer woven through the product. **It is advisory, not autonomous.**

### What Athena does

- Summarizes case state and recent activity
- Identifies missing data in workflow stages
- Drafts reports, messages, and OPTN submissions for human review
- Searches SOPs, OPTN policy, center criteria via RAG
- Forecasts logistics risk (cold ischemic time, transport slippage)
- Generates case insights tagged with severity (critical / warning / info)

### What Athena never does

- Make clinical decisions
- Auto-accept or auto-decline organ offers
- Submit anything to OPTN/UNOS without human approval
- Send external communications without human approval
- Modify the audit ledger
- Bypass severity-based escalation gates

### Provenance requirements

Every Athena statement shown to a user must be source-linked. If Athena cannot show what record or document the statement came from, it does not show the statement. Athena does not "hallucinate around" missing data — it surfaces the missing data as an insight.

---

## Build sequence (24 months, from research)

| Phase | Duration | Scope |
|---|---|---|
| MVP | Months 0–6 | Referral intake, donor case core, tasks, attachments, RBAC, audit ledger, baseline messaging, baseline dashboards |
| v1 | Months 7–12 | Epic/Cerner/FHIR/HL7 hub, command center, mobile chain-of-custody, UNOS/OPTN reporting automation, customer-facing implementation tooling |
| v2 | Months 13–18 | Patient/waitlist/offer module, self-serve workflow builder, RAG copilot, richer analytics |
| Enterprise | Months 19–24 | Tissue/eye module expansion, benchmarking, predictive modeling, migration factory, multi-tenant scaling, 24/7 support |

The current prototype demonstrates MVP scope, parts of v1 (FHIR intake, OPTN Hub, chain-of-custody), and the AI surface for v2's RAG copilot.

---

## What we are deferring

These belong on the roadmap but not in the next build cycle:

- Drag-and-drop on the Case Board (kanban-style)
- Toast-based notifications and bell-with-badge system
- Self-serve workflow / form / checklist builder
- Patient/waitlist/offer module (center-side)
- Predictive risk models
- Tissue and eye module-specific UIs
- Migration factory / dual-run / read-only archive

If a build request touches one of these, flag it as out-of-scope before implementing.

---

## What we are explicitly not building

- Records-only donor EMR (we are the layer above the EMR)
- Center-side full EMR (CareDx OTTR owns that segment; we integrate)
- General-purpose hospital workflow (OmniLife FlowHawk-like)
- Autonomous AI clinical advisory
- Anything that displaces UNOS/OPTN as the allocation authority

---

## Success criteria

A user should walk away from a five-minute demo with this sentence in their head: **"This is what transplant systems should have been all along."**

The specific moments that produce that reaction, in order:

1. Dashboard opens → connector row → "this product knows it lives inside an ecosystem"
2. Referrals → open REF-9815 → "Intake stage is already complete because Epic gave us 61 FHIR resources"
3. Case Detail → cross-org bar + audit chain badge → "I can see the whole context and who did what"
4. Scheduling → custody chain → "every leg is hash-stamped and signed"
5. OPTN Hub → policy versions → "when OPTN changes a field, you don't bill us for a remap"
6. Audit Ledger → search → "every event from the last five minutes is here, verifiable"

If a build change makes any of these six moments less impactful, the change is wrong.
