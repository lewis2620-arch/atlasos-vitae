# Research · Opportunity Assessment

> **Why this document exists:** Every product decision in AtlasOS + Vitae traces back to a specific finding in this research. If you find yourself proposing a feature that doesn't connect to a wedge identified here, stop and check. The temptation to copy iTransplant's feature list is real and wrong — we are out-positioning, not out-featuring.

> **How to read this:** The Executive Summary and the "Where the replacement opportunity is real" section are the load-bearing parts. The module inventory of iTransplant is reference material for understanding the competitor, not a shopping list of features for us to build.

---

## Executive summary

The public record shows that iTransplant, originally built by Transplant Connect and now marketed by InVita Healthcare Technologies, is the broadest publicly documented donor-management platform in this niche. Vendor materials describe an end-to-end suite spanning organ donor management, tissue donor management, eye banking, birth-tissue acquisition, automated hospital referral intake, mobile collaboration, and—more recently—transplant-center patient management. The strongest market-positioning claim is that nearly 75% of U.S. deceased organ donations are enabled by the platform, while public case studies and academic/industry materials show national and international deployments, including Australia, Ireland, and Canadian programs.

That breadth is real, and it matters. Public evidence also shows meaningful interoperability: iReferral connects with hospital EHRs including Epic Systems via Connection Hub and Oracle Health / Cerner; module pages describe interfaces for labs, serologies, imaging, pathologies, medical examiner/coroner systems, and mobile/location-aware collaboration; and the counterpart ecosystem operated by UNOS / the Organ Procurement and Transplantation Network now exposes APIs for donor record upload, deceased donor registration, attachments, and related workflows. Peer-reviewed evidence also shows that automated referrals can materially improve referrals, authorizations, and donor conversion.

But the same public record shows a replacement opening. The ecosystem around iTransplant is still fragmented; public OPTN modernization documents repeatedly call out disjointed data systems, manual data entry, lagging integration, duplicated reporting effort, and operational burden when new donor data fields are introduced. The strongest direct evidence against the current state is a peer-reviewed automated-referral study showing that even after automation, "minimal data" were transmitted and "much of the donor chart" still had to be transcribed or hunted down in the hospital EHR. A public OPO assessment tied to iTransplant-based workflows also described cumbersome intake, unnecessary field population during the first call, and delays in electronic notice routing; a Canadian accreditation report documented that tissue/cornea workflows were still partly paper-based where modules had not been implemented.

The strategic implication is that AtlasOS + Vitae should **not** be framed as "another donor EMR." The winning position is a **modern interoperability and operations control plane** for donor-to-transplant workflows: FHIR- and HL7-native intake; case orchestration; mobile chain-of-custody and logistics; policy-aware OPTN/UNOS automation; audit-grade eventing; and carefully bounded AI for summarization, reporting, and decision support. The most attractive entry wedge is to replace the highest-friction layers first—referral intake, logistics/communications, reporting automation, and mobile operations—then absorb the core donor record and finally add center-side patient management. That sequence aligns directly with the public pain points and keeps migration risk lower than a day-one big-bang replacement.

My bottom-line view is straightforward: **the market is not "empty," but true end-to-end competition is still thin**. On the transplant-center side, the clearest public comparables are CareDx's OTTR and TransChart products; on the workflow/collaboration side, the clearest public comparable is OmniLife Health's FlowHawk. What is still missing in public view is a modern, API-first, donor/OPO/transplant system that unifies intake, donor record, logistics, reporting, and center coordination in one product. That is the opening AtlasOS + Vitae should take.

---

## Where the replacement opportunity is real

The key strategic mistake would be to caricature iTransplant as "old and weak." Public evidence does not support that. It supports a more nuanced view: iTransplant is very broad, has real interoperability, and has value that users rely on in production. The opportunity is not because the incumbent has no strengths; it is because the incumbent appears to sit inside a still-fragmented ecosystem where automation coverage, reporting burden, operational ergonomics, and implementation friction remain materially improvable.

