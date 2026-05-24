# Core Workflows

## 1. Donor Intake
User enters:
- donor name
- risk level

System action:
- creates new case
- places case into Pending
- creates timeline event
- Athena emits a global insight

## 2. Case Board Review
User sees cases across:
- Pending
- Rapid
- Active
- Completed

User action:
- selects a case
- opens Case Detail

## 3. Case Detail Progression
User reviews:
- summary
- current stage
- key flags
- timeline
- Athena recommendations

User action:
- advances workflow
- marks step complete
- flags issue

System action:
- updates stage state
- updates case status if applicable
- writes timeline event
- Athena updates insight feed

## 4. Workflow Aggregate Review
User sees:
- all cases
- where each case sits in the workflow
- which cases are blocked or at risk

## 5. Matching Review
User sees:
- ranked candidates
- mock score
- rationale

## 6. Scheduling Review
User sees:
- OR schedule entries
- transport leg entries
- operational timing context

## 7. Reporting Review
User sees:
- total cases
- completed cases
- average time to action
- high-risk active
- risk distribution

## Workflow philosophy
Every workflow should feel:
- guided
- operational
- traceable
- fast to scan

Avoid making users dig through form fields to understand state.
