# Implementation Plan: Premium SaaS Redesign

## Overview

Elevate GoalForge's UI to a premium SaaS standard by rewriting the HTML output of all seven page modules, extending the CSS design system, integrating Chart.js via CDN, and adding property-based tests for the eight correctness properties defined in the design document. All business logic in `state.js`, `engine.js`, and `constants.js` is left untouched; all `window.*` handlers are preserved exactly.

## Tasks

- [x] 1. Add Chart.js CDN to `index.html`
  - Insert `<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>` in `<head>` before the module script tag
  - Verify `window.Chart` is defined after page load (manual smoke test or console check)
  - _Requirements: 11.1_

- [x] 2. Extend `src/style.css` with premium design tokens and new component classes
  - [x] 2.1 Append premium shadow scale and gradient tokens to `:root`
    - Add `--shadow-xs`, `--shadow-sm` (the two missing levels alongside existing `--shadow-md` and `--shadow-lg`)
    - Add `--grad-pink`, `--grad-orange`, `--grad-blue`, `--grad-green` gradient tokens
    - Add `--chart-primary`, `--chart-secondary`, `--chart-success`, `--chart-danger` chart palette tokens
    - Do NOT remove or rename any existing CSS variable or class
    - _Requirements: 1.1, 1.4, 1.5, 1.7_

  - [x] 2.2 Add schedule widget component classes
    - Add `.schedule-widget`, `.sched-col`, `.sched-event`, `.avatar-stack` classes
    - _Requirements: 4.5_

  - [x] 2.3 Add activity log and chart container classes
    - Add `.act-log-item` class for the redesigned activity log rows
    - Add `.chart-container` wrapper class with a fixed height (e.g., `height: 260px`) for Chart.js canvases
    - Add `.donut-center-label` with `position: absolute` for the donut chart center text
    - _Requirements: 4.6, 11.2, 11.3_

  - [x] 2.4 Add responsive overrides
    - At `max-width: 1280px`: collapse `.stat-grid` to `grid-template-columns: repeat(2, 1fr)`
    - At `max-width: 768px`: collapse `.grid-60-40` to `grid-template-columns: 1fr`
    - At `max-width: 1024px`: hide `.sidebar` by default; add `.sidebar-open` toggle class
    - _Requirements: 1.6, 13.1, 13.2, 13.3_

- [x] 3. Update `src/main.js`: premium shell, chart lifecycle
  - [x] 3.1 Update `buildShell()` to add a bottom user-profile section to the sidebar
    - Append a `.sb-footer` user profile block inside `<aside class="sidebar">` below the nav section
    - Keep all existing `data-page` attributes, `.sb-link` classes, and click handler wiring unchanged
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_

  - [x] 3.2 Add `initDashboardCharts()` function to `src/main.js`
    - Implement the function as specified in the design: destroy existing `window._areaChart` / `window._donutChart` instances before creating new ones
    - Guard all `document.getElementById()` calls with null checks
    - Guard chart creation with `if (window.Chart)` check; log a warning and return early if Chart.js is not loaded
    - Area chart: type `'line'`, 6-month labels `['Feb','Mar','Apr','May','Jun','Jul']`, two datasets (Submissions, Approvals) derived from state, `fill: true`
    - Donut chart: type `'doughnut'`, three segments (Approved, Submitted, Draft/Overdue) derived from state
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [x] 3.3 Add chart destroy logic in `navigate()`
    - Before setting `area.innerHTML`, destroy `window._areaChart` and `window._donutChart` if they exist
    - After setting `innerHTML` for `pageId === 'admin'`, call `requestAnimationFrame(() => initDashboardCharts())`
    - _Requirements: 11.4_