### Evidence-backed modernization gaps (the wedge list)

| Gap | Evidence | Why it matters for AtlasOS + Vitae |
|---|---|---|
| Manual transcription still persists after "automation" | Peer-reviewed automated-referral study found that automated referrals generated "minimal data," and much of the donor chart still had to be transcribed via person-to-person communication or searched in the hospital EHR. | Build a truly richer intake layer with structured FHIR/HL7/Epic/Cerner ingestion, not just a trigger and a slim referral payload. |
| Disjointed multi-system workflow | OPTN modernization materials call out limited integration between transplant center, OPO, and waitlist data; secondary technology map says four or five different systems are used and APIs are rare. | Position AtlasOS as the operational control plane that unifies case flow, not merely another record-keeping system. |
| Intake and dispatch friction | Public LiveOnNY assessment described 8–15 minute referral intake, unnecessary iTransplant field population during the first call, delayed electronic notice, and inadequate one-way electronic communication for rapid triage. | The command-center / intelligent-triage wedge is real. Faster, role-aware intake and dispatch is immediately valuable. |
| Reporting and data-change burden | OPTN mapping and modernization reports repeatedly note that implementing new data fields adds cost, time, and programming effort; public comments on lung-donor data changes explicitly say donor record systems such as iTransplant must be updated and mapped. | AtlasOS should use schema versioning, low-code field management, and policy-versioned mappings so new OPTN fields do not become expensive custom projects. |
| "Many interfaces," but limited public API productization | Official materials stress interfaces; UNOS publishes APIs, but public evidence that iTransplant has broadly converted to machine-to-machine UNOS APIs is incomplete, and a reform report alleges XML/manual upload still exists in parts of the workflow. | A high-value wedge is a transparent, modern integration layer with eventing, reconciliation, and customer-visible connector status. |
| High configuration and training burden | Australia's national deployment required design workshops, liaison contacts, SOP development, multiple evaluations, and staff training; Ireland's rollout also required workflow/policy updates and comprehensive training. | AtlasOS should offer self-service workflow and document control so customers are less dependent on vendor-heavy reconfiguration and rollout support. |
| Incomplete module rollout preserves paper workflows | Alberta's accreditation report said the eye bank still used a paper chart because iTransplant tissue/cornea modules had not been implemented with the deceased solid-organ module. | This is an excellent migration wedge: cross-module rollout must be simpler, faster, and lower risk than today. |
| Limited public security transparency | Public materials emphasize HIPAA, encryption, and audit logs, but the reviewed sources did not reveal public attestation artifacts or detailed SLA/SLOs. | AtlasOS can materially differentiate with a transparent trust package: uptime commitments, security whitepaper, audit posture, and customer-facing evidence. |
| Mobile appears collaboration-first, not full operations-first | Public app materials center on messaging, image sharing, updates, and location tracking; they do not publicly show end-to-end mobile chain-of-custody, offline capture, or richer bedside execution. | Mobile chain-of-custody and bedside operations is a strong wedge, especially for transport, recovery, and handoff steps. |
| Analytics demand exceeds what many programs can operationalize | Alberta report explicitly calls for more informatics/analytical muscle; OPTN reports also call for better data tools, standardization, and visibility between OPOs and centers. | AtlasOS should treat analytics and reporting automation as a default operating surface, not a separate BI project. |

---

## Competitive landscape

The public competitive picture is fragmented rather than empty.

