# ASCENDRA — Enterprise Execution Governance Platform

<p align="center">
  <img src="public/favicon.svg" width="90" height="90" alt="Ascendra Logo" />
</p>

<p align="center">
  <strong>Ascendra</strong> is a world-class enterprise execution governance and performance observability cockpit designed for Fortune 500 leadership teams. Unlike generic HRMS templates or simple checklist trackers, Ascendra delivers sophisticated corporate alignment, real-time lifecycle tracking, and compliance observability across complex organizational structures.
</p>

<p align="center">
  <a href="https://github.com/Laukikrathod2007/Ascendra/actions">
    <img src="https://img.shields.io/github/license/Laukikrathod2007/Ascendra?color=blue" alt="License" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/deployment-vercel-black" alt="Deployment" />
  </a>
  <img src="https://img.shields.io/badge/bundler-vite--8.0-6366F1" alt="Vite Bundler" />
</p>

---

## 🚀 Live Production Deployment

Deploy the project in under 60 seconds with Zero Config:

👉 **[Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLaukikrathod2007%2FAscendra)** (Once configured, you can add your custom deployed URL here)

*   **Pristine Default State:** All new visitors are welcomed by a programmatically generated initial seed dataset (over 60 active quarterly goals, 220+ historical audit logs, and realistic team matrices).
*   **Domain Isolation:** User actions are securely persisted inside the visitor's browser `localStorage` (`ascendra_state_v1`), providing instantaneous local storage without expensive database servers.

---

## 💡 Executive Platform Features

The platform is designed around **three core user workflows** (Employee, Manager, and Administrator) and includes a suite of compliance governance modules:

### 1. Dynamic Workspace Role Switcher
*   **Dynamic Role Contexts:** Swap between `EMPLOYEE`, `MANAGER`, and `ADMIN` workspaces on the fly from the sidebar scope dropdown.
*   **Tailored UI Telemetry:** The interface adjusts its navbars, active toolsets, dashboard telemetry charts, and command privileges instantly based on the logged-in role.

### 2. Goal Lifecycle Governance (`GoalManagement.js` / `ManagerReview.js`)
*   **Drafting & Weight Checks:** Ensures structured objective creation. All goals must sum to exactly `100%` before submission to avoid mathematical governance errors.
*   **Workflow Actions:** Supports drafting, locking, manager reviews, target evaluations (`↑ Higher is better` or `↓ Lower is better`), approvals, and return rework cycles with manager notes.
*   **Integrity Locks:** Once a sheet status transitions to `SUBMITTED` or `APPROVED`, input fields and buttons are automatically greyed out to prevent duplicate edits.

### 3. Smart Compliance Intervention Queue (`SmartQueue.js` / `HealthInspector.js`)
*   **Live Compliance Audit:** An intelligent background check processes goals against five structural failure checks:
    1.  *Overdue Metrics:* Achievement underperforming with no updates for 45+ days.
    2.  *Overloaded Managers:* Leaders with more than 3 subordinate sheets awaiting review.
    3.  *Shared Target Conflicts:* Identical corporate KPIs assigned to different team members with conflicting numeric targets.
    4.  *Rework Log:* Identifies goals returned to draft by managers for visibility.
    5.  *Post-Lock Changes:* Flags goals adjusted after cycle locks.

### 4. Interactive Organization Hierarchy Map (`OrgTree.js`)
*   **Visual Tree Mapping:** Displays hierarchical reporting chains with interactive connector lines.
*   **Live Metrics Overlay:** Highlights employees' departments, teams, goal counts, and color-coded progress bars based on their active quarterly achievements.
*   **Detail Side Drawer:** Clicking any node slides out a full-profile detail modal with goal audits and historical notes.

### 5. Execution Observability Cockpit (`AdminDashboard.js`)
*   **Interactive Analytical Charts:** Utilizes **Chart.js** to map completion percentages, at-risk thresholds, and escalation rates over time.
*   **Completion Matrix:** Real-time departmental contribution breakdown charts.
*   **Smart Queues & Leader Boards:** Immediate visibility into compliance escalations and top manager effectiveness scores.

### 6. Historical Audit Trails & Workflow Tracing (`Reports.js` / `Tracing.js`)
*   **Governance Trails:** Chronologically organizes over 200+ programmatic log actions. Includes text searching and role-based filters.
*   **Lifecycle Telemetry:** Traces state pathways to visualize transition stages and spotlight bottleneck zones.

---

## 🛠️ Technical Architecture

Ascendra is engineered for ultra-fast, static client-side rendering:
*   **Structure:** Semantic HTML5 layouts.
*   **Logic:** Clean ES Modules (Vanilla JS).
*   **State & Persistence:** Reactive local storage provider (`src/store/state.js`).
*   **Styling:** Elegant custom HSL CSS variables, smooth transitions, and grid layouts (`src/styles/dashboard.css`).
*   **Bundler:** Vite 8.x for hot module replacement (HMR) and lightweight builds.

---

## 📦 Local Installation & Setup

Set up and validate your local development environment:

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn

### Steps
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Laukikrathod2007/Ascendra.git
    cd Ascendra
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The platform will load locally on `http://localhost:5173/` or similar.

4.  **Build for Production:**
    ```bash
    npm run build
    ```
    This compiles and outputs the production bundle inside the `dist/` directory.

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Developed by Laukik Rathod. Crafted for Enterprise Excellence.
</p>
