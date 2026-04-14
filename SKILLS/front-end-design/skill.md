---
name: cloud-sales-dashboard-frontend
description: >
  Frontend design skill for the Cloud Sales Analytics Dashboard project. Use this skill
  whenever building, modifying, or extending any UI component, page, layout, or widget
  for the Cloud Sales Analytics Dashboard. This includes charts, KPI cards, tables,
  sidebars, navbars, filters, modals, and any other visual element. Trigger this skill
  even for small UI changes — it enforces the correct design system, color tokens,
  spacing rules, typography, and responsive behavior specific to this project.
  Always use this when the user says "dashboard", "sales chart", "analytics component",
  "KPI card", "revenue table", or anything related to the Cloud Sales UI.
---

# Cloud Sales Analytics Dashboard — Frontend Skill

This skill defines the complete design system, component patterns, layout rules, and
responsive behavior for the **Cloud Sales Analytics Dashboard** React project.

Always follow this skill when building any UI element for this project.

---

## 1. Design Philosophy

**Aesthetic**: Dark-mode industrial analytics — precise, data-dense, no decorative fluff.
The UI should feel like a Bloomberg terminal meets a modern SaaS product: authoritative,
information-rich, and visually sharp.

**Tone**: Professional. Every pixel earns its place. Data is the hero.

**Differentiation**: Bold crimson accent (`#af1763`) as a power color for primary actions
and critical metrics, against a near-black canvas (`#191c24`). This creates a distinct
identity that feels neither generic Bootstrap dark nor default Tailwind.

---

## 2. Color System

Always use CSS custom properties (variables). Never hard-code hex values in component styles.

```css
:root {
  /* Core backgrounds */
  --color-bg-base:        #191c24;   /* Page / app background */
  --color-bg-surface:     #1f2330;   /* Cards, panels, sidebars */
  --color-bg-elevated:    #252a38;   /* Modals, dropdowns, tooltips */
  --color-bg-hover:       #2c3247;   /* Row hover, button hover states */

  /* Brand */
  --color-primary:        #af1763;   /* CTA buttons, active nav, key highlights */
  --color-primary-hover:  #c91e75;   /* Hover on primary elements */
  --color-primary-subtle: #af176318; /* Light tinted backgrounds for primary areas */

  /* Supporting / semantic */
  --color-info:           #0d6efd;   /* Info badges, links, secondary actions */
  --color-success:        #198754;   /* Positive deltas, growth indicators */
  --color-teal:           #0dcaf0;   /* Sparklines, secondary data series */
  --color-danger:         #ab2e3c;   /* Negative deltas, alerts, errors */
  --color-warning:        #ffc107;   /* Warnings, pending states */

  /* Text */
  --color-text-primary:   #f0f2f7;   /* Headlines, strong labels */
  --color-text-secondary: #9aa0b4;   /* Subtitles, metadata, placeholders */
  --color-text-muted:     #5a6175;   /* Disabled states, fine print */

  /* Borders & dividers */
  --color-border:         #2e3347;   /* Card borders, table lines */
  --color-border-strong:  #404766;   /* Active inputs, focused elements */
}
```

