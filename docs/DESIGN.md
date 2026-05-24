# Design System

> **Status: locked.** These tokens were established in the v3 directive ("UI/UX System Upgrade") and have been preserved through v5. Do not change them without explicit user direction.

> **Source of truth:** The CSS `:root` block at the top of `prototype/atlas_vitae_v5.html`. Any divergence between this doc and the prototype is a bug in this doc — fix the doc, not the prototype.

---

## Aesthetic intent

This is a mission-critical operations tool. The aesthetic frame is **command center, not consumer app**. Think Linear / Vercel / Palantir Foundry / mission control — not Notion / Slack / Asana.

Decisions that follow from this:
- Dark theme is the only theme. No light mode.
- Typography mixes Inter (UI text, headers) with JetBrains Mono (data, timestamps, IDs, hashes). The monospace usage is a deliberate "operator's terminal" signal, not a stylistic accident.
- Headers and labels are uppercase + tracked when they identify a system surface (panel titles, KPI labels, status badges). Sentence-case is for content (donor names, insight text).
- Motion is restrained. Hover-lift, slide-in, pulse on critical states. No bouncing, no ornamental animations, no full-page transitions.
- Color is semantic, not decorative. Each color carries meaning (see palette below).

---

## Color palette

```css
/* Surfaces */
--bg:           #020617;   /* page background */
--panel:        #0f172a;   /* primary surface */
--panel-2:      #111827;   /* secondary surface (cards inside panels) */
--panel-3:      #1a2438;   /* tertiary surface (hover states on panel-2) */
--border:       #1e293b;   /* default border */
--border-bright:#2d3a52;   /* hover/active border */

/* Text */
--text:         #e2e8f0;   /* primary text */
--muted:        #64748b;   /* tertiary text (timestamps, hints) */
--muted-bright: #94a3b8;   /* secondary text */

/* Semantic colors */
--blue:         #3b82f6;   /* PRIMARY ACTION + active workflow state */
--blue-soft:    rgba(59, 130, 246, 0.12);
--red:          #ef4444;   /* CRITICAL RISK + Rapid status */
--red-soft:     rgba(239, 68, 68, 0.12);
--yellow:       #f59e0b;   /* WARNING */
--yellow-soft:  rgba(245, 158, 11, 0.12);
--green:        #10b981;   /* COMPLETE / HEALTHY */
--green-soft:   rgba(16, 185, 129, 0.12);

/* Radius */
--radius:    12px;          /* panels, cards */
--radius-sm: 8px;            /* buttons, sub-cards, pills */

/* Motion */
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

### Color semantics (load-bearing)

| Color | Meaning | Used for |
|---|---|---|
| Blue | Primary action, active workflow state | Buttons, links, current workflow stage, Active status pill |
| Red | Critical risk, urgency | Rapid status, High risk, critical Athena insights, escalations |
| Yellow | Warning, awaiting review | Warning insights, pending reviews, recon queue items |
| Green | Complete, healthy, verified | Completed stages, healthy connectors, verified signatures, Low risk |
| Muted | Tertiary information | Timestamps, IDs, secondary metadata, Pending status |

**Do not use color decoratively.** If a UI element needs to stand out for reasons other than urgency/state, use elevation (panel-2 vs panel) or weight, not color.

---

## Typography

```css
/* Font families */
font-family: Inter, sans-serif;                              /* default UI */
font-family: 'JetBrains Mono', ui-monospace, monospace;      /* data / timestamps / IDs / hashes */

/* Base */
font-size: 14px;
line-height: 1.5;
-webkit-font-smoothing: antialiased;
```

### When to use JetBrains Mono

- All timestamps (`14:32`, `Apr 12, 2026`)
- All IDs (`CASE #1729384472`, `REF-9821`, `UNOS 4471`)
- All hashes (`f3a2c81b9e04`)
- All numeric values in KPIs and tables (use `font-variant-numeric: tabular-nums`)
- All system status labels (`SYSTEM ONLINE`, `CASE-SCOPED`, `GLOBAL`)
- All uppercase tracked labels (panel titles, KPI labels, breadcrumbs)
- Code/JSON previews (FHIR bundle snippets)

### When to use Inter

- Donor names, recipient names, hospital names
- Body text in insights, notes, instructions
- Button labels
- Headers (h2 page title)
- Anything users read as prose rather than scan as data

### Scale

| Use | Size | Weight |
|---|---|---|
| Page header (h2) | 22px | 600 |
| KPI value | 32px | 500 (mono, tabular-nums) |
| Detail-name (case title) | 24px | 600 |
| Section header (panel-title) | 10–11px | normal, uppercase, 0.14em tracking |
| Body | 13–14px | 400–500 |
| Data row | 12px | 500 |
| Small label | 10–11px | 400, mono |
| Metadata / timestamp | 9–10px | 400, mono, muted |

---

## Motion

