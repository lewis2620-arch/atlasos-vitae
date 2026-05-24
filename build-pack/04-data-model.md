# Data Model (Frontend Prototype / Early Build)

## Case
- id
- donorName
- status
  - pending
  - rapid
  - active
  - completed
- riskLevel
  - low
  - medium
  - high
- createdAt
- timeSinceIntake
- currentStage
- keyFlags[]
- summary
- workflowSteps[]
- timelineEvents[]
- notes[]
- matchCandidates[]
- logistics[]
- metrics

## WorkflowStep
- id
- label
- status
  - complete
  - active
  - pending
  - blocked
- requiredActions[]
- missingItems[]
- completedAt
- owner

## TimelineEvent
- id
- timestamp
- type
- message
- severity
- actor

## AthenaInsight
- id
- scope
  - global
  - case
- severity
  - critical
  - warning
  - info
- timestamp
- message
- actionLabel
- linkedCaseId

## MatchCandidate
- id
- recipientName
- score
- rationale
- organType
- status

## LogisticsItem
- id
- type
  - OR
  - transport
  - courier
- label
- scheduledTime
- status

## Suggested mock data rules
- enough data to make the app feel alive
- mix of stable and urgent cases
- mix of completed and incomplete workflow steps
- timeline should tell a believable story
