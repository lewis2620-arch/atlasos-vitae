# AtlasOS + Vitae - V1 Execution Plan

## Summary
V1 is an investor-demo frontend deepening pass. The frontend foundation is already complete enough to click through every core surface, so V1 should make the product feel more credible, sharper, and more obviously ahead of legacy transplant workflow software.

V1 remains frontend-only. Do not add backend APIs, auth, persistence, real FHIR ingestion, real OPTN integration, or real AI services in this pass.

## North Star
A reviewer should be able to complete this demo loop and understand why AtlasOS + Vitae is a modern donor operations platform:

1. Dashboard opens with connector and risk context.
2. Donor Intake accepts a structured FHIR referral.
3. The new case appears on the Case Board.
4. The case opens into a stronger Case Detail command surface.
5. Workflow advances and creates timeline/audit/Athena updates.
6. Reports reflect the changed status/risk state.
7. Matching and Scheduling provide believable operational context.

## Branch And Delivery Strategy
- `codex/frontend-foundation` has been merged into `main`.
- V1 work starts from `main` on `codex/v1-investor-demo`.
- Keep large implementation work reviewable through focused commits or PR slices if the branch grows too large.
- Run `npm run lint` and `npm run build` before every push.

## V1 Workstreams

### 1. Case Detail Clinical Command Surface
Case Detail is the flagship screen and must remain the strongest surface.

Deliver:
- Clinical context panels for labs, serology, imaging, authorization, and attachments.
- Realistic seeded data for each panel.
- Denser timeline with audit-linked milestones, workflow actions, and clinical context events.
- Clearer command actions: advance workflow, escalate, generate Athena insight, and review blockers.

Acceptance:
- Case Detail still uses the summary / workflow / Athena structure.
- No clinical panel is empty or placeholder-only.
- High-risk cases make urgency visible without feeling noisy.

### 2. Task Ownership, Blockers, And Next Actions
Add a frontend task model that makes coordination feel operational.

Deliver:
- Typed seeded tasks with owner, due time, stage, severity, status, and case association.
- Case Detail task list with owners and next actions.
- Board and Workflow at-risk/blocked indicators derived from open tasks and checklist gaps.
- Status changes and workflow advancement update task/timeline/Athena state where appropriate.

Acceptance:
- Every active case has believable work remaining.
- Blocked and at-risk states are visible on the Board and Workflow screens.
- The task model is frontend-only but shaped for future API persistence.

### 3. FHIR Intake-To-Case Demo Flow
Deepen the strategic intake wedge.

Deliver:
- Accepted referrals create richer case context: clinical panels, initial tasks, timeline events, and Athena intake summary.
- Manual intake remains visibly inferior due to missing EHR provenance.
- New cases appear immediately in Dashboard, Board, Workflow, Reports, and Athena context.

Acceptance:
- Accepting a referral feels like a real product moment, not just adding a card.
- Athena produces both an intake summary and a missing-data warning when appropriate.

### 4. Athena V1 Insight Model
Athena must be a product layer, not copy.

Deliver:
- Deterministic insight categories: missing data, timing risk, workflow blocker, reporting risk, logistics risk.
- Global and case-scoped insight generation based on current state.
- Visible source/provenance text on every insight.
- Action buttons that route to relevant case, matching, scheduling, or workflow context.

Acceptance:
- Athena changes after referral acceptance, workflow advancement, and status changes.
- Insights are specific enough to explain why they exist.
- Athena never implies autonomous clinical decision-making.

### 5. Board And Workflow Urgency Polish
Make cross-case operations feel live.

Deliver:
- Stronger high-risk and blocked visual states.
- Board card metadata for owner, stage, due time, and next action.
- Workflow aggregate view that surfaces blocked/at-risk cases by stage.
- Timeline and audit updates when board progression changes status.

Acceptance:
- Pending, Rapid, Active, and Completed columns remain meaningful.
- Workflow screen shows operational constraints, not just counts.

### 6. Reports, Matching, And Scheduling Credibility
Keep non-primary modules productized and demo-real.

Deliver:
- Reports reflect live frontend state for status, risk, blocked cases, completed cases, and average time metrics.
- Matching references selected/high-priority organ context and explains ranking rationale.
- Scheduling emphasizes OR timing, transport status, custody readiness, and at-risk logistics.

Acceptance:
- No top-level screen feels like a stub.
- Reports, Matching, and Scheduling support the flagship Case Detail story.

### 7. Visual QA And Responsive Polish
Tighten the mission-control feel.

Deliver:
- Desktop visual QA across all major screens.
- Narrow viewport fallback without incoherent overlap.
- More consistent density, hover states, transitions, and urgency hierarchy.
- Remove unused scaffold artifacts if any appear.

Acceptance:
- No overlapping text or broken panels.
- No dead routes, empty states, or "coming soon" surfaces.
- Dark command-center design remains consistent with `docs/DESIGN.md`.

### 8. Investor Demo Walkthrough
Create a concise demo script that maps product surfaces to wedge claims.

Deliver:
- A markdown walkthrough under `docs/`.
- Five-to-seven minute script using Dashboard, Intake, Case Detail, Scheduling, Reports, and Athena.
- Notes that distinguish current frontend demo behavior from future backend/AI/interoperability work.

Acceptance:
- A stakeholder can run the demo without needing engineering context.
- The script reinforces the parity-plus-wedge story from `09-feature-map-and-roadmap.md`.

## GitHub Issue Set
Create these issues and track V1 implementation against them:

1. [#1 V1: Strengthen Case Detail clinical command surface](https://github.com/lewis2620-arch/atlasos-vitae/issues/1)
2. [#2 V1: Add task ownership, blockers, and next-action model](https://github.com/lewis2620-arch/atlasos-vitae/issues/2)
3. [#3 V1: Deepen FHIR intake-to-case demo flow](https://github.com/lewis2620-arch/atlasos-vitae/issues/3)
4. [#4 V1: Expand Athena insight categories and provenance](https://github.com/lewis2620-arch/atlasos-vitae/issues/4)
5. [#5 V1: Improve board/workflow urgency and status interactions](https://github.com/lewis2620-arch/atlasos-vitae/issues/5)
6. [#6 V1: Make reports reflect live frontend state](https://github.com/lewis2620-arch/atlasos-vitae/issues/6)
7. [#7 V1: Tighten matching and scheduling demo credibility](https://github.com/lewis2620-arch/atlasos-vitae/issues/7)
8. [#8 V1: Visual QA and responsive polish pass](https://github.com/lewis2620-arch/atlasos-vitae/issues/8)
9. [#9 V1: Create investor-demo walkthrough script](https://github.com/lewis2620-arch/atlasos-vitae/issues/9)

## Test Plan
- Run `npm run lint`.
- Run `npm run build`.
- Manual QA the full demo loop:
  - Dashboard opens with connector/status context.
  - Intake creates a case.
  - Case appears on board.
  - Case opens into detail.
  - Workflow advances.
  - Timeline and Athena update.
  - Reports reflect status/risk changes.
  - Matching and Scheduling provide believable context.
- Visual QA:
  - Desktop command-center layout.
  - Narrow viewport fallback.
  - No overlapping text, dead routes, empty panels, or "coming soon" states.

## Explicit Non-Goals
- Backend APIs
- Authentication
- Persistence
- Real FHIR ingestion
- Real OPTN/UNOS integration
- Real AI services
- Full drag-and-drop board
- Notification center