| Segment | Public players | What they appear to do | Strategic implication |
|---|---|---|---|
| End-to-end donor/OPO platform | iTransplant dominates public visibility. Vendor claims near-75% U.S. deceased-donor enablement. | Broad donor/OPO workflow + adjacent modules. | AtlasOS + Vitae's core competition is here. |
| Transplant-center EMR / patient management | CareDx says OTTR serves 200+ programs at 60+ transplant centers; acquisition of TransChart expanded EMR coverage to 90+ centers. | Center-side transplant management and quality/EMR workflows. | Competition for the center-side expansion of Vitae, but not necessarily for donor/OPO dominance. |
| Workflow automation / communication | OmniLife Health's FlowHawk positions around clinical workflow automation, secure communication, referral forms, checklists, EMR integration including Epic Phoenix. | Collaboration and orchestration layer rather than donor-record replacement. | Real threat if AtlasOS underinvests in communications/logistics UX. |
| Tele-diagnostics / AI add-ons | CompuMed positions around secure cloud diagnostics for transplant/OPO workflows; markets AI-powered summarization/data-visualization tools for donor cases. | Adjacent specialty services, not core donor EMR. | AtlasOS should integrate or emulate these value-adds early. |

AtlasOS + Vitae can win by combining what these markets currently separate: donor record, orchestration, logistics, reporting automation, center-facing visibility, and safe AI—inside one architecture. That is a more defensible position than attacking only one feature category.

---

## Wedges that can decisively win

The following wedges are designed to answer the specific public pain points above. Listed in build priority order — the top wedges are MVP / v1; the bottom wedges are v2 / enterprise.

| Wedge | What it should do | Phase |
|---|---|---|
| FHIR-native donor referral hub | Ingest richer inpatient context than a thin referral trigger; support Epic/Cerner/FHIR/HL7 v2; auto-open cases with structured clinical context, provenance, and attachment sync. | MVP |
| OPTN/UNOS automation layer | Policy-versioned mappings for DNR, DDR, donor upload, attachments, and future field changes; reconciliation and exception queue. | MVP / v1 |
| Real-time operations command center | A unified case board for referral triage, coordinator dispatch, OR windows, transport, and cross-org communication. | MVP |
| Mobile chain-of-custody | Bedside/offline capture, specimen/container handoff, packaging, transport legs, timestamps, signatures, location proofs, and photo evidence. | v1 |
| Immutable audit/event ledger | Append-only audit history with human-readable diffs, attestation workflow, WORM retention, and export for audits. | MVP |
| AI case summarizer and abstraction scribe | Summarize donor cases, identify missing data, draft reports/messages, and assemble case timelines with citations/provenance. | v1 |
| RAG policy knowledge graph | Search SOPs, OPTN rules, center-specific criteria, prior cases, and operational playbooks from inside the workflow. | v1 |
| Self-serve workflow and protocol builder | Customer-managed forms, checklists, rules, task templates, document control, and policy bundles without vendor tickets. | v2 |
| Offer decision cockpit | Multi-organ decision workspace that unifies donor data, attachments, center preferences, logistics constraints, and action history. | v2 |
| Predictive operations risk models | Forecast donor deterioration risk, logistics slippage, likely missing documentation, and likely late declines. | v2 / enterprise |
| Cross-module tissue / eye / organ rollout framework | Shared identity, org master data, attachments, workflows, and configuration so customers can turn on adjacent modules without reimplementation. | enterprise |
| Migration factory | Canonical import model, automated transform/validation, provenance-preserving archive, dual-run dashboards, and reconciliation. | v1 |

---

## Open questions and limitations

Several important items were not publicly specified in the material reviewed: iTransplant's current core-platform release notes, exact core API surface, exact production architecture, public uptime/SLA commitments, formal public security attestations, pricing, and exact UNOS API adoption status inside iTransplant implementations. The technical-stack reading is partly inferred from hiring materials rather than directly documented in vendor technical manuals.

The bottom-line caution: do not let any of these unknowns become an excuse to either over-build (because "iTransplant probably has it") or under-build (because "iTransplant probably doesn't have it"). Build for the wedges the evidence supports. Iterate from real customer conversations.

---

## Source archive

The full source citation list from the original research compilation is preserved in the build history. The most decision-useful public sources were: official InVita/iTransplant product pages, UNOS APIs page, peer-reviewed automated-referral study in *Transplantation Direct*, Australian DonateLife annual reports, Canadian accreditation reports, OPTN modernization mapping reports, public eye-bank inspection workflow documents, and CareDx and OmniLife official materials.