### Usage rules
- `--color-primary` (#af1763): active nav items, primary buttons, key metric callouts, selected states.
- `--color-info` (#0d6efd): secondary buttons, hyperlinks, info chips.
- `--color-success` (#198754): positive percentage badges, upward trend arrows.
- `--color-danger` (#ab2e3c): negative deltas, error states, critical alerts.
- `--color-warning` (#ffc107): warning banners, pending/in-progress indicators.
- `--color-teal` (#0dcaf0): chart accent lines (second data series), sparkline strokes.

---

## 3. Typography

Use **Google Fonts** — import via `<link>` or `@import`.

```css
/* Fonts */
--font-display: 'DM Sans', sans-serif;      /* Navigation, headings, KPI numbers */
--font-body:    'IBM Plex Sans', sans-serif; /* Body text, table content, labels */
--font-mono:    'JetBrains Mono', monospace; /* Numeric values, code, IDs */

/* Scale */
--text-xs:   0.75rem;   /* 12px — fine print, badges */
--text-sm:   0.875rem;  /* 14px — table cells, secondary labels */
--text-base: 1rem;      /* 16px — body default */
--text-lg:   1.125rem;  /* 18px — card titles */
--text-xl:   1.375rem;  /* 22px — section headings */
--text-2xl:  1.75rem;   /* 28px — KPI numbers */
--text-3xl:  2.25rem;   /* 36px — hero metrics */

/* Weight */
--weight-regular: 400;
--weight-medium:  500;
--weight-semibold: 600;
--weight-bold:    700;
```

### Rules
- KPI numbers → `--font-mono`, `--text-2xl` or `--text-3xl`, `--weight-bold`
- Card/section titles → `--font-display`, `--text-lg`, `--weight-semibold`
- Table headers → `--font-display`, `--text-sm`, `--weight-semibold`, uppercase, letter-spacing 0.06em
- Table cells → `--font-body`, `--text-sm`
- Navigation labels → `--font-display`, `--text-sm`, `--weight-medium`

---

## 4. Spacing & Layout Grid

```css
/* Base unit: 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Page layout (desktop)
```
┌──────────────────────────────────────────────────────┐
│  Topbar (height: 64px, sticky)                       │
├──────────┬───────────────────────────────────────────┤
│  Sidebar │  Main Content                             │
│ (240px)  │  padding: 24px                            │
│          │  max-width: 1440px, centered               │
└──────────┴───────────────────────────────────────────┘
```

### Responsive breakpoints
```
xs:  < 480px    → Single column, sidebar hidden (drawer)
sm:  480–767px  → Single column, sidebar drawer
md:  768–1023px → Sidebar collapses to icon-only (60px wide)
lg:  1024–1279px→ Full sidebar (200px) + content
xl:  ≥ 1280px  → Full sidebar (240px) + content, max-width 1440px
```

### Content grid (inside main area)
```css
/* KPI row */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-6);
}

/* Chart grid */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}
/* Wide chart: col-span 8 | Narrow chart/table: col-span 4 */
/* On md: both become col-span 12 (full width) */
```

---

## 5. Core Component Patterns

### 5.1 KPI Card
```jsx
// Structure
<div className="kpi-card">
  <div className="kpi-card__header">
    <span className="kpi-card__label">Total Revenue</span>
    <Icon name="trending-up" className="kpi-card__icon" />
  </div>
  <div className="kpi-card__value">$1,284,320</div>
  <div className="kpi-card__delta positive">+12.4% vs last month</div>
  <div className="kpi-card__sparkline">{/* mini chart */}</div>
</div>
```
```css
.kpi-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color 0.2s;
}
.kpi-card:hover { border-color: var(--color-border-strong); }
.kpi-card__value {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
}
.kpi-card__delta.positive { color: var(--color-success); }
.kpi-card__delta.negative { color: var(--color-danger); }
```

### 5.2 Chart Card
```css
.chart-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-6);
}
.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}
.chart-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}
```

**Recharts color sequence** (use in this order for multi-series):
1. `#af1763` (primary)
2. `#0d6efd` (info)
3. `#0dcaf0` (teal)
4. `#ffc107` (warning)
5. `#198754` (success)