- [x] 4. Rewrite `src/pages/AdminDashboard.js`
  - [x] 4.1 Implement gradient stat cards with KPI values
    - Render four `GradientStatCard` elements in `.stat-grid` using the `statCard()` helper
    - KPI values: `overdue` (pink), `submitted` (orange), `approved` (blue), `auditLogs.length` (green)
    - Each card includes icon, label, numeric value, `Trend_Badge`, and date line
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Add conditional overdue alert banner
    - Render `.alert-banner.alert-danger` with "Run Escalation" button only when `overdue > 0`
    - Preserve existing `onclick="alert('Escalation emails sent...')"` handler
    - _Requirements: 4.8_

  - [x] 4.3 Add Area Chart and Donut Chart canvas elements
    - Render `<canvas id="area-chart">` inside a `.chart-container` card (left column of `grid-60-40`)
    - Render `<canvas id="donut-chart">` inside a `.chart-container` card with `.donut-center-label` overlay (right column)
    - Include card headers with section titles and legend labels
    - _Requirements: 4.3, 4.4, 11.2, 11.3_

  - [x] 4.4 Add Schedule Widget with static mock data
    - Define `SCHEDULE_EVENTS` constant (3 hardcoded events as specified in design)
    - Render `.schedule-widget` with `.sched-col` date columns and `.sched-event` blocks
    - Include `.avatar-stack` with initials circles for each event
    - _Requirements: 4.5_

  - [x] 4.5 Add Activity Log panel
    - Read `auditLogs.slice(0, 5)` from state
    - Render each entry as `.act-log-item` with avatar initials circle, user name, action text, and timestamp
    - Render "No activity yet" placeholder row when `auditLogs` is empty
    - _Requirements: 4.6_

  - [ ]* 4.6 Write property test for stat card KPI consistency (Property 1)
    - **Property 1: Stat card KPI values are consistent with state**
    - **Validates: Requirements 4.1, 4.2**
    - Use `fc.assert` with `arbitraryState()` generating random `goalSheets`, `employees`, `auditLogs`
    - Extract stat values from rendered HTML and compare to `computeKPIs(state)` output
    - Tag: `Feature: premium-saas-redesign, Property 1`

  - [ ]* 4.7 Write property test for donut chart segment sum (Property 2)
    - **Property 2: Donut chart segment values sum to total goal sheet count**
    - **Validates: Requirements 4.4, 11.3**
    - Use `fc.assert` with `arbitraryGoalSheets()` and verify `approved + submitted + overdue === goalSheets.length`
    - Tag: `Feature: premium-saas-redesign, Property 2`

  - [ ]* 4.8 Write property test for activity log slice (Property 3)
    - **Property 3: Activity log renders exactly the five most recent entries**
    - **Validates: Requirements 4.6**
    - Use `fc.assert` with `fc.array(arbitraryAuditLog(), { minLength: 5, maxLength: 50 })`
    - Count `.act-log-item` occurrences in rendered HTML and assert count equals 5
    - Tag: `Feature: premium-saas-redesign, Property 3`

  - [ ]* 4.9 Write property test for alert banner visibility (Property 7)
    - **Property 7: Alert banner visibility is consistent with overdue count**
    - **Validates: Requirements 4.8**
    - Use `fc.assert` with `arbitraryState()` and verify banner presence matches `overdue > 0`
    - Tag: `Feature: premium-saas-redesign, Property 7`

- [ ] 5. Checkpoint — verify AdminDashboard renders without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Rewrite `src/pages/GoalManagement.js`
  - [x] 6.1 Rewrite goal creation form card with premium styling
    - Apply `.form-label` + `.form-control` to all inputs; style submit button with `.btn.btn-primary.w-full`
    - Render form with `style="opacity:0.5;pointer-events:none;"` when `isLocked` is true
    - Preserve `onsubmit="window.addGoal(event)"` and all field IDs (`gf-title`, `gf-area`, `gf-weight`, `gf-target`, `gf-uom`, `gf-rationale`)
    - _Requirements: 5.1, 5.5, 5.6_

  - [x] 6.2 Rewrite sticky goal sheet side panel
    - Apply `position: sticky; top: 80px` to the panel card
    - Render weight total indicator with `color: var(--success)` when `totalWeight === 100`, else `var(--danger)`
    - "Submit to Review" button shows "SUBMITTED" text and is disabled when `isLocked`
    - Preserve `onclick="window.submitUserSheet('${currentUser.id}')"` and `onclick="window.removeGoal(...)"` handlers
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

  - [x] 6.3 Rewrite Workbench Checklist card
    - Render three `.check-item` rows using the `checkItem()` helper with green tick / red indicator
    - _Requirements: 5.4_

  - [ ]* 6.4 Write property test for weight indicator colour (Property 4)
    - **Property 4: Weight indicator colour is consistent with validity**
    - **Validates: Requirements 5.3, 6.4**
    - Use `fc.assert` with `fc.array(arbitraryGoal(), { minLength: 0, maxLength: 8 })`
    - Verify rendered HTML contains `var(--success)` iff `totalWeight === 100`, else `var(--danger)`
    - Tag: `Feature: premium-saas-redesign, Property 4`

  - [ ]* 6.5 Write property test for form locked state (Property 8)
    - **Property 8: Form locked state matches goal sheet submission status**
    - **Validates: Requirements 5.5**
    - Use `fc.assert` with `arbitraryGoalSheet()` generating sheets with random status values
    - Verify `pointer-events:none` present iff `status === 'Submitted' || status === 'Approved'`
    - Tag: `Feature: premium-saas-redesign, Property 8`

