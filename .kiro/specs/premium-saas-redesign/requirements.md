# Requirements Document

## Introduction

GoalForge is an enterprise performance management SaaS application built with Vanilla JS + Vite. The current application has all core functionality working across seven pages: AdminDashboard, GoalManagement, ManagerReview, Reports (Audit), QuarterlyReview, AdminSettings, and OrgTree.

This feature is a full UI/UX overhaul to elevate GoalForge into a premium, polished SaaS product. The redesign takes visual inspiration from modern HR/Employee management dashboards — clean white cards, gradient stat cards, inline SVG/Chart.js charts, a horizontal schedule widget, an activity log panel, a redesigned sidebar with icons and active states, and premium typography using the Inter font. All existing JavaScript functionality (goal CRUD, submit/approve/return workflow, audit logs, org tree, quarterly review, admin settings) must remain fully intact. No changes are permitted to `src/store/state.js`, `src/utils/engine.js`, or `src/utils/constants.js`.

---

## Glossary

- **App_Shell**: The top-level layout container rendered by `src/main.js`, consisting of the Sidebar and the Main Layout area.
- **Sidebar**: The fixed left navigation panel (`<aside class="sidebar">`).
- **Navbar**: The top horizontal navigation bar rendered inside the Main Layout.
- **Page_Content**: The scrollable content area (`#main-content`) where each page renders its HTML.
- **Stat_Card**: A gradient-background summary card displaying a KPI value, label, trend badge, and icon.
- **Chart_Widget**: An inline SVG or Chart.js canvas element rendering a data visualisation (area chart or donut chart).
- **Schedule_Widget**: A horizontal calendar/timeline panel showing upcoming events with avatar stacks.
- **Activity_Log**: A panel listing recent user actions with avatar initials, name, role, and relative timestamp.
- **Design_System**: The set of CSS custom properties, utility classes, and component styles defined in `src/style.css` and `src/styles/variables.css`.
- **Premium_Aesthetic**: The visual standard defined by the reference image — white card surfaces, soft drop shadows, rounded corners (≥12 px), Inter font, gradient stat cards, and consistent spacing.
- **Gradient_Stat_Card**: A Stat_Card whose background is a soft two-stop CSS gradient (pink, orange, blue/purple, or green/teal variants).
- **Trend_Badge**: A pill-shaped badge inside a Stat_Card showing a directional arrow (↑ or ↓) and a percentage change value.
- **Area_Chart**: A filled line chart rendered via Chart.js (or inline SVG fallback) showing time-series data.
- **Donut_Chart**: A ring/donut chart rendered via Chart.js (or inline SVG fallback) showing proportional data.
- **GoalForge_Engine**: The business logic layer in `src/utils/engine.js` — must not be modified.
- **State_Store**: The pub/sub state module in `src/store/state.js` — must not be modified.
- **Constants**: The constants module in `src/utils/constants.js` — must not be modified.

---

## Requirements

### Requirement 1: Design System Foundation

**User Story:** As a developer, I want a unified premium design system defined in CSS, so that all pages share consistent tokens, spacing, typography, and component styles without duplicating rules.

#### Acceptance Criteria

1. THE Design_System SHALL define CSS custom properties for all colours, spacing, border-radius, shadow, and typography values used across the application.
2. THE Design_System SHALL use the Inter font (loaded via Google Fonts) as the sole typeface for all UI text.
3. THE Design_System SHALL define a base border-radius of at least 12 px for cards and 8 px for smaller elements (inputs, badges, buttons).
4. THE Design_System SHALL define at least four named shadow levels (`--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`) using `rgba(0,0,0,…)` values that produce a soft, layered depth effect.
5. THE Design_System SHALL define gradient background tokens for the four Stat_Card colour variants: pink (`#FFE4E6 → #FECDD3`), orange (`#FFEDD5 → #FED7AA`), blue (`#DBEAFE → #BFDBFE`), and green (`#D1FAE5 → #A7F3D0`).
6. WHEN the viewport width is below 1024 px, THE Design_System SHALL apply responsive overrides that collapse the Sidebar and stack layout columns to a single column.
7. THE Design_System SHALL NOT remove or rename any existing CSS class that is referenced by `src/utils/engine.js`, `src/store/state.js`, or `src/utils/constants.js`.

---

### Requirement 2: Sidebar Redesign

**User Story:** As a user, I want a visually premium sidebar with clear branding, icon-labelled navigation links, and visible active states, so that I can orient myself and navigate confidently.

#### Acceptance Criteria

