# AtlasOS + Vitae

AtlasOS is the healthcare coordination command layer. Vitae is the donor and transplant coordination application built on it. Athena is the advisory intelligence layer embedded across the workflow.

This repo now contains the first modular frontend foundation converted from the Claude v5 prototype.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS runtime
- lucide-react icons

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

```text
src/
  App.tsx           app composition
  components.tsx    shell, shared UI, badges, Athena panel
  data.ts           seeded operational data and helpers
  screens.tsx       Dashboard, Intake, Board, Detail, Workflow, Matching, Scheduling, Reports
  state.tsx         reducer, app state, interactions, audit/Athena side effects
  types.ts          product data model
  index.css         locked visual system and layout styles
docs/               product, design, data model, research, history
build-pack/         Codex build brief files
prototype/          v5 single-file reference prototype
decisions/          ADRs
```

The build-pack includes `09-feature-map-and-roadmap.md`, which should be treated as the master strategy layer for iTransplant parity, AtlasOS + Vitae wedge priorities, and future roadmap sequencing.

## Current Scope

The frontend is demoable end to end. It includes meaningful surfaces for Dashboard, Donor Intake, Case Board, Case Detail, Workflow Aggregate, Matching, Scheduling, Reports, Athena global context, and Athena case context.

No backend, auth, persistence, real interoperability, or real AI service is included in this pass.