- [x] 7. Rewrite `src/pages/ManagerReview.js`
  - [x] 7.1 Rewrite employee profile card
    - Render avatar (`ui-avatars.com`), name, role, team, and status badge in a `.card.card-p` with flex layout
    - _Requirements: 6.1_

  - [x] 7.2 Rewrite editable goal table
    - Apply `.tbl` premium table styles; keep editable `<input>` fields for target and weight
    - Preserve all `onchange="window.updateManagerEdit(...)"` handlers
    - _Requirements: 6.2, 6.5_

  - [x] 7.3 Rewrite Decision Matrix card
    - Render feedback `<textarea>`, approve button (`.btn.btn-success`), return button (`.btn.btn-danger-o`)
    - Disable approve button and show validation error banner when `totalWeight !== 100`
    - Preserve `window.handleApproval()` and `window.handleReturn()` onclick handlers
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 7.4 Verify empty state card
    - Confirm "All caught up!" empty state renders correctly when no submitted sheets exist
    - _Requirements: 6.6_

- [x] 8. Rewrite `src/pages/Reports.js`
  - [x] 8.1 Rewrite filter bar card
    - Render search input, role dropdown, and date picker in a `.card.card-p` flex row
    - Preserve `oninput="window.handleAuditSearch(this.value)"` and `onchange="window.handleAuditFilter(this.value)"`
    - _Requirements: 7.1, 7.6_

  - [x] 8.2 Rewrite audit log table with live indicator
    - Apply `.tbl` styles with Timestamp, User, Role, Action, Field/Target, Reason columns
    - Add animated `.live-dot` + "LIVE" label in the table card header
    - _Requirements: 7.2, 7.4_

  - [x] 8.3 Add export buttons to page header
    - Render "Export CSV" (`.btn.btn-ghost.btn-sm`) and "Generate Report" (`.btn.btn-primary.btn-sm`) in the page header
    - _Requirements: 7.5_

  - [ ]* 8.4 Write property test for filtered audit log subset (Property 6)
    - **Property 6: Filtered audit log is a subset of the full audit log**
    - **Validates: Requirements 7.3**
    - Use `fc.assert` with `fc.array(arbitraryAuditLog(), { minLength: 0, maxLength: 100 })` and `fc.string()` for search query
    - Extract `filterAuditLogs()` as a pure function from `Reports.js` and test it directly
    - Verify every filtered entry exists in the original array, and every matching entry appears in filtered results
    - Tag: `Feature: premium-saas-redesign, Property 6`

- [-] 9. Rewrite `src/pages/QuarterlyReview.js`
  - [x] 9.1 Add overall score card to page header
    - Render a `.card` score chip in the page header right side with `totalWeightedProgress.toFixed(1)%` in large bold primary colour
    - _Requirements: 8.1_

  - [x] 9.2 Rewrite phase banner
    - Render `.alert-banner.alert-info` when active, `.alert-banner.alert-warning` when read-only/locked
    - _Requirements: 8.2_

  - [x] 9.3 Rewrite goals progress table
    - Apply `.tbl` styles with Objective/KPI, Planned Target, Actual Achievement (editable input), Progress % (with `.progress-bar-fill`), and Status badge columns
    - Disable achievement inputs when `isReadOnly`; disable "Submit Quarterly Review" button with reduced opacity
    - Preserve `onchange="window.handleAchievementUpdate(...)"` handler
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ] 9.4 Verify empty state panel
    - Confirm empty state with "Go to Goal Builder" CTA renders when no goals exist
    - _Requirements: 8.6_

- [ ] 10. Rewrite `src/pages/AdminSettings.js`
  - [ ] 10.1 Rewrite cycle timeline as horizontal stepper
    - Render circular `.cycle-node` elements with connector lines between them
    - Apply `.done` (filled success), `.active` (outlined with glow), `.upcoming` (muted) classes based on `currentIdx`
    - Preserve `onclick="window.setSystemCycle('${p.id}')"` on each node
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

  - [ ] 10.2 Rewrite Completion Status Matrix table
    - Apply `.tbl` styles with Employee, Goal Sheet (goal count), Status badge columns
    - _Requirements: 9.4_

  - [ ] 10.3 Rewrite System Governance card
    - Render `.alert-banner.alert-info` audit notice, "Global Reset" button (`.btn.btn-danger-o`), "Download Governance Report" button (`.btn.btn-ghost`)
    - Preserve `window.resetAllSheets()` and `window.pushSharedGoal()` handlers
    - _Requirements: 9.5, 9.6_