1. THE Sidebar SHALL display the GoalForge logo mark (a styled `🎯` icon inside a rounded square with the primary brand colour) and the product name "GoalForge" in bold white text.
2. THE Sidebar SHALL display a subtitle tag line (e.g., "Enterprise Governance") in small, muted uppercase text below the product name.
3. THE Sidebar SHALL render each navigation item with an SVG icon (or emoji icon) and a text label, with a minimum tap target of 40 px height.
4. WHEN a navigation item is the currently active page, THE Sidebar SHALL apply a visually distinct active state using a highlighted background and full-opacity white text.
5. WHEN a navigation item is not active, THE Sidebar SHALL render the item in a muted, semi-transparent style that transitions to a brighter state on hover within 150 ms.
6. THE Sidebar SHALL group navigation items under a labelled section heading (e.g., "NAVIGATION") rendered in small uppercase muted text.
7. THE Sidebar SHALL preserve all existing `data-page` attributes and click handlers so that `window.navigate()` continues to function without modification.

---

### Requirement 3: Top Navbar Redesign

**User Story:** As a user, I want a clean, sticky top navbar with a search bar, action buttons, and a user profile chip, so that I can access global actions from any page.

#### Acceptance Criteria

1. THE Navbar SHALL be sticky at the top of the Main Layout with a white background, a 1 px bottom border, and a soft drop shadow.
2. THE Navbar SHALL contain a search input field with a leading search icon, placeholder text, and a rounded pill or rounded-rectangle shape.
3. THE Navbar SHALL display icon buttons for notifications and help on the right side of the search bar.
4. THE Navbar SHALL display a user profile chip containing the user's avatar image (from `ui-avatars.com`), full name, and role label.
5. WHEN the user types in the search input, THE Navbar SHALL call `window.handleSearch()` with the current input value, preserving existing search behaviour.
6. THE Navbar SHALL display a "Filter" button and an "Export CSV" button as styled action buttons matching the Premium_Aesthetic, visible on the AdminDashboard and Reports pages.

---

### Requirement 4: Admin Dashboard Page Redesign

**User Story:** As an admin, I want a premium dashboard with gradient stat cards, charts, a schedule widget, and an activity log, so that I can monitor performance operations at a glance.

#### Acceptance Criteria

1. THE AdminDashboard SHALL render four Gradient_Stat_Cards in a responsive four-column grid, each displaying a KPI label, numeric value, Trend_Badge, and icon.
2. WHEN the `auditLogs` array in the State_Store is updated, THE AdminDashboard SHALL reflect the updated audit log count in the corresponding Stat_Card without a full page reload.
3. THE AdminDashboard SHALL render an Area_Chart widget showing "Submission Velocity" or "Payroll Cost" trend data using Chart.js or inline SVG, with a visible tooltip on hover.
4. THE AdminDashboard SHALL render a Donut_Chart widget showing goal completion distribution (approved vs. submitted vs. draft) with a colour-coded legend.
5. THE AdminDashboard SHALL render a Schedule_Widget displaying at least three upcoming performance cycle events in a horizontal timeline layout with event labels and avatar stacks.
6. THE AdminDashboard SHALL render an Activity_Log panel showing the five most recent audit log entries, each with avatar initials, user name, action description, and a relative or absolute timestamp.
7. THE AdminDashboard SHALL preserve the "Master Unlock" and "Audit History" buttons and their existing `onclick` handlers.
8. IF the `overdue` count is greater than 0, THEN THE AdminDashboard SHALL display an alert banner with a "Run Escalation" button that calls the existing escalation handler.
9. THE AdminDashboard SHALL display a page header with breadcrumb, title ("Governance Control Center"), and subtitle matching the Premium_Aesthetic.

---

### Requirement 5: Goal Management Page Redesign

**User Story:** As an employee, I want a premium goal builder interface with a clean form, a live goal sheet panel, and a workbench checklist, so that I can draft and submit my performance goals efficiently.

#### Acceptance Criteria

1. THE GoalManagement page SHALL render the goal creation form in a card with labelled form fields, styled inputs, a dropdown for Strategic Pillar, and a submit button matching the Premium_Aesthetic.
2. THE GoalManagement page SHALL render the Active Goal Sheet in a sticky side panel card with a table of added goals, a weight total indicator, and a "Submit to Review" button.
3. WHEN the total goal weight equals 100%, THE GoalManagement page SHALL display the weight indicator in the success colour (`var(--success)`); otherwise it SHALL display it in the danger colour (`var(--danger)`).
4. THE GoalManagement page SHALL render the Workbench Checklist card with three validation items, each showing a green tick when the condition is met and a red indicator when it is not.
5. WHEN the goal sheet status is `Submitted` or `Approved`, THE GoalManagement page SHALL render the form in a visually locked state (reduced opacity, pointer-events disabled) and the "Submit to Review" button SHALL display "SUBMITTED".
6. THE GoalManagement page SHALL preserve all existing `window.addGoal()`, `window.removeGoal()`, and `window.submitUserSheet()` handlers without modification.
7. IF the manager has returned the goal sheet with a comment, THEN THE GoalManagement page SHALL display an alert banner showing the manager's comment.

