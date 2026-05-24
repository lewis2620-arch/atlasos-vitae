# UX/UI System

## Visual direction
This product should feel like:
- premium dark-mode SaaS
- mission-critical operations software
- a live control plane

Avoid:
- generic bootstrap admin UI
- over-designed glassmorphism
- noisy healthcare portal aesthetics
- cluttered EHR-style tables everywhere

## Design principles
1. Clarity over decoration
2. Urgency over neutrality
3. Flow over form-heavy interaction
4. System coherence over screen-by-screen novelty
5. Modern depth and motion, but restrained

## Design tokens
### Core colors
- Background: #020617
- Panel: #0f172a
- Panel alt: #111827
- Border: #1e293b
- Text: #e2e8f0
- Muted: #64748b

### Semantic colors
- Primary: blue
- Critical: red
- Warning: yellow
- Success: green

## Typography
- Primary UI font: Inter
- Data / timestamps / metrics: JetBrains Mono
- Hierarchy must be obvious:
  - large KPI values
  - medium screen titles
  - smaller muted labels
  - monospaced timestamps and telemetry-style values

## Motion
Use subtle motion:
- hover elevation
- panel transitions
- pulse on critical items
- slide/fade for Athena insights
- no excessive animation

## Layout rules
- consistent outer shell
- strong left navigation
- central work surface
- intelligence rail on the right where appropriate
- cards and panels should have meaningful grouping

## UX rules
- important information should be scannable in under 5 seconds
- critical items should stand out immediately
- every screen should suggest what to do next
- avoid dead-end placeholder views

## Screen-level expectations
### Dashboard
Operational summary, not vanity analytics

### Case Board
Should feel active and actionable

### Case Detail
The most important screen in the application

### Reports / Matching / Scheduling
Even if lighter in depth, they must feel like real product surfaces
