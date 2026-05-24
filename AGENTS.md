# AGENTS.md

This file gives Codex persistent context for the AtlasOS + Vitae beta build. Read this first on every session.

---

## What this project is

**AtlasOS + Vitae** is a healthcare coordination operating system targeting the deceased-donor transplant workflow. We are building it to compete with **iTransplant** (InVita Healthcare Technologies), which currently enables ~75% of U.S. deceased organ donations.

We are not building a donor EMR. We are building the **operations and interoperability control plane** that sits above the fragmented donor → OPO → transplant-center ecosystem. The strategic framing is in `docs/RESEARCH.md` and is non-negotiable; before adding any major feature, check whether it advances or distracts from this positioning.

Vitae is the transplant/donor module built on AtlasOS. AtlasOS is the broader platform.

---

## The positioning, in one paragraph

iTransplant is functionally deep and operationally proven. We do not beat it on breadth. We beat it by being **FHIR-native, API-first, audit-grade, and operations-first** in a market the incumbent treats as records-first. The wedges that win, in priority order:

1. **FHIR-native referral intake** (richer than the current thin trigger; attacks the "minimal data, manual transcription" pain)
2. **OPTN/UNOS automation layer** with policy-versioned mappings and reconciliation queue (attacks the "expensive remap project" pain)
3. **Mobile chain-of-custody** with timestamps, signatures, hashes (attacks the "collaboration-first mobile, no operations" gap)
4. **Immutable audit ledger** as a first-class artifact (regulatory differentiator)
5. **Real-time operations command center** for triage and dispatch

Center-side patient management comes *later*, not first. Self-serve workflow builder is high-value but high-complexity — defer.

---

## Current state

- The working prototype is `prototype/atlas_vitae_v5.html` — single HTML file, vanilla JS, no frameworks. It is the reference implementation: when in doubt about behavior, expected UX, design tokens, or data model, **read the prototype**.
- The beta build replaces the prototype with a real codebase. Tech stack is **not yet decided** — see `decisions/0001-tech-stack.md`. Do not start scaffolding without that decision being made.
- The strategic research is in `docs/RESEARCH.md`. The product spec is in `docs/PRODUCT.md`. The design system is in `docs/DESIGN.md`. The data model is in `docs/DATA_MODEL.md`.
- Build history (how we got here through v2 → v5) is in `docs/HISTORY.md`. Useful when a decision feels weird and you need to know why it was made that way.

---

## How to work in this repo

**Before you write code:**

1. Read this file, `docs/RESEARCH.md`, and `docs/PRODUCT.md` if you haven't recently.
2. Open `prototype/atlas_vitae_v5.html` in a browser. Click through every module. The prototype is the spec.
3. If the user's request is ambiguous, ask. If the user's request conflicts with the positioning, flag it — politely, but flag it.
4. Check `decisions/` for ADRs that constrain your choices.

**When you write code:**

1. Match the prototype's design tokens exactly. They are locked. See `docs/DESIGN.md`.
2. Preserve the data model fields the prototype already uses. Adding fields is fine. Removing or renaming is a breaking change and needs justification.
3. Every action that mutates a case must produce an audit-ledger entry. This is a load-bearing product feature, not a logging concern.
4. The Case Detail View is the most important screen. Do not degrade its 3-zone layout (summary / workflow / case-scoped Athena) without explicit user direction.
5. Athena (the AI layer) is summarization, search, and drafting — **never autonomous clinical decision-making**. Every AI-generated statement must be source-linked. See `docs/PRODUCT.md` §AI Strategy.

**When you finish a unit of work:**

1. Update `docs/HISTORY.md` with a one-line entry describing what changed.
2. If you made an architectural choice, write an ADR in `decisions/`.
3. Run any tests that exist; if none exist for the area you touched, propose what tests should be added (but don't write them unprompted unless asked).

---

## What not to do

- **Do not** rebuild the prototype from scratch when asked to extend it. Edit surgically.
- **Do not** add features that aren't on the wedge list above without checking with the user first.
- **Do not** introduce autonomous AI decision-making — clinical or operational. Athena is advisory.
- **Do not** assume HIPAA compliance is handled. It isn't yet. Anything touching PHI requires a security review note before merging.
- **Do not** import the iTransplant feature list as a build spec. We are not copying iTransplant; we are out-positioning it.
- **Do not** add real patient data, even synthetic data that looks real. Use clearly fake names ("Donor A — 47M") and obviously synthetic hospital names.
- **Do not** make the UI lighter, friendlier, or more "consumer-facing." This is a mission-critical operations tool. The aesthetic is intentional.

---

## Domain glossary

- **OPO** — Organ Procurement Organization. The non-profit that coordinates deceased-donor recovery in a region. Primary user of this product.
- **UNOS / OPTN** — United Network for Organ Sharing / Organ Procurement and Transplantation Network. The federal allocation system. We submit to it; we don't replace it.
- **DBD / DCD** — Donation after Brain Death / Donation after Circulatory Death. Two distinct workflows with different clinical and timing constraints.
- **FHIR** — Fast Healthcare Interoperability Resources. The HL7 standard for healthcare data exchange. We are FHIR-native.
- **HLA** — Human Leukocyte Antigen. Matching panel for transplant compatibility.
- **CPRA** — Calculated Panel Reactive Antibody. Sensitization measure for transplant candidates.
- **DDR / DNR** — Deceased Donor Registration / Death Notification Record. OPTN submission types.
- **Cold ischemic time** — Time an organ has been outside the body in cold preservation. Critical clinical constraint, especially for hearts and lungs.
- **Sprint Zero** — Discovery phase. Where we currently are.

---

## Repository layout

```
atlas-vitae-beta/
├── AGENTS.md                  ← you are here
├── README.md                  ← human-facing intro
├── docs/
│   ├── RESEARCH.md            ← opportunity assessment / competitive analysis
│   ├── PRODUCT.md             ← what we're building, why, and in what order
│   ├── DESIGN.md              ← design system, locked tokens, motion specs
│   ├── DATA_MODEL.md          ← entities, fields, relationships
│   └── HISTORY.md             ← build log v2 → v5 + ongoing
├── prototype/
│   └── atlas_vitae_v5.html    ← reference implementation, do not edit
├── decisions/
│   └── 0001-tech-stack.md     ← pending: framework, build, deploy decisions
└── (src/ — to be created once tech stack is decided)
```

---

## A note on collaboration tone

The user (David) is a senior product/delivery lead with deep healthcare-AI background. He edits AI drafts heavily rather than accepting them verbatim, prefers direct execution over lengthy explanation, and wants honest pushback when a request would degrade the product or contradict the strategy. Match that energy: be direct, flag tradeoffs, don't pad answers.