---

### Requirement 6: Manager Review Page Redesign

**User Story:** As a manager, I want a premium review workbench with an employee profile card, an editable goal table, and a decision matrix, so that I can approve or return goal sheets efficiently.

#### Acceptance Criteria

1. THE ManagerReview page SHALL render an employee profile card displaying the employee's avatar, full name, role, team, and current submission status badge.
2. THE ManagerReview page SHALL render the submitted goals in a styled table with editable target and weight inputs, matching the Premium_Aesthetic table style.
3. THE ManagerReview page SHALL render a Decision Matrix card containing a feedback textarea, an "Approve & Lock Goals" button (success style), and a "Return for Rework" button (danger outline style).
4. WHEN the total goal weight is not 100%, THE ManagerReview page SHALL disable the "Approve & Lock Goals" button and display a validation error banner.
5. THE ManagerReview page SHALL preserve all existing `window.updateManagerEdit()`, `window.handleApproval()`, and `window.handleReturn()` handlers without modification.
6. WHEN there are no submitted goal sheets, THE ManagerReview page SHALL display an empty-state card with an illustration, heading "All caught up!", and a descriptive message.

---

### Requirement 7: Reports (Audit Logs) Page Redesign

**User Story:** As an admin, I want a premium audit log page with filter controls, a live-indicator table, and export buttons, so that I can review and export governance records efficiently.

#### Acceptance Criteria

1. THE Reports page SHALL render a filter bar card containing a search input, a role dropdown, and a date picker, all styled to match the Premium_Aesthetic.
2. THE Reports page SHALL render the audit log entries in a styled table with columns for Timestamp, User, Role, Action, Field/Target, and Reason.
3. WHEN the `auditFilterRole` or `auditSearchQuery` window variables change, THE Reports page SHALL re-render the filtered table without losing the filter state.
4. THE Reports page SHALL display a live indicator (animated green dot + "LIVE" label) in the table header to indicate real-time data.
5. THE Reports page SHALL display "Export CSV" and "Generate Report" buttons in the page header that call the existing alert handlers.
6. THE Reports page SHALL preserve all existing `window.handleAuditSearch()` and `window.handleAuditFilter()` handlers without modification.

---

### Requirement 8: Quarterly Review Page Redesign

**User Story:** As an employee, I want a premium quarterly review interface with a progress table, an overall score card, and a phase banner, so that I can update and submit my quarterly achievements clearly.

#### Acceptance Criteria

1. THE QuarterlyReview page SHALL render an overall score card in the page header area displaying the weighted progress percentage in a large, bold typeface with the primary colour.
2. THE QuarterlyReview page SHALL render a phase banner indicating whether the review window is active (info style) or read-only/locked (warning style).
3. THE QuarterlyReview page SHALL render the goals in a styled table with columns for Objective/KPI, Planned Target, Actual Achievement (editable input), Progress % (with progress bar), and Status badge.
4. WHEN the goal sheet is in read-only mode, THE QuarterlyReview page SHALL render the achievement inputs as disabled and the "Submit Quarterly Review" button as disabled with reduced opacity.
5. THE QuarterlyReview page SHALL preserve the existing `window.handleAchievementUpdate()` handler without modification.
6. WHEN no goals exist for the current user, THE QuarterlyReview page SHALL display an empty-state panel with a call-to-action button linking to the Goal Management page.

---

### Requirement 9: Admin Settings Page Redesign

**User Story:** As an admin, I want a premium settings page with a visual cycle timeline, a completion matrix table, and governance controls, so that I can manage the performance cycle and system state efficiently.

#### Acceptance Criteria

1. THE AdminSettings page SHALL render the Enterprise Cycle Timeline as a horizontal stepper with circular nodes, connector lines, and labels for each phase (Goal Setting, Q1–Q4).
2. WHEN a cycle node is clicked, THE AdminSettings page SHALL call `window.setSystemCycle()` with the corresponding cycle ID, preserving existing behaviour.
3. THE AdminSettings page SHALL visually distinguish completed phases (filled success colour), the active phase (outlined success colour with glow), and upcoming phases (muted style).
4. THE AdminSettings page SHALL render the Completion Status Matrix as a styled table showing each employee's name, goal count, and status badge.
5. THE AdminSettings page SHALL render the System Governance card with the immutable audit logging notice, the "Global Reset" button (danger outline), and the "Download Governance Report" button.
6. THE AdminSettings page SHALL preserve all existing `window.pushSharedGoal()`, `window.resetAllSheets()`, and `window.setSystemCycle()` handlers without modification.

