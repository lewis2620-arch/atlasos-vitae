# ADR 0001: Tech Stack for Beta Build

**Status:** Accepted for frontend foundation
**Date:** 2026-05-23
**Decider:** David Lewis / Codex implementation pass

## Context

The prototype is a single HTML file with vanilla JS. It is sufficient as a demo artifact but cannot grow into a real product without architectural commitment. Before Codex (or any contributor) starts writing beta code, the tech stack needs to be chosen and recorded here.

The opportunity assessment (`docs/RESEARCH.md` §"reference architecture") recommends a starting stack:

- **Frontend:** React + TypeScript for web; React Native for mobile operations
- **Backend:** Modular services on .NET 8 or Kotlin/Spring Boot
- **Database:** PostgreSQL for primary relational workflows
- **Documents:** Encrypted object storage with signed URLs
- **Eventing:** Kafka or equivalent
- **Search:** OpenSearch / Elasticsearch
- **Data platform:** Lakehouse / warehouse
- **Integration:** FHIR server, HL7 v2 adapters, EHR-specific connectors
- **Security:** SAML/OIDC SSO, MFA, ABAC/RBAC, envelope encryption
- **Deployment:** HIPAA-eligible AWS or Azure, multi-AZ, IaC

This is a recommendation, not a decision.

## Decisions needed

| Decision point | Options | Notes |
|---|---|---|
| Frontend framework | React + TS / Next.js + TS / SvelteKit / Solid | React+TS aligns with research recommendation and ecosystem |
| Build tool | Vite / Next.js / Turbopack | Depends on framework choice |
| Backend language | .NET 8 (C#) / Kotlin+Spring / Node+TS / Python+FastAPI / Go | Healthcare integration maturity matters more than language novelty |
| Backend architecture | Modular monolith / microservices / serverless | Modular monolith likely correct for MVP; decompose later |
| Primary database | PostgreSQL / managed Postgres / SQL Server | PostgreSQL strongly favored |
| Object storage | S3 / Azure Blob / R2 / MinIO | Must support encryption-at-rest, signed URLs, retention tiers |
| Event bus | Kafka / Redpanda / NATS / managed Pub/Sub | Required for audit ledger, integration state, cross-module reactions |
| FHIR server | HAPI FHIR / Medplum / Firely / build-in | Off-the-shelf strongly preferred |
| Cloud | AWS / Azure / GCP | Must be HIPAA-eligible with BAA |
| Auth | Auth0 / WorkOS / Clerk / Cognito / self-hosted Keycloak | SAML+OIDC+SSO required for OPO buyers |
| Monorepo or polyrepo | pnpm/Turbo monorepo / Nx / polyrepo | Monorepo recommended for shared types |
| Hosting / deploy | Fly.io / Render / Vercel / AWS ECS / k8s | Compliance posture is the real constraint |

## Constraints

These are non-negotiable for the beta:

1. **HIPAA-eligible from day one.** No services that can't BAA. No leaky logging. No PHI in URLs.
2. **TypeScript everywhere it's possible.** Shared types between frontend and backend if architecture allows.
3. **The design system in `docs/DESIGN.md` is locked.** Whatever framework is chosen must render the prototype's visual identity exactly.
4. **The data model in `docs/DATA_MODEL.md` is the application schema.** Database choice should fit it, not redefine it.
5. **Audit ledger must be append-only at the storage layer.** Whatever database is chosen needs WORM or equivalent constraint support.
6. **No vendor lock-in on the AI layer.** Athena should be model-provider-agnostic from the start. Adapter pattern over direct API calls.

## Decision

Use **Vite + React + TypeScript** for the beta frontend foundation, with Tailwind CSS available for utility composition and a conventional CSS token layer for the locked prototype design system.

This pass intentionally does not decide the backend, database, cloud, FHIR server, auth provider, or eventing platform. Those remain open until the product moves beyond the frontend-first foundation.

## Consequences

- The prototype can be decomposed into reusable screens, components, state, and typed seeded data without introducing server complexity.
- The app can be iterated quickly during design/product validation.
- React keeps the path open for future shared types, component libraries, and eventual React Native/mobile operations work.
- Vite avoids framework-level routing/server assumptions while the backend architecture is still undecided.
- Backend, persistence, audit storage, real FHIR ingestion, and HIPAA vendor decisions still require follow-on ADRs.

---

## How to use this template for future ADRs

Create a new file: `decisions/NNNN-short-title.md` where NNNN is the next sequential number.

```markdown
# ADR NNNN: Title

**Status:** Proposed | Accepted | Superseded by NNNN | Deprecated
**Date:** YYYY-MM-DD
**Decider:** Name

## Context
What problem are we solving? What forces are in play?

## Decision
What did we decide?

## Consequences
What becomes easier? What becomes harder? What did we close off?
```

Keep ADRs short. The goal is to capture the *decision and why*, not to write a treatise.
