# App Structure

## Preferred frontend stack
Build the real frontend foundation using:
- React
- TypeScript
- modern component architecture

If framework choice is needed, prefer:
- Next.js app router or Vite + React
Choose the simpler path for fast iteration if there is no backend yet.

## Styling
Prefer:
- Tailwind CSS for speed and consistency
- componentized class patterns
- centralized design tokens / theme variables

## Suggested app structure
/src
  /app or /pages
  /components
    /layout
    /dashboard
    /case-board
    /case-detail
    /workflow
    /matching
    /scheduling
    /reports
    /athena
    /shared
  /data
  /state
  /types
  /utils

## Key shared components
- AppShell
- SidebarNav
- TopBar
- MetricCard
- StatusBadge
- CaseCard
- WorkflowStageCard
- TimelineEvent
- InsightCard
- Panel
- SectionHeader
- EmptyState
- ActionButton

## Navigation surfaces
- Dashboard
- Case Board
- Intake
- Workflow
- Matching
- Scheduling
- Reports

## State model
Need app-level state for:
- cases
- selected case
- workflow stages
- timeline events
- Athena insights
- filters

## Routing guidance
Keep routing simple and explicit.
Each major surface should be reachable and stable.
Avoid hidden or modal-only core screens.

## Data seeding
Use seeded mock data for:
- multiple cases across statuses
- at least one high-risk case
- at least one nearly completed case
- recipient match cards
- transport / OR scheduling rows
- timeline histories
- Athena events
