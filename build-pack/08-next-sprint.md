# Next Sprint Brief

## Sprint objective
Turn the Claude prototype into a real frontend codebase without losing the design intent or system completeness.

## Sprint priorities
1. Create the app shell and shared component system
2. Rebuild all core screens as real React components
3. Preserve and refine the Case Detail View
4. Restore complete system navigation with meaningful content on every route
5. Make Athena functional across the app using mock insight generation

## Acceptance criteria
- every major nav item works
- no dead screens
- Case Board, Case Detail, Dashboard, and Athena all feel cohesive
- Reports, Matching, Workflow, and Scheduling all render meaningful content
- workflow progression updates timeline and Athena state
- app feels modern, premium, and demo-ready

## Explicit non-goals for this sprint
- no backend
- no auth
- no real API integration
- no persistence
- no full drag and drop unless it is trivial after core completeness is done

## Suggested first implementation order
1. data models and seed data
2. app shell and navigation
3. Dashboard
4. Case Board
5. Case Detail
6. Workflow aggregate
7. Matching
8. Scheduling
9. Reports
10. Athena state and interactions

## Final reminder
Do not chase isolated screen perfection while the rest of the system degrades.
The product must feel whole.
