<div align="center">
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-icon.png" alt="Ascendra Brand Icon" width="130" />
  <br/>
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-logo.png" alt="Ascendra Logo" width="340" />

  <br/>
  <br/>

  <h2>Enterprise Execution Governance & Performance Observability Platform</h2>

  <p>
    A Fortune 500-grade platform that transforms fragmented quarterly planning into a<br/>
    real-time compliance cockpit — built for leadership teams who demand precision.
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

## 🎯 The Problem We Solve

> Most enterprises still manage quarterly strategic goals through **fragmented spreadsheets, disconnected HR tools, and static PDF check-ins.** This creates invisible execution gaps, governance drift, and zero real-time observability for leadership.

**Ascendra** replaces all of that with a **living, automated, governance-first execution engine** — where goal setting, manager approvals, compliance audits, and performance telemetry all live in one premium cockpit.

---

## ✨ Core Modules & Features

### 🔄 Dynamic Role Workspace Switcher
Instantly switch between three fully isolated role contexts — **Administrator**, **Department Manager**, and **Employee** — each with tailored navigation, permissions, and telemetry dashboards. No page reloads. Zero flicker.

---

### 🎯 Goal Lifecycle Engine
> **Files:** `src/pages/GoalManagement.js` · `src/pages/ManagerReview.js`

| Stage | What Happens |
|-------|-------------|
| **Draft** | Employee creates strategic goals with weighted KPIs |
| **Weight Check** | System enforces `sum == 100%` before submission |
| **Submit** | Form locks; sheet enters manager's review queue |
| **Review** | Manager annotates with target direction (`↑ Higher` / `↓ Lower`) |
| **Approve / Return** | Approved sheets lock permanently; returned sheets unlock with rework notes |

---

### 🩺 5-Point Smart Compliance Intelligence
> **Files:** `src/pages/SmartQueue.js` · `src/pages/HealthInspector.js`

The platform runs **automated compliance sweeps** across all active goal sheets:

| # | Check | Trigger Condition |
|---|-------|------------------|
| 1 | 🚨 **Overdue Metrics** | Achievement below target, no update in 45+ days |
| 2 | 👥 **Leader Overload** | Manager has 3+ sheets pending review simultaneously |
| 3 | ⚖️ **Shared KPI Conflicts** | Two employees hold conflicting targets on the same corporate goal |
| 4 | 🔄 **Rework Monitor** | Sheets returned to draft by managers — tracked for SLA |
| 5 | 🔒 **Post-Lock Edit Audit** | Goals modified after administrative cycle lock |

---

### 📈 Executive Observability Cockpit
> **File:** `src/pages/AdminDashboard.js`

- **Live Chart.js Trend Lines** — Completion %, At-Risk %, and Escalation Rate over time
- **Departmental Donut Breakdown** — Contribution share across Sales, Engineering, Ops, HR
- **Smart Intervention Feed** — Flagged anomalies surfaced directly on the dashboard
- **Leader Effectiveness Rankings** — Manager performance scored by team execution speed

---

### 🌳 Interactive Organization Hierarchy Map
> **File:** `src/pages/OrgTree.js`

Visual reporting tree with live connector lines, department badge overlays, progress indicators, and clickable side drawers showing employee goal histories and audit actions.

---

### 📜 Governance Audit Trail & Workflow Tracing
> **Files:** `src/pages/Reports.js` · `src/pages/Tracing.js`

Chronological log of **220+ programmatic audit actions** with full-text search, role-based filters, and lifecycle state tracing to pinpoint bottlenecks in any approval chain.

---

### ⚙️ Cycle Planning Control Panel
> **File:** `src/pages/AdminSettings.js`

Administrators control the global planning phase — `GOAL_SETTING → Q1 → Q2 → Q3 → Q4` — with cycle lock toggles that instantly freeze or unlock all subordinate forms enterprise-wide.

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│              BROWSER (Zero Server Required)              │
│                                                         │
│  ┌────────────┐    ┌─────────────────────────────────┐  │
│  │  Role Shell │───▶│   Virtual SPA Router            │  │
│  │ (buildShell)│    │   (window.navigate → pageId)    │  │
│  └────────────┘    └──────────┬──────────────────────┘  │
│                               │ mounts                   │
│                    ┌──────────▼──────────────────────┐  │
│                    │     ES Module Views (src/pages/) │  │
│                    │  Dashboard · Goals · Org · Audit  │  │
│                    └──────────┬──────────────────────┘  │
│                               │ reads/writes             │
│                    ┌──────────▼──────────────────────┐  │
│                    │   Reactive State Store           │  │
│                    │   (src/store/state.js)           │  │
│                    └──────────┬──────────────────────┘  │
│                               │ persists                 │
│                    ┌──────────▼──────────────────────┐  │
│                    │   Browser LocalStorage           │  │
│                    │   key: 'ascendra_state_v1'       │  │
│                    └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

