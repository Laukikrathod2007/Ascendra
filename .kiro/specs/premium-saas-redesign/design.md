# Design Document: Premium SaaS Redesign

## Overview

GoalForge is a Vanilla JS + Vite enterprise performance management application. The current codebase has all business logic working across seven pages, but the UI is functional rather than polished. This redesign elevates the visual quality to a premium SaaS standard — clean white cards, gradient stat cards, Chart.js charts, a schedule widget, an activity log, and consistent Inter typography — while leaving the entire data and logic layer untouched.

### Guiding Constraints

- **No changes** to `src/store/state.js`, `src/utils/engine.js`, or `src/utils/constants.js`.
- **All `window.*` handlers** (addGoal, removeGoal, submitUserSheet, handleApproval, handleReturn, updateManagerEdit, handleAuditSearch, handleAuditFilter, handleAchievementUpdate, pushSharedGoal, resetAllSheets, setSystemCycle, navigate, handleSearch) must be preserved exactly.
- CSS changes are **additive**: new premium tokens are appended to `src/style.css`; no existing class is removed or renamed.
- Chart.js is loaded via CDN `<script>` tag in `index.html` `<head>` — no npm install required.
- Chart instances are stored on `window` (e.g., `window._areaChart`, `window._donutChart`) so they can be destroyed before re-creation on navigation.
- The Schedule widget uses **static mock data** (3 hardcoded events); no state changes needed.
- The Activity Log reuses `auditLogs` from state directly.

---

## Architecture

### File Change Map

```
index.html                  ← Add Chart.js CDN <script> tag
src/style.css               ← Append premium design tokens + new component classes
src/main.js                 ← Update buildShell() navbar HTML; chart destroy on navigate
src/pages/AdminDashboard.js ← Full HTML rewrite (stat cards, area chart, donut, schedule, activity log)
src/pages/GoalManagement.js ← Full HTML rewrite (premium form, sticky panel, checklist)
src/pages/ManagerReview.js  ← Full HTML rewrite (employee card, goal table, decision matrix)
src/pages/Reports.js        ← Full HTML rewrite (filter bar, live table, export buttons)
src/pages/QuarterlyReview.js← Full HTML rewrite (score card, phase banner, progress table)
src/pages/AdminSettings.js  ← Full HTML rewrite (cycle stepper, completion matrix, governance card)
src/pages/OrgTree.js        ← Full HTML rewrite (premium node cards, connector lines)
```

Files that are **not touched**: `src/store/state.js`, `src/utils/engine.js`, `src/utils/constants.js`, `src/components/GoalCard.js`, `src/styles/variables.css`, `src/counter.js`.

### Rendering Architecture

The app uses a simple string-template SPA pattern. `main.js` owns the shell (sidebar + navbar) and injects page HTML into `#main-content` via `innerHTML`. Each page module exports a single `render*()` function that returns an HTML string. This pattern is preserved exactly; the redesign only changes the HTML strings returned.

```
window.navigate(pageId)
  ├── destroys any active Chart.js instances (window._areaChart, window._donutChart)
  ├── sets innerHTML of #main-content
  └── if pageId === 'admin': calls initDashboardCharts() after a microtask
```

### Chart.js Integration Strategy

Chart.js is loaded globally via CDN before the app module script. The `window.Chart` global is available to all page modules. Dashboard charts are initialised in a dedicated `initDashboardCharts()` function called from `navigate()` after the DOM is updated. Before initialising, any existing instance stored on `window._areaChart` / `window._donutChart` is destroyed to prevent the "Canvas is already in use" error.

```
// In navigate(), after setting innerHTML:
if (pageId === 'admin') {
  requestAnimationFrame(() => initDashboardCharts());
}
```

---

## Components and Interfaces

### 1. Design System (`src/style.css` additions)

New CSS custom properties appended to `:root`:

