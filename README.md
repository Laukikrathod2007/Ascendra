# 🏛️ ASCENDRA — Enterprise Execution Governance Platform

<p align="center">
  <img src="public/favicon.svg" width="100" height="100" alt="Ascendra Logo" />
</p>

<h3 align="center">
  <strong>Fortune 500 Performance Observability & Execution Governance Cockpit</strong>
</h3>

<p align="center">
  Ascendra is a premium enterprise intelligence system engineered for leadership teams to govern quarterly strategic execution, automate compliance checks, and trace workflow lifecycles across complex corporate hierarchies.
</p>

<p align="center">
  <a href="https://ascendra-xi.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-ascendra--xi.vercel.app-6366F1?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/Laukikrathod2007/Ascendra">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Vanilla_JS_ES6-F7DF1E?style=flat-square&logo=javascript" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Bundler-Vite_8.0-6366F1?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Styling-Custom_HSL_CSS-1572B6?style=flat-square&logo=css3" alt="CSS3" />
  <img src="https://img.shields.io/badge/Telemetry-Chart.js-FF6384?style=flat-square&logo=chartdotjs" alt="Chart.js" />
  <img src="https://img.shields.io/badge/Persistence-LocalStorage-007396?style=flat-square" alt="LocalStorage" />
</p>

---

## 🎯 The Pitch: The Executive Execution Problem

Enterprise strategic planning is **broken**. Most Fortune 500 companies attempt to manage key quarterly goals using fragmented spreadsheets, template-like HR tools, or static checklists. This leads to critical failure points:
*   **Zero Observability:** Leadership has no real-time alignment mapping or telemetry tracking.
*   **Governance Drift:** Employees submit misaligned targets, bypass approval protocols, or modify locked goals post-audit.
*   **Leader Burnout:** Mid-level managers are overwhelmed by manual reviews, target overlaps, and disjointed comment histories.

### 💡 The Ascendra Solution
Ascendra transforms static goal setting into a **dynamic compliance observability engine**. By integrating live telemetry, structured mathematical constraints, dynamic reporting trees, and automated smart checks, it secures corporate alignment while delivering premium, glassmorphic visual aesthetics designed for the C-Suite.

---

## 💎 Core Architecture & Design Masterpieces

### 1. Dynamic Workspace Role Switcher
*   **Dynamically Swapped Contexts:** Swap between `EMPLOYEE`, `MANAGER`, and `ADMIN` roles instantly via the sidebar's visual scope dropdown.
*   **Role-Specific Navigation & Privileges:** Navbars, action triggers, edit boundaries, and dashboard panels adapt in real-time, allowing users to demo the entire enterprise workflow loop from a single interface.

### 2. Live Organization Hierarchy Map (`OrgTree.js`)
*   **Visual reporting Lines:** Renders reporting structures using dynamic hierarchical connector lines.
*   **Progress Overlays:** Maps subordinate department badges, team names, goal tallies, and color-coded progress bars calculated directly from live achievements.
*   **Profile Side Drawer:** Click any reporting card to slide out a side drawer showing audit actions and specific goal histories.

### 3. Strict Goal Lifecycle Governance (`GoalManagement.js` / `ManagerReview.js`)
*   **Mathematical Sum checks:** Restricts submissions by checking that active goals sum up to exactly **100% total weight**, enforcing corporate compliance.
*   **Multi-Stage Lifecycle Actions:** Supports drafting, target directions (`↑ Higher is better` or `↓ Lower is better`), submissions, manager comments, final approvals, and returned rework triggers.
*   **Form Locks:** Grey-out layers and disabled inputs block actions once a sheet is submitted or approved, preserving the integrity of the data.

### 4. Smart Compliance Intervention Queue (`SmartQueue.js` / `HealthInspector.js`)
Ascendra processes store data through **five automated compliance checks** to preemptively spot bottlenecks:
1.  **Overdue Metrics:** Flags achievements falling below target with no edits in 45+ days.
2.  **Leader Overload:** Alerts administrators when a manager has 3+ subordinate sheets pending review.
3.  **Shared Target Conflicts:** Scans for shared corporate KPIs where employees hold conflicting targets.
4.  **Returned Rework logs:** Tracks sheets sent back to draft by managers for clear observability.
5.  **Post-Lock Updates:** Highlights modifications made after cycle locking.

### 5. C-Suite Execution Cockpit & Tracing (`AdminDashboard.js` / `Tracing.js`)
*   **Chart.js Integrations:** Beautiful, responsive trend lines displaying completion ratios, at-risk percentages, and escalation logs.
*   **Contribution Breakdowns:** Dynamic donut charts displaying execution distributions.
*   **Audit Trail logs:** An advanced chronological log viewer with search and role-filtering, auditing over 220+ programmatic actions.

---

## 🛠️ The Tech Stack & Hackathon Engineering Decisions

*   **Ultra-Fast SPA Architecture:** Written in Vanilla JS (ES Modules) and semantic HTML5. Navigation uses a highly-optimized state swaps mechanism (`window.navigate`), eliminating page-reload visual flicker and making the application compatible with any standard static host.
*   **Vite 8.x Bundler:** Serves rapid Hot Module Replacement (HMR) during sandbox runs and outputs highly-optimized production builds under 166 milliseconds.
*   **Reactive local State & localStorage Persistence:** Built around a single reactive state store (`src/store/state.js`). Every edit, review comment, and role swap is safely saved to the user's browser `localStorage` (`ascendra_state_v1`). This guarantees that your demo modifications remain safe and fully intact without relying on a database.
*   **Glassmorphic Design Tokens:** The visual framework utilizes HSL color palettes, custom shadows (`var(--shadow-md)`), and responsive hover transitions to deliver a premium enterprise visual aesthetic.

---

## 📦 Local Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Laukikrathod2007/Ascendra.git
    cd Ascendra
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The server will host the application locally on `http://localhost:5173/`.

4.  **Build for Production:**
    ```bash
    npm run build
    ```
    Compiles optimized CSS and JS assets in the `dist/` directory.

---

## 🏆 Why Ascendra Wins Hackathons

*   **Premium Visual Polish:** Implements curated HSL colors, smooth transitions, and responsive grid layouts that look great on any screen.
*   **Comprehensive Demo State:** Launches with realistic mock data, including 12+ employee profiles, 60+ goals, 220+ logs, and notifications.
*   **Complex Governance Rules:** Goes beyond a basic todo list by enforcing mathematical sum bounds, automated conflict alerts, and locking states.
*   **Developer Simplicity:** Standard web assets compile quickly, deploy easily, and run fast on Vercel without requiring complex server configurations.

---

<p align="center">
  Developed by <strong>Laukik Rathod</strong>. Designed for Corporate Excellence.
</p>
