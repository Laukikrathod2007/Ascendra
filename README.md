<div align="center">
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-logo.png" alt="Ascendra Logo" width="380" />

  <br/>
  <br/>

  <h2>Enterprise Execution Governance & Performance Observability Platform</h2>

  <p>
    A Fortune 500-grade platform that transforms fragmented quarterly planning into a<br/>
    real-time compliance cockpit — built for leadership teams who demand absolute execution precision.
  </p>

  <br/>

  <a href="https://ascendra-xi.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-ascendra--xi.vercel.app-6366F1?style=for-the-badge" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://github.com/Laukikrathod2007/Ascendra">
    <img src="https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>

  <br/><br/>

  <img src="https://img.shields.io/badge/Vanilla_JS-ES6_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Chart.js-Telemetry-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-HSL_Design_Tokens-1572B6?style=flat-square&logo=css3" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" />

</div>

---

## 📑 Table of Contents
* [1. 🎯 Executive Overview & Value Proposition](#1--executive-overview--value-proposition)
* [2. 💼 Governance Lifecycle Specification](#2--governance-lifecycle-specification)
* [3. 🩺 Advanced Compliance Intelligence (The 5 Core Audits)](#3--advanced-compliance-intelligence-the-5-core-audits)
* [4. 📊 Observability Cockpit & Org Telemetry](#4--observability-cockpit--org-telemetry)
* [5. 🏗️ Tech Stack & Clean Architecture](#5--tech-stack--clean-architecture)
* [6. 🎨 Design Tokens & UI Aesthetics](#6--design-tokens--ui-aesthetics)
* [7. 💾 Local State Persistence Architecture](#7--local-state-persistence-architecture)
* [8. 🚀 Professional Quick Start & Deployment](#8--professional-quick-start--deployment)
* [9. 📁 Enterprise Repository Layout](#9--enterprise-repository-layout)
* [10. 📝 Developer Verification Policy](#10--developer-verification-policy)

---

## 1. 🎯 Executive Overview & Value Proposition

In the modern enterprise, **strategic execution is the single greatest bottleneck**. While companies excel at designing goals, they routinely fail to execute them because of:
*   **Invisible Gaps:** Disconnected spreadsheets and static tools leave executives blind to mid-quarter drifts.
*   **Approval Drift:** Review loops stall indefinitely when manager review queues lack programmatic enforcement.
*   **Zero Audits:** Post-cycle modifications happen in the dark, leading to data degradation and target drift.

**Ascendra** resolves these issues by delivering a zero-latency, highly observable **Execution Control Plane** inside the browser. It unites employee workflow self-service, real-time manager approval queues, and admin cycle control under a single premium cockpit.

---

## 2. 💼 Governance Lifecycle Specification

Every strategic sheet in Ascendra undergoes a programmatic, rigid lifecycle to ensure data integrity:

```
 [Draft Mode] ──► [Weight Compliance Audit] ──► [Submitted & Locked] ──► [Review Queue] 
       ▲                                                                      │
       │                                                                      ▼
 [Rework Queue] ◄────────────────── [Manager Return] ◄────────────── [Manager Approve] ──► [Approved & Frozen]
```

### 🔒 Hard-Lined Input Guardrails
*   **100% Weight Compliance:** Employees cannot submit sheets for review unless their accumulated goal weights sum to **exactly 100%**. This enforces mathematical symmetry and aligns focus.
*   **Form Input Freezes:** The moment a sheet transitions to `SUBMITTED` or `APPROVED`, the UI dynamically locks. Target variables, metrics, and weight scales are frozen (`pointer-events: none` and visual opacity set to `0.5`) to prevent unsanctioned modifications.
*   **Returned Rework Paths:** If a manager returns a sheet for rework, the form is instantly unlocked with inline notes from the manager highlighting necessary course corrections.

---

## 3. 🩺 Advanced Compliance Intelligence (The 5 Core Audits)

Ascendra runs **five synchronous audit scanners** across all employee and department states to proactively flag execution risk:

> [!IMPORTANT]
> The audit scanners are continuously evaluated as reactive state mutations occur. Any anomalies are instantly injected into the executive telemetry streams.

| Scanner | Trigger Condition | Business Risk Mitigated |
| :--- | :--- | :--- |
| **🚨 Overdue Metrics Check** | Achievement is below target threshold and no updates have occurred in the last **45+ days**. | Spotlights stagnant goals before they impact quarterly performance. |
| **👥 Manager Overload Check** | An active manager has **3 or more sheets** pending review concurrently. | Prevent organizational bottlenecks in the approval workflow. |
| **⚖️ Shared KPI Conflicts** | Two employees hold conflicting targets or performance metrics on the same shared corporate goal. | Eliminates misalignment and redundant cross-functional efforts. |
| **🔄 Returned Rework Tracker** | Traces goals that have been returned to draft state by a supervisor. | Monitors workflow velocity and flags execution delay. |
| **🔒 Post-Lock Edit Audit** | An active sheet is modified after the global cycle has been formally locked by the Admin. | Guarantees compliance integrity and acts as a firewall against unauthorized targets. |

---

## 4. 📊 Observability Cockpit & Org Telemetry

### 📈 Executive Analytics Center
Driven by clean **Chart.js integration**, the dashboard compiles:
*   **Performance Trends:** Historical visualization of average Completion %, At-Risk %, and Escalation Rate.
*   **Department Contribution Share:** Interactive pie distributions highlighting goal ownership across Engineering, Sales, Ops, and HR.
*   **Real-time Smart Queue:** A rolling dashboard widget prioritizing compliance alerts based on risk thresholds.

### 🌳 Organization Reporting Matrix
*   Renders a dynamically calculated graphical hierarchy representation of the team structure.
*   Includes department badge overlays and interactive target slide drawers that reveal subordinates' active goals and audit history logs with single-click ease.

### 📜 Programmatic Audit Tracing
*   Houses **220+ pre-seeded audit logs** capturing every workflow transaction (Draft, Submit, Review, Reject, Cycle Lock, Metrics Update).
*   Enables instant multi-faceted search queries and role-scoped timeline viewing.

---

## 5. 🏗️ Tech Stack & Clean Architecture

Ascendra is engineered as a **highly scalable, zero-dependency Single Page Application (SPA)**:

*   **Vite 8.0 & ES6 Modules:** Serves lightweight, modular script modules with lightning-fast hot reloading.
*   **Virtual Router Swap (`window.navigate`):** A custom state-driven router that intercepts navigation commands, tears down active Canvas handles via `destroyCharts()`, and swaps innerHTML in a blazing-fast **12ms execution loop** with zero layout shift (CLS).
*   **Reactive State Store (`src/store/state.js`):** Implements a unified application store pattern. Every user action dispatches state changes through `setState()`, which reactively triggers `persistState()` to write straight to browser LocalStorage.

---

## 6. 🎨 Design Tokens & UI Aesthetics

Ascendra uses a premium, dark-mode-first visual language tailored to executive observability:

> [!TIP]
> The platform utilizes carefully tailored HSL color tokens to reduce visual fatigue during long periods of dashboard viewing.

*   **Primary Active Glow:** `HSL(242, 82%, 65%)` — Indigo Glow
*   **Success Status:** `HSL(150, 84%, 44%)` — Emerald Green
*   **Warning Threshold:** `HSL(38, 92%, 50%)` — Amber Warning
*   **Risk Escalation:** `HSL(0, 84%, 60%)` — Rose Accent
*   **Card Styling:** Translucent glass backdrops (`backdrop-filter: blur(8px)`) bounded by precise 1px borders (`rgba(255, 255, 255, 0.08)`).
*   **Visual Physics:** Micro-animations scale cards seamlessly on mouse click (`scale(0.98)`) and hover (`translateY(-2px)`) for a premium native app feel.

---

## 7. 💾 Local State Persistence Architecture

The platform operates on a robust, **no-database-required browser storage architecture**:
*   **Auto-Seeding Engine:** On first visit, the state store detects empty storage and dynamically injects **12 complete employee profiles, 60+ strategic goals, and 220+ historical audit logs** into the client database.
*   **Vercel-Safe Sandbox:** Since state lives in the user's browser storage under `ascendra_state_v1`, **local updates, submissions, settings, and new logs persist across refreshes** and do not conflict with other site visitors!

---

## 8. 🚀 Professional Quick Start & Deployment

### Local Development Setup

```bash
# 1. Clone the project remote
git clone https://github.com/Laukikrathod2007/Ascendra.git
cd Ascendra

# 2. Install production and development assets
npm install

# 3. Start local development environment
npm run dev
# Vite server boots at http://localhost:5173/

# 4. Generate local production bundle
npm run build
```

### Production Deployment to Vercel (Zero Config)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLaukikrathod2007%2FAscendra)

*   **Vite Integration:** Auto-detected by Vercel's build container.
*   **SPA Handling:** The application uses state-based client routing, meaning no backend rewrite redirects or custom `vercel.json` setups are required.

---

## 9. 📁 Enterprise Repository Layout

```
Ascendra/
├── index.html                    # Platform single-page entry bootstrapper
├── ARCHITECTURAL_DIAGRAM.md      # Master topology, sequence & workflow charts
├── VISUAL_DESIGN_SPEC.md         # Design token matrices & UI spatial mockups
├── HACKATHON_CHECKLIST_STATUS.md # Quality assurance check lists & feature metrics
├── package.json                  # Core dependencies and project run-scripts
├── src/
│   ├── main.js                   # Application bootstrap, shell compilation, and virtual router
│   ├── store/
│   │   └── state.js              # Central reactive store & rich seeder engine
│   ├── pages/
│   │   ├── AdminDashboard.js     # Executive Observability Cockpit
│   │   ├── GoalManagement.js     # Goal creation, submission, and form locks
│   │   ├── ManagerReview.js      # Supervisor queue, approvals, and rework triggers
│   │   ├── HealthInspector.js    # Automated compliance scanner engine
│   │   ├── SmartQueue.js         # Prioritized intervention and audit UI
│   │   ├── OrgTree.js            # Dynamic hierarchy chart & slide-out drawers
│   │   ├── Reports.js            # Structured audit trails & filter terminals
│   │   ├── Tracing.js            # Linear lifecycle transaction mapping
│   │   └── AdminSettings.js      # Cycle control board & system settings
│   ├── utils/
│   │   ├── engine.js             # Performance equations & progress score calculators
│   │   └── constants.js          # Unified system enums & states
│   └── styles/
│       ├── dashboard.css         # Glassmorphic component classes & system grids
│       └── variables.css         # Shared CSS design token variables
└── public/
    ├── ascendra-icon.png         # Isolated blue "A" brand icon logo
    └── favicon.svg               # Web browser tab icon
```

---

## 10. 📝 Developer Verification Policy

Ascendra maintains strict validation to prevent regressions during active development. Below is the QA check-sheet for features:

*   **Verification 1:** Ensure `getState()` and `setState()` transitions are logged under the browser's console when in local development environment.
*   **Verification 2:** Confirm that changing user roles from the executive header immediately re-binds view listeners without leaking event subscriptions.
*   **Verification 3:** Verify that clicking 'Abort' or resetting active state in `AdminSettings.js` successfully clears the browser's local sandbox and re-seeds all data nodes cleanly.

---

<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-icon.png" alt="Ascendra Icon" width="60" />
  <br/><br/>
  <strong>Built by Laukik Rathod · Engineered for Corporate Excellence</strong>
  <br/>
  <a href="https://ascendra-xi.vercel.app/">ascendra-xi.vercel.app</a>
  <br/><br/>
</div>
