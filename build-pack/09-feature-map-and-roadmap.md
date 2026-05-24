# AtlasOS + Vitae - Full Feature Map, Plan Overview, and Codex Build Strategy

## Purpose
This document gives Codex the full product context for:
- what iTransplant appears to cover publicly
- what AtlasOS + Vitae must match
- where AtlasOS + Vitae should clearly beat legacy systems
- how to phase the build without losing system completeness

This is the master feature strategy layer that sits on top of the other build-pack files.

---

## 1. Strategic framing

AtlasOS + Vitae is not trying to become "another donor EMR."

It is being designed as:
- a real-time donor and transplant operations platform
- a workflow-native coordination system
- a command center for high-stakes clinical operations
- a future-ready platform for intelligence, reporting automation, and interoperability

### Product architecture
- AtlasOS = platform / operating layer / command layer
- Vitae = donor and transplant coordination application
- Athena = intelligence layer embedded into the workflow

---

## 2. Publicly documented iTransplant feature footprint

Based on public vendor pages and official ecosystem materials, iTransplant publicly presents coverage across the following major areas:

### A. Platform-level scope
- clinical management
- logistics
- communications
- analytics
- donor workflow support
- network and national-system configurability

### B. Organ donor management
- referral intake
- donor case management
- donor assessment / screening
- authorization and consent tracking
- lab / serology / imaging / pathology integration
- allocation support
- recovery coordination
- outcomes and aftercare
- tasks, scheduling, dashboards, audit history

### C. Tissue donor management
- referral
- screening
- recovery
- donor eligibility
- authorization
- configurable checklists
- task / case / schedule management

### D. Eye banking
- referral
- suitability screening
- authorization
- ocular recovery
- tissue processing
- fulfillment
- distribution
- QA / compliance
- attachments, inventory, traceability

### E. Birth tissue acquisition
- case management
- scheduling
- compliance controls
- lab interfaces
- repository / standardized records

### F. iReferral
- automated donor identification
- automated referral triggers
- integration with hospital EHR systems
- secure instant donor case transmission
- phone-call reduction

### G. Mobile app
- secure messaging
- image sharing
- case status updates
- location tracking / visualization
- cross-organization access

### H. Patient management
- transplant center referral
- pre-transplant assessment
- clearance
- living donation workflows
- selection and waitlist
- transplant tracking
- post-transplant management
- organ-offer visibility
- analytics and KPI support

### I. Integration surface
- hospital EHRs
- labs / LIS
- pathology / telepathology
- imaging
- medical examiner / coroner systems
- OPTN / UNOS-facing data exchange

---

## 3. What AtlasOS + Vitae must match

These are the minimum credible replacement surfaces.

### 3.1 Core workflow parity
Codex must ensure the product can plausibly cover:
- donor intake
- donor case creation
- donor case progression
- workflow steps across donor lifecycle
- status tracking
- tasking
- timeline / auditability
- attachments / clinical context panels
- scheduling context
- reporting context

### 3.2 Operational parity
The system must visibly support:
- multiple active cases
- urgent / high-risk cases
- case ownership / workflow state
- operational timing awareness
- cross-role coordination context

### 3.3 Ecosystem parity (front-end readiness)
Even if not implemented technically yet, the product must be architected to support future:
- EHR intake
- lab ingestion
- UNOS / OPTN reporting surfaces
- transplant center collaboration
- mobile operations

### 3.4 Surface parity
At all times, the application should include meaningful UI for:
- Dashboard
- Donor Intake
- Case Board
- Case Detail View
- Workflow Aggregate View
- Matching
- Scheduling
- Reports
- Athena global context
- Athena case context

---

## 4. Where AtlasOS + Vitae should beat iTransplant

This is the wedge map. Codex should build the product in ways that make these wins obvious.

### 4.1 Better intake and triage
Win with:
- richer donor intake structure
- rapid triage UX
- better immediate visibility into case urgency
- future support for FHIR-native intake and structured donor context
- Athena-generated intake summaries and missing-data alerts

### 4.2 Command-center UX
Win with:
- real-time case board
- urgency-based visual hierarchy
- system-level operational overview
- strong case-detail command surface
- less record-entry feel, more operational coordination feel

### 4.3 Workflow intelligence
Win with:
- explicit workflow engine
- visible stage progression
- missing-item surfacing
- next-best-action guidance
- timeline-aware operational decisions

### 4.4 Athena intelligence layer
Win with:
- global insight feed
- case-specific recommendations
- severity-based alerts
- missing-data warnings
- operational risk signaling
- future report drafting / summarization readiness

### 4.5 Mobile / chain-of-custody direction
Win later with:
- bedside action capture
- handoff logging
- transport leg confirmation
- mobile-first operational execution, not just messaging

### 4.6 Reporting and policy-change readiness
Win with:
- clearer operational reporting
- future-ready reporting automation
- extensible data model for policy / field changes
- future reconciliation and audit surfaces

### 4.7 Self-serve configuration direction
Win later with:
- configurable workflow steps
- configurable rule sets
- protocol / checklist management
- no-ticket admin changes