> **Full interactive architecture diagrams (topology maps, sequence flows, governance loops) →** [`ARCHITECTURAL_DIAGRAM.md`](./ARCHITECTURAL_DIAGRAM.md)

---

## 🎨 Design System Highlights

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#6366F1` — Indigo | Active states, CTAs, progress rings |
| **Success** | `#10B981` — Emerald | Approved goals, healthy metrics |
| **Warning** | `#F59E0B` — Amber | At-risk indicators, pending states |
| **Danger** | `#EF4444` — Rose | Escalations, overdue flags |
| **Surface** | `#0F172A` — Slate | Dark mode base canvas |

- **Glassmorphic Cards** — `backdrop-filter: blur(8px)` with translucent borders
- **Micro-Animations** — `transform: translateY(-2px)` on hover, `scale(0.98)` on click
- **Inter Font** — Google Fonts loaded for all UI text
- **Zero Layout Shift** — Virtual DOM swap routing eliminates CLS entirely

---

## 💾 Data Persistence — No Database Required

All state is stored in `localStorage` under the key `ascendra_state_v1`:

- ✅ **60+ active quarterly goals** pre-seeded across 12 employee profiles
- ✅ **220+ historical audit log entries** for immediate telemetry demonstration
- ✅ **3 role profiles** (Admin, Manager, Employee) ready to switch
- ✅ **User modifications persist** across page refreshes automatically
- ✅ **New Vercel visitors** get the full rich seed dataset on first load

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Laukikrathod2007/Ascendra.git
cd Ascendra

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# → http://localhost:5173/

# 4. Build for production
npm run build
```

### Deploy to Vercel (Zero Config)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLaukikrathod2007%2FAscendra)

Vercel auto-detects **Vite**, sets `npm run build` as the build command, and serves `dist/` — no configuration needed.

---

## 📁 Project Structure

```
Ascendra/
├── index.html                    # App entry point
├── src/
│   ├── main.js                   # App bootstrap, SPA router, role switcher
│   ├── store/
│   │   └── state.js              # Central reactive store + seed data
│   ├── pages/
│   │   ├── AdminDashboard.js     # Executive telemetry cockpit
│   │   ├── GoalManagement.js     # Employee goal builder
│   │   ├── ManagerReview.js      # Manager approval terminal
│   │   ├── HealthInspector.js    # 5-point compliance audit
│   │   ├── SmartQueue.js         # Intervention queue
│   │   ├── OrgTree.js            # Organization hierarchy map
│   │   ├── Reports.js            # Audit trail & log viewer
│   │   ├── Tracing.js            # Workflow lifecycle tracer
│   │   ├── AdminSettings.js      # Cycle control panel
│   │   └── CompletionDashboard.js# Completion matrix
│   ├── utils/
│   │   ├── engine.js             # Telemetry & score calculations
│   │   └── constants.js          # Shared enums & config
│   └── styles/
│       ├── dashboard.css         # Component grid & card system
│       └── variables.css         # HSL design token definitions
├── public/
│   ├── ascendra-logo.png         # Brand logo
│   └── favicon.svg               # Browser tab icon
├── ARCHITECTURAL_DIAGRAM.md      # System topology & sequence diagrams
├── VISUAL_DESIGN_SPEC.md         # Design token & wireframe spec
└── package.json
```

---

## 🏆 Why Ascendra Stands Out

| Criterion | Ascendra's Approach |
|-----------|-------------------|
| **Technical Depth** | Full governance lifecycle engine — not a simple CRUD form |
| **Business Relevance** | Solves real Fortune 500 quarterly execution failures |
| **Zero Infrastructure** | Fully client-side, deploys to Vercel in 60 seconds flat |
| **Premium UX** | Glassmorphic design, micro-animations, zero layout shift |
| **Demo Ready** | Ships with 60+ goals, 220+ logs, 12 employees — no setup |
| **Code Quality** | Modular ES6 architecture, reactive state, clean separation of concerns |

---

<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-icon.png" alt="Ascendra" width="60" />
  <br/><br/>
  <strong>Built by Laukik Rathod · Engineered for Corporate Excellence</strong>
  <br/>
  <a href="https://ascendra-xi.vercel.app/">ascendra-xi.vercel.app</a>
  <br/><br/>
</div>
