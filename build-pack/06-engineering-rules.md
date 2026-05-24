# Engineering Rules for Codex

## Core rule
Do not delete surface area.
If a module exists in navigation, it must render meaningful UI.

## Preserve system completeness
Do not produce:
- dead screens
- "coming soon" placeholders
- empty routes

## Build incrementally
- preserve working modules
- improve without regression
- do not rewrite blindly unless explicitly required

## Favor reusable components
If a UI pattern repeats, extract it.

## Keep code readable
- small components
- clear props
- typed data models
- avoid tangled state

## UX quality bar
Every build should improve:
- clarity
- consistency
- responsiveness
- realism

## Do not over-engineer
At this stage:
- no backend required
- no auth required
- no API wiring required
- no database required

## But do build as if those will come later
That means:
- clear types
- clear state boundaries
- predictable data flow

## Athena rules
Athena must remain visible as a first-class layer.
Do not reduce it to decorative copy.
It should respond to user actions and case state.

## Case Detail protection rule
Case Detail is the flagship screen.
Do not simplify or hollow it out during future updates.

## Board protection rule
Case Board must remain a real operational surface.
If drag-and-drop is deferred, status progression still needs to work.

## Reports / Matching / Scheduling rule
These can be lighter than Case Detail, but not fake.
They must look productized and coherent.