---

### Requirement 10: Org Tree Page Redesign

**User Story:** As an admin, I want a premium org tree visualisation with styled node cards, connector lines, and role/department badges, so that I can understand the reporting hierarchy at a glance.

#### Acceptance Criteria

1. THE OrgTree page SHALL render each employee as a node card displaying the employee's avatar, full name, role badge, department badge, and team badge.
2. THE OrgTree page SHALL render vertical and horizontal connector lines between parent and child nodes to represent the reporting hierarchy.
3. WHEN a node card is hovered, THE OrgTree page SHALL apply a lift effect (translateY(-4px) and an elevated box shadow) within 200 ms.
4. THE OrgTree page SHALL render the tree in a horizontally scrollable container with a light background (`#F8FAFC`) and sufficient padding.
5. THE OrgTree page SHALL preserve the existing `buildTree()` recursive logic and render all employees from the State_Store without modification to the data layer.

---

### Requirement 11: Chart Integration

**User Story:** As a developer, I want Chart.js integrated for the dashboard charts, so that the area chart and donut chart render correctly with real data and tooltips.

#### Acceptance Criteria

1. THE App_Shell SHALL load Chart.js from a CDN or as an npm dependency before any page renders a Chart_Widget.
2. WHEN the AdminDashboard renders the Area_Chart, THE Chart_Widget SHALL display a smooth filled area line using data derived from the State_Store (e.g., monthly submission counts or audit log counts).
3. WHEN the AdminDashboard renders the Donut_Chart, THE Chart_Widget SHALL display segments for approved, submitted, and draft goal sheet counts with matching legend labels.
4. WHEN a Chart_Widget is destroyed and re-rendered (e.g., on navigation away and back), THE Chart_Widget SHALL destroy the previous Chart.js instance to prevent canvas reuse errors.
5. IF Chart.js fails to load, THEN THE App_Shell SHALL fall back to rendering the inline SVG placeholder charts that were present in the original AdminDashboard.

---

### Requirement 12: Functional Preservation

**User Story:** As a product owner, I want all existing business logic and user workflows to remain fully functional after the redesign, so that no regression is introduced.

#### Acceptance Criteria

1. THE App_Shell SHALL NOT modify, remove, or re-export any symbol from `src/store/state.js`, `src/utils/engine.js`, or `src/utils/constants.js`.
2. WHEN a user navigates between pages using the Sidebar links, THE App_Shell SHALL call `window.navigate()` with the correct page ID, rendering the correct page component.
3. WHEN the system cycle is `GOAL_SETTING`, THE App_Shell SHALL render `renderGoalManagement()` for the "goals" route; WHEN the cycle is any quarterly phase, THE App_Shell SHALL render `renderQuarterlyReview()` for the "goals" route.
4. THE GoalManagement page SHALL correctly call `window.addGoal()`, `window.removeGoal()`, and `window.submitUserSheet()` so that goal CRUD operations update the State_Store and re-render the page.
5. THE ManagerReview page SHALL correctly call `window.handleApproval()` and `window.handleReturn()` so that the approve/return workflow updates the State_Store and re-renders the page.
6. THE AdminSettings page SHALL correctly call `window.resetAllSheets()` and `window.pushSharedGoal()` so that global admin operations update the State_Store.
7. THE Reports page SHALL correctly call `window.handleAuditSearch()` and `window.handleAuditFilter()` so that filtering updates the displayed audit log entries.
8. WHEN `setState()` is called from any page handler, THE App_Shell SHALL re-render the current page to reflect the updated state.

---

### Requirement 13: Responsive Layout

**User Story:** As a user on a smaller screen, I want the application layout to adapt gracefully, so that I can use all features without horizontal overflow or broken layouts.

#### Acceptance Criteria

1. WHEN the viewport width is below 1280 px, THE Design_System SHALL collapse the four-column Stat_Card grid to a two-column grid.
2. WHEN the viewport width is below 768 px, THE Design_System SHALL collapse the two-column `grid-60-40` layout to a single column.
3. WHEN the viewport width is below 1024 px, THE Sidebar SHALL be hidden by default and accessible via a hamburger toggle button in the Navbar.
4. THE App_Shell SHALL NOT introduce horizontal scroll on the body element at any viewport width above 320 px.
5. ALL form controls, buttons, and table cells SHALL remain legible and tappable (minimum 44 px touch target height) at viewport widths down to 375 px.
