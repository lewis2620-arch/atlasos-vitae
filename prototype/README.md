# Prototype

The single working file in this folder is the reference implementation of AtlasOS + Vitae.

## How to use this

**Run it:** Open `atlas_vitae_v5.html` in any modern browser. No build step. No dependencies. Just open it.

**Read it:** Single HTML file. CSS in `<style>` block at top. JavaScript at the bottom. Vanilla JS, no frameworks. ~3,300 lines.

**Treat it as the spec.** When the beta build needs to clarify behavior, design tokens, data shape, or user interaction — open this file and check the prototype's implementation. It is the source of truth for *what the product does*. The docs in `/docs` are the source of truth for *why*.

## What's in v5

Eight nav modules, all working:

1. **Dashboard** — connector status row, KPI grid, active cases list
2. **Case Board** — 4-column status board with click-to-progress
3. **Referrals** — FHIR-style EHR inbox (the strategic differentiator)
4. **Workflow** — aggregate stage distribution view
5. **Matching** — recipient ranking cards
6. **Scheduling & Chain of Custody** — OR / transport + hash-stamped custody chain
7. **Reports** — KPIs and distribution bars
8. **OPTN Hub** — policy-versioned field mappings + reconciliation queue
9. **Audit Ledger** — cross-case immutable event stream
10. **Case Detail** — accessed by clicking any case, 3-zone layout

## What's not in v5

These are intentional gaps, not bugs:

- No persistence — everything resets on page reload
- No real authentication — actions are attributed to "Coordinator"
- No real FHIR ingestion — the bundle previews are stylized snippets
- No real OPTN API — connector status and policy versions are demo data
- No real chain-of-custody capture — stops are seeded, not captured from mobile
- No notifications system, no drag-and-drop on board — deferred to next phase

## Demo path

If you have five minutes to walk someone through the product:

1. **Dashboard.** Point at the connector row. "We're the layer that unifies these systems."
2. **Referrals.** Open REF-9815 (the Mayo Clinic Phoenix case). Click "Open as Case →". Point at the audit chain entry showing the EHR bundle reception. "Intake stage is already complete because Epic sent us 61 FHIR resources."
3. **Case Detail.** Point at the cross-org bar (hospital, center, organ type, audit chain status). Walk through the workflow stages. Show the Athena panel switching scope from global to case-scoped.
4. **Scheduling.** Scroll to the chain-of-custody section. "Every leg is hash-stamped and signed."
5. **OPTN Hub.** Point at policy versions. "When OPTN changes a field, we don't bill you for a remap project — we ship a new policy version with auto-mapping coverage."
6. **Audit Ledger.** Search by case name. "Every event from the last five minutes is here, verifiable end-to-end."

If the audience asks for the elevator pitch: *"iTransplant treats donor management as a records system inside a fragmented ecosystem. We treat the ecosystem itself as the product."*

## Don't edit this file

Once the beta build starts, this prototype becomes the historical reference. Changes here are not how the product evolves — changes to the beta codebase are. If you find a bug or want to try a different UI approach, do it in the beta. The prototype stays as the v5 snapshot.

The exception: if the prototype has a genuine bug that would mislead someone reading it as the spec, fix the bug and update `docs/HISTORY.md`.