```css
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

All transitions use this curve. All transitions are ~150–250ms. No exceptions.

### Approved motion patterns

| Pattern | Duration | Use |
|---|---|---|
| Hover lift | 200ms | Cards on hover: `transform: translateY(-2px)` |
| Hover shift | 150ms | Rows on hover: `transform: translateX(2px)` |
| Slide-in | 300–400ms | Athena insights appearing |
| Pulse | 1.5–2s infinite | Critical/Rapid states, live indicators, system status dot |
| Pulse glow | 2.4s infinite | Rapid cards' red box-shadow expansion |
| Slide-down | 250ms | Workflow stage expanding when clicked |
| Critical flash | 1.6s, 2 iterations | One-time attention grab on critical state change |

### Forbidden motion patterns

- Bouncing easing (`cubic-bezier` with overshoot)
- Page transitions / view fades
- Loading spinners on individual UI elements (use skeleton states or empty states instead)
- Decorative animations that don't communicate state

---

## Component patterns

### Panels

Default surface for grouping content.
```css
background: var(--panel);
border: 1px solid var(--border);
border-radius: var(--radius);
padding: 18px;
```

Panel titles are mono-uppercase-tracked, with optional secondary text on the right:
```html
<div class="panel-title">
  <span>Section Name</span>
  <span class="mono" style="font-size:10px;color:var(--muted);text-transform:none">helper text</span>
</div>
```

### Cards (interactive)

KPI cards, board cards, match cards. Always:
- Lift on hover (`translateY(-2px)`)
- Brighten border on hover (`var(--border)` → `var(--border-bright)`)
- Border-left accent strip in semantic color for status (board cards)

### Pills (status)

```css
font-family: mono;
font-size: 10px;
padding: 3px 8px;
border-radius: 10px;
letter-spacing: 0.08em;
text-transform: uppercase;
```

Status pill class mapping:
- `pill-pending` → muted
- `pill-rapid` → red-soft / #fca5a5
- `pill-active` → blue-soft / #93c5fd
- `pill-completed` → green-soft / #6ee7b7

### Risk tags

Smaller than pills, used inline:
```css
font-family: mono;
font-size: 9px;
padding: 2px 6px;
border-radius: 3px;
letter-spacing: 0.1em;
text-transform: uppercase;
```

- `risk-Low` → green-soft / #6ee7b7
- `risk-Medium` → yellow-soft / #fcd34d
- `risk-High` → red-soft / #fca5a5

### EHR source badges

For Epic / Cerner provenance:
```css
font-family: mono;
font-size: 9px;
padding: 2px 7px;
border-radius: 3px;
letter-spacing: 0.1em;
text-transform: uppercase;
font-weight: 500;
border: 1px solid;
```

- `referral-source-badge.epic` → green-soft fill, green border
- `referral-source-badge.cerner` → blue-soft fill, blue border

### Buttons

Three variants:
- `.btn` (primary): blue background, white text, used for confirmatory actions
- `.btn.ghost`: transparent with bright border, used for secondary actions and inside-card actions
- `.btn.success` / `.btn.warning` / `.btn.danger`: semantic-color variants for state-changing actions
- `.insight-action`: small ghost variant for Athena insight action buttons

All buttons: Inter font, 11–12px, weight 500, uppercase letter-spacing 0.01–0.08em.

---

## Layout

### Three-column app shell

The application has a fixed shell across all pages:
```
[sidebar 240px] [main flex] [athena 320px]
```

- Sidebar: navigation, brand, version footer
- Main: topbar (56px) + workspace (scrollable)
- Athena: global insight feed, sticks on all pages, becomes case-scoped on Case Detail

### Workspace internal layouts

| Page | Layout |
|---|---|
| Dashboard | Stacked: connector row → KPI grid (4-col) → cases panel |
| Case Board | 4-column grid |
| Referrals | Tab strip → card list |
| Workflow | 6-tile grid → case row list |
| Matching | Single-column card list |
| Scheduling | 2-col grid (OR + transport) + chain-of-custody section below |
| Reports | KPI grid (4-col) → 2-col grid (risk dist + status dist) |
| OPTN Hub | 4-tile grid → policy list → recon queue |
| Audit Ledger | Controls bar → 4-tile grid → event stream |
| Case Detail | Header → cross-org bar → 3-col grid (summary 280px / workflow flex / athena 320px) |

---

## Ambient grid background

Page background gets a subtle grid texture (32px × 32px, 4% blue opacity) reinforcing the operations-terminal frame. Applied via `body::before` pseudo-element with `pointer-events: none`.

---

## Don't drift

Three signals you're drifting from the design system:

1. **You're using a color outside the palette.** Stop. The only valid colors are the CSS variables above.
2. **You're using a third font.** Stop. Inter and JetBrains Mono only.
3. **You're adding motion that "feels nice" but doesn't communicate state.** Stop. Motion is semantic, not ornamental.

If a new pattern is genuinely needed (e.g. tabbed inline navigation), propose it and add it to this doc before using it across the codebase.