```css
/* Premium shadow scale */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
--shadow-md: 0 4px 20px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);

/* Stat card gradient tokens */
--grad-pink:   linear-gradient(135deg, #FFE4E6, #FECDD3);
--grad-orange: linear-gradient(135deg, #FFEDD5, #FED7AA);
--grad-blue:   linear-gradient(135deg, #DBEAFE, #BFDBFE);
--grad-green:  linear-gradient(135deg, #D1FAE5, #A7F3D0);

/* Chart palette */
--chart-primary: #6366F1;
--chart-secondary: #F59E0B;
--chart-success: #10B981;
--chart-danger: #EF4444;
```

All existing classes (`.stat-card`, `.stat-card-pink`, `.stat-card-orange`, `.stat-card-blue`, `.stat-card-green`, `.btn`, `.badge`, `.tbl`, `.form-control`, etc.) are preserved. New classes are added for:
- `.schedule-widget` — horizontal event timeline
- `.sched-col` — date column in schedule
- `.sched-event` — event block with dark background
- `.avatar-stack` — overlapping avatar circles
- `.act-log-item` — activity log row
- `.chart-container` — wrapper with fixed height for Chart.js canvases
- `.donut-center-label` — absolute-positioned center text for donut chart

### 2. Sidebar (`src/main.js` — `buildShell()`)

The sidebar HTML structure is unchanged (`.sidebar`, `.sb-brand`, `.sb-logo`, `.sb-name`, `.sb-tag`, `.sb-section`, `.sb-section-label`, `.sb-link`). The only change is adding a bottom user-profile section and ensuring the `data-page` attributes and click handlers remain identical.

### 3. Navbar (`src/main.js` — `buildShell()`)