### 5.3 Data Table
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}
.data-table td {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.data-table tr:hover td { background: var(--color-bg-hover); }
```

### 5.4 Sidebar
```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: var(--space-6) 0;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}
.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  border-left: 3px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
}
.sidebar__nav-item:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}
.sidebar__nav-item.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  background: var(--color-primary-subtle);
}
```

### 5.5 Topbar
```css
.topbar {
  height: 64px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  gap: var(--space-4);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

### 5.6 Badge / Chip
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}
.badge--success { background: #19875422; color: var(--color-success); }
.badge--danger  { background: #ab2e3c22; color: var(--color-danger); }
.badge--info    { background: #0d6efd22; color: var(--color-info); }
.badge--warning { background: #ffc10722; color: var(--color-warning); }
.badge--primary { background: var(--color-primary-subtle); color: var(--color-primary); }
```

### 5.7 Button
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--secondary {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
}
.btn--secondary:hover { background: var(--color-bg-hover); }
```

---

## 6. Motion & Animation

Keep animations subtle and purposeful — data dashboards need speed perception.

```css
/* Entry animation for cards */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.kpi-card, .chart-card {
  animation: fadeSlideUp 0.3s ease forwards;
}

/* Stagger KPI cards */
.kpi-card:nth-child(1) { animation-delay: 0ms; }
.kpi-card:nth-child(2) { animation-delay: 60ms; }
.kpi-card:nth-child(3) { animation-delay: 120ms; }
.kpi-card:nth-child(4) { animation-delay: 180ms; }
```

- All transitions: `0.15s ease` for interactive states (hover, active, focus)
- Chart data load: Use Recharts `isAnimationActive={true}` with `animationDuration={600}`
- No bounce, no spring — linear or ease only

---

## 7. Responsive Behavior

```css
/* Sidebar collapse on mobile */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: -240px;
    z-index: 200;
    transition: left 0.25s ease;
  }
  .sidebar.open { left: 0; }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 199;
  }
}

/* KPI grid: 2 col on sm, 1 col on xs */
@media (max-width: 767px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
}
@media (max-width: 479px) {
  .kpi-grid { grid-template-columns: 1fr; }
}

/* Chart grid: all full width on md and below */
@media (max-width: 1023px) {
  .chart-grid > * { grid-column: span 12 !important; }
}

/* Topbar: hamburger menu on mobile */
@media (max-width: 767px) {
  .topbar { padding: 0 var(--space-4); }
  .topbar__hamburger { display: flex; }
}
```

---

## 8. React Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── DashboardLayout.jsx
│   ├── ui/
│   │   ├── KPICard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── Badge.jsx
│   │   └── Button.jsx
│   └── charts/
│       ├── RevenueLineChart.jsx
│       ├── SalesByRegionChart.jsx
│       └── ConversionFunnelChart.jsx
├── pages/
│   ├── Overview.jsx
│   ├── Sales.jsx
│   ├── Products.jsx
│   └── Customers.jsx
├── styles/
│   ├── tokens.css       ← All CSS variables defined here
│   └── global.css       ← Reset + base styles
└── App.jsx
```

Import `tokens.css` at the root of the app. Components import their own `.module.css` or use inline `style` with the token names.

---

## 9. Recommended Libraries

| Purpose | Library |
|---|---|
| Charts | `recharts` |
| Icons | `lucide-react` |
| Date formatting | `date-fns` |
| Number formatting | `Intl.NumberFormat` (native) |
| Routing | `react-router-dom` |

---

## 10. Rules Summary

1. **Always use CSS variables** — never raw hex values in component styles.
2. **Dark mode only** — `--color-bg-base` (#191c24) is the page background. No light mode.
3. **Primary accent sparingly** — `#af1763` only for the most important UI element per screen region.
4. **Monospace for numbers** — all KPI values, currency, percentages use `--font-mono`.
5. **Mobile-first** — build responsive from the start; sidebar must be a drawer on mobile.
6. **Consistent border-radius** — cards/modals: 12px; buttons/badges: 4–8px; inputs: 8px.
7. **No white backgrounds** — the lightest surface is `--color-bg-elevated` (#252a38).
8. **Gap over margin** — use `gap` in flex/grid layouts; reserve `margin` for standalone elements.

---

See `references/component-examples.md` for full JSX component code examples.
See `references/charts-guide.md` for Recharts configuration patterns.