- [ ] 11. Rewrite `src/pages/OrgTree.js`
  - [ ] 11.1 Rewrite node cards with premium styling
    - Render avatar (`ui-avatars.com`), name, role badge (`.badge.badge-primary`), dept badge (`.badge.badge-neutral`), team badge (`.badge.badge-neutral`) in each `.org-node` card
    - _Requirements: 10.1_

  - [ ] 11.2 Add hover lift effect and connector line styles
    - Ensure `.org-node:hover` applies `transform: translateY(-4px)` and elevated `box-shadow` (already in CSS; verify it applies correctly to new card structure)
    - Verify `.org-children::before` connector pseudo-element renders vertical lines between parent and children
    - _Requirements: 10.2, 10.3_

  - [ ] 11.3 Verify horizontally scrollable container
    - Confirm `.org-tree-container` has `overflow: auto`, `background: #F8FAFC`, and sufficient padding
    - Preserve `buildTree()` recursive logic and all employee data from state
    - _Requirements: 10.4, 10.5_

- [ ] 12. Set up fast-check and write property-based tests
  - [ ] 12.1 Install fast-check and configure test runner
    - Install `fast-check` as a dev dependency: `npm install --save-dev fast-check vitest`
    - Add `"test": "vitest --run"` script to `package.json`
    - Create `src/__tests__/` directory and a `premium-saas-redesign.test.js` file
    - _Requirements: 11.1 (test infrastructure)_

  - [ ]* 12.2 Write Property 1 test — stat card KPI consistency
    - Implement `arbitraryState()` arbitrary using `fc.record` with `fc.array` for `goalSheets`, `employees`, `auditLogs`
    - Implement `computeKPIs(state)` helper that computes `approved`, `submitted`, `overdue` counts
    - Assert extracted stat values from rendered HTML match `computeKPIs` output for 100 runs
    - **Property 1: Stat card KPI values are consistent with state**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 12.3 Write Property 2 test — donut segment sum
    - Implement `arbitraryGoalSheets()` arbitrary
    - Assert `approved + submitted + overdue === goalSheets.length` for 100 runs
    - **Property 2: Donut chart segment values sum to total goal sheet count**
    - **Validates: Requirements 4.4, 11.3**

  - [ ]* 12.4 Write Property 3 test — activity log slice
    - Assert rendered activity log HTML contains exactly 5 `.act-log-item` occurrences for any `auditLogs` array of length ≥ 5
    - **Property 3: Activity log renders exactly the five most recent entries**
    - **Validates: Requirements 4.6**

  - [ ]* 12.5 Write Property 4 test — weight indicator colour
    - Implement `arbitraryGoal()` arbitrary with `fc.record({ weight: fc.integer({ min: 0, max: 40 }) })`
    - Assert colour token matches validity for 100 runs
    - **Property 4: Weight indicator colour is consistent with validity**
    - **Validates: Requirements 5.3, 6.4**

  - [ ]* 12.6 Write Property 5 test — chart destroy-before-recreate
    - Mock `window.Chart` with a spy; simulate N navigations to admin page
    - Assert `destroy()` is called exactly N-1 times for N ≥ 2 navigations
    - **Property 5: Chart instance destroy-before-recreate invariant**
    - **Validates: Requirements 11.4**

  - [ ]* 12.7 Write Property 6 test — filtered audit log subset
    - Extract `filterAuditLogs(logs, role, query)` as a pure function from `Reports.js`
    - Assert every filtered entry is in the original array and every matching entry appears in results
    - **Property 6: Filtered audit log is a subset of the full audit log**
    - **Validates: Requirements 7.3**

  - [ ]* 12.8 Write Property 7 test — alert banner conditional on overdue
    - Assert banner presence in rendered HTML matches `overdue > 0` for 100 runs
    - **Property 7: Alert banner visibility is consistent with overdue count**
    - **Validates: Requirements 4.8**

  - [ ]* 12.9 Write Property 8 test — form locked state
    - Implement `arbitraryGoalSheet()` arbitrary with `fc.constantFrom('Draft', 'Submitted', 'Approved', 'Returned')`
    - Assert `pointer-events:none` present iff `status === 'Submitted' || status === 'Approved'`
    - **Property 8: Form locked state matches goal sheet submission status**
    - **Validates: Requirements 5.5**

- [ ] 13. Final checkpoint — verify all functionality end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify: navigate to each of the 6 pages, confirm no JS errors, `#main-content` is non-empty
  - Verify Chart.js area chart and donut chart render on AdminDashboard
  - Verify goal CRUD round-trip: add a goal → appears in sheet panel → remove → disappears
  - Verify submit/approve workflow: submit sheet → navigate to manager review → approve → status badge updates
  - Verify audit filter: type in search box → table filters correctly

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- No changes are permitted to `src/store/state.js`, `src/utils/engine.js`, or `src/utils/constants.js`
- All `window.*` handlers must be preserved exactly as they exist today
- CSS changes are strictly additive — no existing class is removed or renamed
- Chart.js is loaded via CDN only; no npm install for Chart.js
- Property tests use fast-check with a minimum of 100 iterations per property
