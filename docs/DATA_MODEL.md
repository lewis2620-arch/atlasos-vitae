# Data Model

> **Purpose:** Authoritative reference for the prototype's in-memory data shapes. The beta build should derive its TypeScript types (or equivalent) directly from this spec.

> **Status:** Prototype-level. The beta build will need to extend this with proper database schemas (likely PostgreSQL per the research's architecture recommendation), foreign-key relationships, audit constraints, and migration strategy. This doc captures the *application-layer* shape — what the UI consumes.

---

## Core entities

### Case

The central entity. Represents a single donor case from referral acceptance through transport completion.

```ts
type Case = {
  id: number;                        // unique, generated at creation
  name: string;                      // display name, e.g. "Donor B — 32F"
  risk: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Rapid' | 'Active' | 'Completed';
  createdAt: number;                 // unix ms timestamp

  // Cross-org context (added v5 — research §"cross-org visibility")
  hospital:  string;                 // donor hospital, e.g. "St. Vincent's Med"
  center:    string;                 // transplant center, e.g. "Stanford Transplant", or "—" if not yet assigned
  organType: string;                 // "Kidney" | "Liver" | "Heart+Lung" | "Multi-organ" | ...
  ehrSource: 'Epic' | 'Cerner' | 'Manual';
  donorType: 'DBD' | 'DCD';

  flags: string[];                   // free-form badges, e.g. ["Cold ischemic warning", "DCD"]

  // Workflow state
  currentStageIdx: number;           // 0..5, indexes into STAGES
  workflowSteps: WorkflowStep[];     // length always === STAGES.length (6)

  // History collections
  events:     CaseEvent[];           // human-readable activity log
  notes:      CaseNote[];            // coordinator annotations
  insights:   AthenaInsight[];       // Athena-generated insights, case-scoped
  auditChain: AuditEntry[];          // immutable, hash-linked — see below
  custody:    CustodyStop[];         // chain-of-custody legs, populated past Allocation stage
};
```

### Referral

Inbound from EHR. Lives in `data.referrals[]` until accepted (becomes a Case) or dismissed.

```ts
type Referral = {
  id: string;                        // external ID, e.g. "REF-9821"
  receivedAt: number;
  hospital: string;
  ehr: 'Epic' | 'Cerner';
  fhirVersion: string;               // "R4" currently
  donorName: string;                 // anonymized, e.g. "Donor (M, ~52)"
  triggerType: string;               // e.g. "Vented · Mechanical ventilation > 24h"
  glasgowComa: number;               // 3..15
  riskHint: 'Low' | 'Medium' | 'High';
  organCandidates: string[];         // e.g. ["Liver", "Kidney"]
  bundleSize: string;                // human label, e.g. "47 resources"
  status: 'new' | 'triaged' | 'accepted' | 'dismissed';
};
```

### WorkflowStep

One per stage in `STAGES`. Six stages: Intake → Evaluation → Authorization → Allocation → Recovery → Transport.

```ts
type WorkflowStep = {
  name: string;                      // matches STAGES[i].name
  status: 'complete' | 'current' | 'pending';
  checklist: ChecklistItem[];
  completedAt: number | null;        // unix ms; null until complete
};

type ChecklistItem = {
  text: string;
  done: boolean;
  missing: boolean;                  // flagged for action (e.g. lab pending on high-risk case)
};
```

### CaseEvent

Activity log. Surfaces on Case Detail timeline.

```ts
type CaseEvent = {
  t: number;                         // unix ms
  text: string;                      // human-readable
  severity: 'info' | 'warning' | 'critical' | 'complete';
};
```

### CaseNote

```ts
type CaseNote = {
  author: string;                    // e.g. "Coordinator", "Athena"
  text: string;
  t: number;
};
```

### AthenaInsight

```ts
type AthenaInsight = {
  text: string;
  severity: 'info' | 'warning' | 'critical';
  t: number;                         // unix ms
  actions: InsightAction[];          // available buttons
  dismissed?: boolean;
};

type InsightAction =
  | 'acknowledge'
  | 'take_action'
  | 'view_case'
  | 'view_matches'
  | 'escalate';
```

### AuditEntry

Hash-linked immutable log. **Every** action that mutates a case must produce one of these. The prototype enforces this by wiring `addEvent()` to push to both `events` and `auditChain` simultaneously.

```ts
type AuditEntry = {
  seq: number;                       // monotonically increasing within a case
  t: number;
  actor: string;                     // "Coordinator" | "OPO Specialist" | "Epic EHR" | "system" | ...
  action: string;                    // human-readable description
  severity: 'info' | 'warning' | 'critical' | 'complete';
  prevHash: string;                  // 12-char hex; "000000000000" for first entry
  hash: string;                      // 12-char hex; current entry's identity
};
```

**Beta-level requirements** (not in prototype, must be enforced in beta):
- AuditEntry is append-only. No update or delete operations.
- `hash` must be cryptographically derived from `{seq, t, actor, action, prevHash, payload}`. Prototype uses a display-only pseudo-hash; beta must use real SHA-256.
- The chain must be verifiable end-to-end. A "Verify Chain" UI action recomputes and validates.
- Storage must support WORM (write-once-read-many) retention, 7 years minimum per regulatory norms.

### CustodyStop

One leg in the chain-of-custody for an organ in transport.

```ts
type CustodyStop = {
  stage: string;                     // e.g. "Sealed at OPO", "Ground transport", "Air leg", "Recipient handoff"
  location: string;                  // free-form, e.g. "Donor Hospital · OR Suite 3"
  custodian: string;                 // person or entity holding chain at this leg
  t: number | null;                  // null if pending
  tempC: string | null;              // °C, null if pending
  hash: string | null;               // cryptographic proof of leg, null if pending
  status: 'complete' | 'current' | 'pending';
  signed: boolean;                   // electronically signed at this leg?
};
```

---

## Constants

### STAGES

```ts
const STAGES: Array<{ name: string; checklist: string[] }> = [
  { name: "Intake",        checklist: ["Demographics", "Consent", "Initial labs"] },
  { name: "Evaluation",    checklist: ["HLA panel", "Imaging", "Cardiac workup"] },
  { name: "Authorization", checklist: ["Next-of-kin signature", "DCD/DBD declaration"] },
  { name: "Allocation",    checklist: ["Match list run", "Recipient confirmation", "OPO notified"] },
  { name: "Recovery",      checklist: ["OR scheduled", "Recovery team mobilized", "Preservation prep"] },
  { name: "Transport",     checklist: ["Cold ischemic timer", "Transport leg confirmed", "Recipient hospital ready"] }
];
```

**Beta consideration:** Stage names are stable. Per-stage checklists must become configurable per OPO and per organ type.

---

## Invariants

These must always be true. The beta build's persistence layer should enforce them at the database level.

1. **`case.workflowSteps.length === STAGES.length`**. Always 6.
2. **At most one stage has `status === 'current'`.** Specifically, `workflowSteps[currentStageIdx]`. All stages with index < currentStageIdx are `complete`. All with index > are `pending`.
3. **AuditEntry chain is unbroken.** For each case, sorting `auditChain` by `seq` yields a sequence where every entry's `prevHash` matches the previous entry's `hash`. The first entry's `prevHash` is `"000000000000"`.
4. **Every CaseEvent has a corresponding AuditEntry.** Not vice-versa — audit entries also exist for system-level events (EHR ingestion, AI actions) that don't appear in the human timeline.
5. **Referrals cannot be un-accepted.** Once `referral.status === 'accepted'`, transitioning back is not allowed.
6. **Case status progression is monotonic.** Pending → Rapid → Active → Completed. Skipping is allowed (Pending → Active). Going backward is not.
7. **CustodyStops are sequential.** A stop with status `current` exists only if all prior stops are `complete`. No gaps.

---

## Relationships

```
Organization ──< Facility (hospital, center, OPO)
Facility ────< Referral ────> Case  (1:1 once accepted)
Case ────< WorkflowStep (1:6)
Case ────< CaseEvent
Case ────< CaseNote
Case ────< AthenaInsight
Case ────< AuditEntry (append-only)
Case ────< CustodyStop (ordered)
Case ────> Center (target transplant center, nullable)
Case ────> Recipient (allocated recipient, nullable; not modeled in prototype yet)
```

The prototype does not yet model Organization, Facility, or Recipient as first-class entities. Beta must add them.

---

## What's missing (beta scope)

The prototype's data model is sufficient to demonstrate the product positioning. The beta needs:

- **Multi-tenancy.** Cases belong to an Organization (OPO). Cross-org collaboration is explicit, not implicit.
- **User accounts.** Currently every action attributes to "Coordinator". Need real user identity, RBAC, ABAC.
- **Attachments.** Documents, lab PDFs, imaging studies. Stored separately (encrypted object store per research §architecture), referenced by hash from cases.
- **Recipient / candidate / waitlist.** Center-side data model — deferred to v2 phase but needs forward-compatibility now.
- **OPTN policy versions.** The OPTN Hub UI shows policy-versioned mappings; the beta needs actual policy bundle entities with field-mapping rules.
- **FHIR resource storage.** Currently we display a fake bundle preview. Beta needs to actually persist incoming FHIR resources with provenance.
- **Search index.** Cross-case search (research mentions OpenSearch/Elasticsearch). Required for Audit Ledger search and case-wide search.
- **Event bus.** Internal eventing for cross-module reactions (e.g. case status change → notification → audit entry). Architecture diagram in research §reference architecture shows Kafka-equivalent.
