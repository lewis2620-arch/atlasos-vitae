# AtlasOS + Vitae Investor Demo Walkthrough

## Demo Frame
AtlasOS + Vitae is not a donor EMR. It is a real-time operations and interoperability command layer for deceased-donor transplant coordination. The demo should show how Vitae turns fragmented referral, workflow, logistics, reporting, and audit context into one coordinated command surface.

Target length: 5-7 minutes.

## 1. Dashboard - Control Plane Signal
Open the Dashboard.

Message:
"The first thing you see is not a record list. It is the operating picture: EHR feeds, OPTN/API status, lab feeds, audit ledger health, active cases, high-risk cases, and blocked operational work."

Point out:
- Connector row: Epic, Cerner, OPTN, HL7 labs, Audit Ledger.
- High-risk and blocked case metrics.
- Active case stream with owner, next action, due time, and blocker state.

Wedge:
Legacy systems feel records-first. Vitae feels ecosystem-aware and operations-first.

## 2. Donor Intake - FHIR-Native Wedge
Go to Donor Intake and open a new FHIR referral as a case.

Message:
"A structured referral does not become a blank form. It becomes an operational case with intake already complete, clinical context seeded, initial tasks assigned, timeline events written, audit provenance captured, and Athena already watching missing data."

Point out:
- EHR source badge and FHIR R4 bundle preview.
- Organ candidates, risk, GCS, bundle size.
- Manual entry is clearly available but inferior because it lacks EHR provenance.

Wedge:
This attacks the manual transcription and thin-trigger problem directly.

## 3. Case Detail - Clinical Command Surface
After opening the accepted case, stay on Case Detail.

Message:
"This is the command surface. The coordinator can see donor context, workflow, tasks, clinical data, authorization state, attachments, timeline, and Athena in one place."

Point out:
- Cross-org context bar: donor hospital, transplant center, organ, donor type, audit validity.
- Workflow engine with current stage and checklist state.
- Tasks / blockers with owners, due times, severity, and next actions.
- Labs, serology, imaging, authorization, and attachments panels.
- Case Athena with source-linked, categorized insights.

Wedge:
Vitae turns donor case management into workflow coordination, not record hunting.

## 4. Workflow Advancement - Operational Intelligence
Click Advance Workflow on the case.

Message:
"Workflow changes are not cosmetic. Advancing a stage updates the timeline, writes audit-linked history, changes task state, and causes Athena to generate new operational guidance."

Point out:
- Timeline update.
- Checklist progression.
- Case Athena update.
- Board and Reports recalculation after status changes.

Wedge:
Workflow intelligence and auditability are woven into the product, not bolted on.

## 5. Case Board And Workflow Aggregate - Real-Time Coordination
Go to Case Board, then Workflow.

Message:
"The board is not just a kanban. It is a live triage surface showing urgency, stage, owner, due time, and next action across active donor cases."

Point out:
- Pending / Rapid / Active / Completed columns.
- Blocked and at-risk states.
- Owner and next-action metadata on cards.
- Workflow aggregate stage counts plus at-risk work queue.

Wedge:
This is how transplant operations should feel in a command center.

## 6. Scheduling And Chain Of Custody - Logistics Credibility
Go to Scheduling.

Message:
"Vitae treats logistics as first-class clinical operations. OR timing, transport legs, custody readiness, signatures, hashes, temperature, and handoff status are visible together."

Point out:
- OR blocks and transport legs.
- Logistics risk KPI.
- Chain-of-custody timeline with hash and signer status.

Wedge:
Legacy mobile features often stop at messaging. Vitae points toward mobile-first operational execution.

## 7. Reports And Matching - Demo Support Surfaces
Go to Reports, then Matching.

Message:
"The supporting surfaces are live enough to support the story. Reports reflect workflow state, blockers, and risk. Matching is framed around organ context, donor risk, logistics, and candidate rationale."

Point out:
- Reports: open tasks, blocked cases, audit events, readiness state.
- Matching: active organ context and candidate rationale.

Wedge:
The system is complete enough to demo end-to-end without hollow modules.

## 8. Close With Athena
Return attention to Athena.

Message:
"Athena is advisory, not autonomous. Every insight has severity, category, and provenance. It surfaces missing data, timing risk, workflow blockers, reporting risk, and logistics risk so humans can act faster."

Point out:
- Global vs case-scoped context.
- Insight category labels.
- Source/provenance text.
- Action routing to case, workflow, matching, or scheduling.

## Current Demo Boundaries
Be explicit:
- This is frontend-only seeded data.
- There is no production backend, auth, persistence, real FHIR ingestion, real OPTN integration, or real AI service yet.
- The architecture and data model are shaped so those layers can be added later without changing the product story.

## Closing Line
"iTransplant treats donor management as a records system inside a fragmented ecosystem. AtlasOS + Vitae treats the ecosystem itself as the product."