---

## 5. Feature map by build category

## A. Must-match in v1 frontend foundation
These are the first-build essentials for credibility.

### Dashboard
- KPI cards
- active case counts
- high-risk visibility
- average time metrics
- Athena global context

### Donor Intake
- create case
- risk level
- timeline creation
- board insertion
- Athena response

### Case Board
- Pending
- Rapid
- Active
- Completed
- case cards with risk and status
- case selection
- simple progression actions

### Case Detail
- donor summary
- status
- key metadata
- workflow engine
- timeline
- actions
- Athena case intelligence

### Workflow Aggregate
- all active cases
- current stage visibility
- simple progress view
- blocked / at-risk indicators

### Matching
- ranked candidates
- score
- rationale
- organ-type context

### Scheduling
- OR schedule rows
- transport rows
- timing status
- operational context

### Reports
- total cases
- completed cases
- average time to action
- high-risk active
- risk distribution

---

## B. Must-win in v1 / v1.5
These are the visible differentiators.

- elite command-center visual system
- better urgency signaling
- more modern case board
- stronger Case Detail View
- Athena global + case insight system
- better workflow visibility
- end-to-end demo completeness
- stronger seeded data realism

---

## C. Must-build in later phases
These are important but can come after the foundation is stable.

### Operations expansion
- notifications center
- drag-and-drop board
- richer task model
- assignment / ownership controls
- command-center filtering

### Clinical depth
- attachments and document viewer
- richer clinical panels
- more detailed lab / imaging sections
- advanced timeline events
- issue flagging and escalation

### Interoperability / platform readiness
- API service layer
- EHR connector abstraction
- reporting adapter layer
- policy-mapping layer
- external status synchronization

### AI expansion
- richer Athena state model
- summarization
- missing-data detection
- guided workflow recommendations
- report-drafting surfaces

### Extended product modules
- transplant center workflows
- tissue module depth
- eye banking depth
- birth tissue module depth
- multi-network / multi-tenant concepts

---

## 6. Codex implementation roadmap

## Phase 1 - Frontend foundation
Goal:
Create the first modular, production-oriented frontend codebase.

### Codex deliverables
- app shell
- navigation
- shared theme
- design tokens
- reusable components
- centralized mock data
- app state
- all major screens rendered

### Completion standard
The app must feel coherent and whole, not partially implemented.

---

## Phase 2 - System completeness
Goal:
Ensure every top-level module feels like a real product surface.

### Codex deliverables
- mature Dashboard
- full Case Board
- strong Case Detail
- aggregate Workflow screen
- meaningful Matching screen
- meaningful Scheduling screen
- meaningful Reports screen
- Athena visible across the app

### Completion standard
No placeholders. No dead routes. No "coming soon."

---

## Phase 3 - Interaction quality
Goal:
Make the system feel operational and responsive.

### Codex deliverables
- board-level status progression
- workflow progression tied to timeline
- Athena events tied to user actions
- richer urgency indicators
- better transitions and motion
- stronger visual polish

---

## Phase 4 - Demo readiness
Goal:
Create a believable end-to-end demo loop.

### Codex deliverables
- Intake creates a new case
- Case appears on board
- Case opens into detail
- Workflow advances
- Athena responds
- Reports reflect changes
- Matching and Scheduling provide context around the case

### Completion standard
Someone should be able to click through the system and understand how AtlasOS + Vitae replaces legacy donor workflow software.

---

## 7. Prioritization model for Codex

When choosing what to build next, use this order:

### Tier 1 - Must always be protected
- Dashboard
- Case Board
- Case Detail
- Athena global context
- Athena case context

### Tier 2 - Must exist and look real
- Workflow Aggregate
- Matching
- Scheduling
- Reports
- Intake

### Tier 3 - Can be layered in after stability
- drag and drop
- notifications center
- richer tasking
- advanced filtering
- deeper analytics
- extended modules

---

## 8. Guardrails for Codex

### Do not regress system completeness
Do not improve one screen by gutting the rest of the app.

### Do not hollow out non-primary modules
Reports, Matching, Scheduling, and Workflow cannot become placeholder pages.

### Do not reduce Athena to decoration
Athena must respond to state and user actions.

### Do not overbuild backend concerns yet
This stage is frontend-first, but build with clean structure so backend integration can happen later.

### Do not make the app look like a generic admin dashboard
This must feel premium, operational, and urgent.

---

## 9. Suggested success definition

Codex succeeds when the app clearly communicates:

1. AtlasOS + Vitae is a complete donor operations platform
2. The system feels modern, fast, and premium
3. The Case Detail View is strong enough to anchor demos
4. The rest of the system supports that flagship view rather than collapsing around it
5. Athena makes the product feel next-generation rather than static

---

## 10. Final instruction to Codex

Use this document as the feature strategy blueprint.

When in doubt:
- preserve system completeness
- preserve visual quality
- prioritize operational realism
- build the app as a modern command platform, not a static healthcare record UI