Updated to include:
- Search input with leading icon (existing `#global-search` + `window.handleSearch` preserved)
- Notification bell + help icon buttons (`.nb-icon-btn`)
- User profile chip with avatar, name, role (existing `.nb-user` structure preserved)
- "Filter" and "Export CSV" action buttons (visible on all pages; pages that don't need them can ignore them)

### 4. Admin Dashboard (`src/pages/AdminDashboard.js`)

```
AdminDashboard
├── PageHeader (breadcrumb, title, action buttons)
├── AlertBanner (conditional, overdue > 0)
├── StatGrid (4 × GradientStatCard)
├── Row (grid-60-40)
│   ├── AreaChartCard
│   │   └── <canvas id="area-chart"> (Chart.js)
│   └── DonutChartCard
│       └── <canvas id="donut-chart"> (Chart.js)
│           └── DonutCenterLabel
└── Row (grid-60-40)
    ├── ScheduleWidget (static mock data)
    └── ActivityLog (auditLogs.slice(0,5))
```

**GradientStatCard** interface:
```
statCard(colorClass, icon, label, value, trend, trendDir, date) → HTML string
```
- `colorClass`: one of `stat-card-pink | stat-card-orange | stat-card-blue | stat-card-green`
- `trend`: string like `"↑ 8%"`
- `trendDir`: `"up" | "down"` — controls `.stat-up` / `.stat-down` colour class

**ScheduleWidget** — 3 hardcoded events:
```js
const SCHEDULE_EVENTS = [
  { date: 'Mon 14', title: 'Goal Setting Deadline', tag: 'Deadline', avatars: ['JS','AC'] },
  { date: 'Wed 16', title: 'Q1 Review Kickoff',     tag: 'Meeting',  avatars: ['SM','JS','AC'] },
  { date: 'Fri 18', title: 'Manager Approvals Due', tag: 'Action',   avatars: ['JS'] },
];
```

**ActivityLog** — reads `auditLogs` from state, renders top 5:
```
actLogItem(initials, bgColor, name, action, timestamp) → HTML string
```

**initDashboardCharts()** — called after DOM update:
```js
function initDashboardCharts() {
  // Destroy existing instances
  if (window._areaChart) { window._areaChart.destroy(); window._areaChart = null; }
  if (window._donutChart) { window._donutChart.destroy(); window._donutChart = null; }

  // Area chart: 6-month submission velocity (derived from state)
  const areaCtx = document.getElementById('area-chart');
  if (areaCtx && window.Chart) {
    window._areaChart = new Chart(areaCtx, { type: 'line', ... });
  }

  // Donut chart: approved / submitted / draft counts
  const donutCtx = document.getElementById('donut-chart');
  if (donutCtx && window.Chart) {
    window._donutChart = new Chart(donutCtx, { type: 'doughnut', ... });
  }
}
```

### 5. Goal Management (`src/pages/GoalManagement.js`)

Layout unchanged (grid-60-40). HTML rewritten for premium aesthetics:
- Form card: labelled inputs with `.form-label` + `.form-control`, styled submit button
- Sticky side panel: goal table with weight total badge, submit button
- Workbench checklist: three `.check-item` rows with conditional tick/cross icons
- All `window.addGoal`, `window.removeGoal`, `window.submitUserSheet` handlers preserved

### 6. Manager Review (`src/pages/ManagerReview.js`)

- Employee profile card: avatar (ui-avatars.com), name, role, team, status badge
- Goal table: editable target/weight inputs, `window.updateManagerEdit` preserved
- Decision matrix card: feedback textarea, approve/return buttons, `window.handleApproval` / `window.handleReturn` preserved
- Empty state: "All caught up!" card when no submitted sheets

### 7. Reports (`src/pages/Reports.js`)

- Filter bar card: search input, role dropdown, date picker
- Audit table: Timestamp, User, Role, Action, Field, Reason columns
- Live indicator: animated green dot + "LIVE" label
- Export buttons: "Export CSV", "Generate Report" in page header
- `window.handleAuditSearch` / `window.handleAuditFilter` preserved

### 8. Quarterly Review (`src/pages/QuarterlyReview.js`)

- Overall score card in page header (large bold percentage)
- Phase banner: info (active) or warning (read-only)
- Goals table: Objective, Target, Achievement input, Progress bar, Status badge
- `window.handleAchievementUpdate` preserved

### 9. Admin Settings (`src/pages/AdminSettings.js`)

- Cycle timeline: horizontal stepper with circular nodes, connector lines, phase labels
- Completion matrix table: employee name, goal count, status badge
- Governance card: audit notice, global reset button, download report button
- `window.pushSharedGoal`, `window.resetAllSheets`, `window.setSystemCycle` preserved

### 10. Org Tree (`src/pages/OrgTree.js`)

- Node cards: avatar (ui-avatars.com), name, role badge, dept badge, team badge
- Connector lines: CSS pseudo-elements (existing `.org-children::before` pattern extended)
- Hover lift effect: `translateY(-4px)` + elevated shadow
- Horizontally scrollable container with `#F8FAFC` background
- `buildTree()` recursive logic preserved

---

## Data Models

No new data models are introduced. The redesign reads from the existing state shape:

```typescript
// Existing state (read-only from design perspective)
interface State {
  currentUser: { id: string; name: string; role: string; dept: string };
  system: { currentCycle: string; cycleLocked: boolean };
  employees: Employee[];
  goalSheets: GoalSheet[];
  sharedGoalsRegistry: Record<string, SharedGoal>;
  auditLogs: AuditLog[];
}
```

### Derived Display Data (computed in page render functions)

| Page | Derived Values |
|------|---------------|
| AdminDashboard | `totalEmployees`, `submitted`, `approved`, `pending`, `overdue` (from goalSheets + employees) |
| AdminDashboard | `auditLogs.slice(0,5)` for Activity Log |
| AdminDashboard | `[approved, submitted, overdue]` counts for Donut chart segments |
| AdminDashboard | Static 6-month labels with mock trend data for Area chart |
| GoalManagement | `totalWeight`, `isValid`, `isLocked` (from userSheet) |
| QuarterlyReview | `totalWeightedProgress` (from calculateProgressScore per goal) |

### Static Mock Data (Schedule Widget)

```js
// Defined as a module-level constant in AdminDashboard.js
const SCHEDULE_EVENTS = [
  { date: 'Mon 14', title: 'Goal Setting Deadline', tag: 'Deadline', avatars: ['JS', 'AC'] },
  { date: 'Wed 16', title: 'Q1 Review Kickoff',     tag: 'Meeting',  avatars: ['SM', 'JS', 'AC'] },
  { date: 'Fri 18', title: 'Manager Approvals Due', tag: 'Action',   avatars: ['JS'] },
];
```

### Chart Data Shape

**Area Chart** (Submission Velocity):
```js
{
  labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    { label: 'Submissions', data: [2, 5, 3, 8, 6, submitted], fill: true, ... },
    { label: 'Approvals',   data: [1, 3, 2, 6, 4, approved],  fill: true, ... },
  ]
}
```

**Donut Chart** (Goal Sheet Distribution):
```js
{
  labels: ['Approved', 'Submitted', 'Draft/Overdue'],
  datasets: [{ data: [approved, submitted, overdue], backgroundColor: [...] }]
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Stat card KPI values are consistent with state

*For any* application state containing a `goalSheets` array, an `employees` array, and an `auditLogs` array, the four numeric values rendered in the Gradient_Stat_Cards (overdue/draft count, pending approval count, verified approved count, total audit events count) SHALL equal the values computed directly from those arrays in that same state snapshot.

**Validates: Requirements 4.1, 4.2**

---

### Property 2: Donut chart segment values sum to total goal sheet count

*For any* `goalSheets` array, the three Donut_Chart segment values (approved count + submitted count + draft/overdue count) SHALL sum to exactly `goalSheets.length`.

**Validates: Requirements 4.4, 11.3**

---

### Property 3: Activity log renders exactly the five most recent entries

*For any* `auditLogs` array of length ≥ 5, the Activity_Log panel SHALL render exactly 5 items, and those items SHALL correspond to `auditLogs.slice(0, 5)` — the five most recently prepended entries.

**Validates: Requirements 4.6**

---

### Property 4: Weight indicator colour is consistent with validity

*For any* array of goals, the weight total indicator colour in the GoalManagement page SHALL be `var(--success)` if and only if the sum of all goal weights equals exactly 100; otherwise it SHALL be `var(--danger)`.

**Validates: Requirements 5.3, 6.4**

---

### Property 5: Chart instance destroy-before-recreate invariant

*For any* sequence of N navigations (N ≥ 2) that includes the AdminDashboard page, the Chart.js `destroy()` method SHALL be called on the previous chart instance before a new instance is created, ensuring no more than one instance per canvas exists at any time.

**Validates: Requirements 11.4**

---

### Property 6: Filtered audit log is a subset of the full audit log

*For any* `auditLogs` array and any combination of `auditFilterRole` and `auditSearchQuery` filter values, every entry displayed in the Reports table SHALL be present in the full `auditLogs` array, and every entry in `auditLogs` that satisfies both filter conditions SHALL appear in the displayed table.

**Validates: Requirements 7.3**

---

### Property 7: Alert banner visibility is consistent with overdue count

*For any* application state, the overdue alert banner SHALL be present in the AdminDashboard HTML if and only if the computed overdue count (goal sheets with Draft status) is greater than zero.

**Validates: Requirements 4.8**

---

### Property 8: Form locked state matches goal sheet submission status

*For any* goal sheet, the GoalManagement form SHALL render with `pointer-events: none` (locked) if and only if the sheet's status is `Submitted` or `Approved`; for any other status the form SHALL be interactive.

**Validates: Requirements 5.5**

---

## Error Handling

### Chart.js Load Failure

If `window.Chart` is undefined when `initDashboardCharts()` is called (CDN failed to load), the function exits early and the canvas elements remain visible as empty placeholders. The page header, stat cards, schedule widget, and activity log are unaffected.

```js
function initDashboardCharts() {
  if (!window.Chart) {
    console.warn('Chart.js not loaded — skipping chart initialisation');
    return;
  }
  // ... chart creation
}
```

### Canvas Already In Use

Prevented by always calling `.destroy()` on `window._areaChart` and `window._donutChart` before creating new instances. The destroy calls are guarded with null checks.

### Missing DOM Elements

All `document.getElementById()` calls for chart canvases are null-checked before use. If the element is not found (e.g., navigated away before `requestAnimationFrame` fires), the chart is not created.

### Empty State Handling

- **ManagerReview**: If no submitted sheets exist, renders the "All caught up!" empty state card.
- **QuarterlyReview**: If no goals exist for the current user, renders the empty state with a CTA to Goal Management.
- **ActivityLog**: If `auditLogs` is empty, renders a "No activity yet" placeholder row.
- **GoalManagement**: If `goals` array is empty, renders the "Your goal sheet is empty" placeholder.

### State Mutation Safety

All page render functions are pure with respect to state — they call `getState()` and return an HTML string without calling `setState()`. Side effects (setState calls) only occur inside `window.*` event handlers, which are triggered by user interaction after the DOM is rendered.

---

## Testing Strategy

### Assessment: PBT Applicability

This feature is primarily a **UI rendering redesign**. The majority of acceptance criteria describe visual layout, CSS styling, and HTML structure — areas where property-based testing is not appropriate. However, several criteria involve **pure data transformation logic** (KPI computation, chart data derivation, filter logic, weight validation) that are amenable to property-based testing.

PBT IS applicable for:
- KPI value consistency (stat cards vs. state)
- Chart segment sum invariant
- Activity log slice correctness
- Weight indicator colour logic
- Audit log filter correctness

PBT IS NOT applicable for:
- CSS styling and visual appearance
- HTML structure and layout
- Chart.js rendering output
- Responsive breakpoint behaviour
- Hover/transition effects

### Unit Tests

Unit tests should cover specific examples and edge cases:

1. **`statCard()` helper** — given known state, verify the four KPI values match expected counts
2. **`initDashboardCharts()`** — mock `window.Chart`; verify destroy is called before create on second navigation
3. **`initDashboardCharts()` with no Chart.js** — verify graceful no-op when `window.Chart` is undefined
4. **Weight indicator colour** — `totalWeight === 100` → success colour; `totalWeight !== 100` → danger colour
5. **Activity log slice** — `auditLogs` of length 10 → renders exactly 5 items
6. **Audit filter** — given logs with mixed roles, filter by role returns only matching entries
7. **Donut chart data** — approved + submitted + overdue === total goalSheets.length
8. **Schedule widget** — renders exactly 3 event blocks from `SCHEDULE_EVENTS` constant
9. **Empty state rendering** — ManagerReview with no submitted sheets renders "All caught up!" heading
10. **Locked form state** — GoalManagement with `status === 'Submitted'` renders form with `pointer-events:none`

### Property-Based Tests

Using a property-based testing library (e.g., **fast-check** for JavaScript):

Each property test runs a minimum of **100 iterations**.

**Tag format**: `Feature: premium-saas-redesign, Property {N}: {property_text}`

**Property 1** — Stat card KPI consistency:
```js
// Feature: premium-saas-redesign, Property 1: stat card values match state
fc.assert(fc.property(
  arbitraryState(),
  (state) => {
    const html = renderAdminDashboard(state);
    const { approved, submitted, overdue } = computeKPIs(state);
    expect(extractStatValue(html, 'Verified Approved')).toBe(approved);
    expect(extractStatValue(html, 'Pending Approval')).toBe(submitted);
    expect(extractStatValue(html, 'Overdue / Draft')).toBe(overdue);
    expect(extractStatValue(html, 'Total Audit Events')).toBe(state.auditLogs.length);
  }
), { numRuns: 100 });
```

**Property 2** — Donut chart segments sum to total:
```js
// Feature: premium-saas-redesign, Property 2: donut segments sum to total
fc.assert(fc.property(
  arbitraryGoalSheets(),
  (goalSheets) => {
    const { approved, submitted, overdue } = computeKPIs({ goalSheets });
    expect(approved + submitted + overdue).toBe(goalSheets.length);
  }
), { numRuns: 100 });
```

**Property 3** — Activity log slice:
```js
// Feature: premium-saas-redesign, Property 3: activity log renders top 5
fc.assert(fc.property(
  fc.array(arbitraryAuditLog(), { minLength: 5, maxLength: 50 }),
  (auditLogs) => {
    const html = renderActivityLog(auditLogs);
    const itemCount = (html.match(/act-log-item/g) || []).length;
    expect(itemCount).toBe(5);
  }
), { numRuns: 100 });
```

**Property 4** — Weight indicator colour:
```js
// Feature: premium-saas-redesign, Property 4: weight colour matches validity
fc.assert(fc.property(
  fc.array(arbitraryGoal(), { minLength: 0, maxLength: 8 }),
  (goals) => {
    const totalWeight = goals.reduce((s, g) => s + g.weight, 0);
    const html = renderWeightIndicator(goals);
    const expectedColor = totalWeight === 100 ? 'var(--success)' : 'var(--danger)';
    expect(html).toContain(expectedColor);
  }
), { numRuns: 100 });
```

**Property 5** — Chart destroy-before-recreate:
```js
// Feature: premium-saas-redesign, Property 5: chart instances destroyed before recreate
fc.assert(fc.property(
  fc.integer({ min: 2, max: 10 }),
  (navigationCount) => {
    const destroyCalls = simulateAdminNavigations(navigationCount);
    // For N navigations to admin, destroy should be called N-1 times
    expect(destroyCalls).toBe(navigationCount - 1);
  }
), { numRuns: 100 });
```

**Property 6** — Filtered audit log is a subset:
```js
// Feature: premium-saas-redesign, Property 6: filtered results are subset of full log
fc.assert(fc.property(
  fc.array(arbitraryAuditLog(), { minLength: 0, maxLength: 100 }),
  fc.string(),
  (auditLogs, searchQuery) => {
    const filtered = filterAuditLogs(auditLogs, 'All', searchQuery);
    filtered.forEach(entry => {
      expect(auditLogs).toContain(entry);
    });
    // Completeness: every matching entry must appear
    const expected = auditLogs.filter(l =>
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.field.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered.length).toBe(expected.length);
  }
), { numRuns: 100 });
```

**Property 7** — Alert banner conditional on overdue count:
```js
// Feature: premium-saas-redesign, Property 7: alert banner present iff overdue > 0
fc.assert(fc.property(
  arbitraryState(),
  (state) => {
    const { overdue } = computeKPIs(state);
    const html = renderAdminDashboard(state);
    const hasBanner = html.includes('alert-danger') && html.includes('Run Escalation');
    expect(hasBanner).toBe(overdue > 0);
  }
), { numRuns: 100 });
```

**Property 8** — Form locked state matches sheet status:
```js
// Feature: premium-saas-redesign, Property 8: form locked iff status is Submitted or Approved
fc.assert(fc.property(
  arbitraryGoalSheet(),
  (sheet) => {
    const isLocked = sheet.status === 'Submitted' || sheet.status === 'Approved';
    const html = renderGoalManagementForm(sheet);
    const hasLock = html.includes('pointer-events:none') || html.includes('pointer-events: none');
    expect(hasLock).toBe(isLocked);
  }
), { numRuns: 100 });
```

### Integration Tests

1. **Full navigation cycle** — navigate to each of the 6 pages in sequence; verify no JS errors and `#main-content` is non-empty after each navigation
2. **Chart.js CDN load** — verify `window.Chart` is defined after page load
3. **Goal CRUD round-trip** — add a goal, verify it appears in the goal sheet panel, remove it, verify it disappears
4. **Submit/approve workflow** — submit a goal sheet, navigate to manager review, approve it, verify status badge updates
