<div align="center">

<img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-logo.png" width="480" alt="Ascendra — Enterprise Performance Management" />

<br/>
<h3>Enterprise Execution Governance & Performance Observability Platform</h3>

<p>
  A Fortune 500-grade platform that transforms fragmented quarterly planning into a<br/>
  real-time compliance cockpit — built for leadership teams who demand precision.
</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-ascendra--xi.vercel.app-1D4ED8?style=for-the-badge)](https://ascendra-xi.vercel.app/)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github)](https://github.com/Laukikrathod2007/Ascendra)

<br/>

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-Telemetry-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-HSL_Design_Tokens-1572B6?style=flat-square&logo=css3)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)

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
> `src/pages/GoalManagement.js` · `src/pages/ManagerReview.js`

| Stage | What Happens |
|-------|-------------|
| **Draft** | Employee creates strategic goals with weighted KPIs |
| **Weight Check** | System enforces `sum == 100%` before submission is allowed |
| **Submit** | Form locks; sheet enters manager's review queue |
| **Review** | Manager annotates with target direction (`↑ Higher` / `↓ Lower`) |
| **Approve / Return** | Approved sheets lock permanently; returned sheets unlock with rework notes |

---

### 🩺 5-Point Smart Compliance Intelligence
> `src/pages/SmartQueue.js` · `src/pages/HealthInspector.js`

The platform runs **automated compliance sweeps** across all active goal sheets in real time:

| # | Check | Trigger Condition |
|---|-------|------------------|
| 1 | 🚨 **Overdue Metrics** | Achievement below target, no update in 45+ days |
| 2 | 👥 **Leader Overload** | Manager has 3+ sheets pending review simultaneously |
| 3 | ⚖️ **Shared KPI Conflicts** | Two employees hold conflicting targets on the same corporate goal |
| 4 | 🔄 **Rework Monitor** | Sheets returned to draft — tracked for SLA visibility |
| 5 | 🔒 **Post-Lock Edit Audit** | Goals modified after administrative cycle lock |

---

### 📈 Executive Observability Cockpit
> `src/pages/AdminDashboard.js`

- **Live Chart.js Trend Lines** — Completion %, At-Risk %, and Escalation Rate over time
- **Departmental Donut Breakdown** — Contribution share across Sales, Engineering, Ops, HR
- **Smart Intervention Feed** — Flagged anomalies surfaced directly on the dashboard
- **Leader Effectiveness Rankings** — Manager performance scored by team execution speed

---

### 🌳 Interactive Organization Hierarchy Map
> `src/pages/OrgTree.js`

Visual reporting tree with live connector lines, department badge overlays, goal-count progress indicators, and clickable side drawers showing employee goal histories and audit actions.

---

### 📜 Governance Audit Trail & Workflow Tracing
> `src/pages/Reports.js` · `src/pages/Tracing.js`

Chronological log of **220+ programmatic audit actions** with full-text search, role-based filters, and lifecycle state tracing to pinpoint bottlenecks in any approval chain.

---

### ⚙️ Cycle Planning Control Panel
> `src/pages/AdminSettings.js`

Administrators control the global planning phase — `GOAL_SETTING → Q1 → Q2 → Q3 → Q4` — with cycle lock toggles that instantly freeze or unlock all subordinate forms enterprise-wide.

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│              BROWSER (Zero Server Required)              │
│                                                         │
│  ┌─────────────┐   ┌──────────────────────────────────┐ │
│  │  Role Shell  │──▶│  Virtual SPA Router              │ │
│  │ (buildShell) │   │  (window.navigate → pageId)      │ │
│  └─────────────┘   └─────────────┬────────────────────┘ │
│                                  │ mounts                │
│                    ┌─────────────▼────────────────────┐  │
│                    │  ES Module Views  (src/pages/*)  │  │
│                    │  Dashboard · Goals · Org · Audit  │  │
│                    └─────────────┬────────────────────┘  │
│                                  │ reads / writes        │
│                    ┌─────────────▼────────────────────┐  │
│                    │  Reactive State Store             │  │
│                    │  (src/store/state.js)             │  │
│                    └─────────────┬────────────────────┘  │
│                                  │ persists              │
│                    ┌─────────────▼────────────────────┐  │
│                    │  Browser LocalStorage             │  │
│                    │  key: 'ascendra_state_v1'         │  │
│                    └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

> Full interactive architecture diagrams → [`ARCHITECTURAL_DIAGRAM.md`](./ARCHITECTURAL_DIAGRAM.md)  
> Visual design tokens & wireframes → [`VISUAL_DESIGN_SPEC.md`](./VISUAL_DESIGN_SPEC.md)

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#6366F1` Indigo | Active states, CTAs, progress rings |
| **Success** | `#10B981` Emerald | Approved goals, healthy metrics |
| **Warning** | `#F59E0B` Amber | At-risk indicators, pending states |
| **Danger** | `#EF4444` Rose | Escalations, overdue flags |
| **Surface** | `#0F172A` Slate | Dark mode base canvas |

- **Glassmorphic Cards** — `backdrop-filter: blur(8px)` with translucent HSL borders
- **Micro-Animations** — `translateY(-2px)` on hover, `scale(0.98)` on active click
- **Inter Font** — Google Fonts for all UI text
- **Zero Layout Shift** — Virtual DOM swap routing eliminates CLS entirely

---

## 💾 Data Persistence — No Database Required

All state persists in `localStorage` under the key `ascendra_state_v1`:

- ✅ **60+ active quarterly goals** pre-seeded across 12 employee profiles
- ✅ **220+ historical audit log entries** for immediate telemetry demonstration
- ✅ **3 role profiles** (Admin, Manager, Employee) ready to switch instantly
- ✅ **User modifications persist** across page refreshes automatically
- ✅ **New Vercel visitors** receive the full rich seed dataset on first load

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

### One-Click Vercel Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLaukikrathod2007%2FAscendra)

Vercel auto-detects **Vite**, runs `npm run build`, and serves `dist/` — zero configuration needed.

---

## 📁 Project Structure

```
Ascendra/
├── index.html                      # App entry point
├── src/
│   ├── main.js                     # Bootstrap, SPA router, role switcher
│   ├── store/
│   │   └── state.js                # Reactive store + 60+ goal seed data
│   ├── pages/
│   │   ├── AdminDashboard.js       # Executive telemetry cockpit
│   │   ├── GoalManagement.js       # Employee goal builder
│   │   ├── ManagerReview.js        # Manager approval terminal
│   │   ├── HealthInspector.js      # 5-point compliance audit
│   │   ├── SmartQueue.js           # Intervention queue
│   │   ├── OrgTree.js              # Organization hierarchy map
│   │   ├── Reports.js              # Audit trail & log viewer
│   │   ├── Tracing.js              # Workflow lifecycle tracer
│   │   ├── AdminSettings.js        # Cycle control panel
│   │   └── CompletionDashboard.js  # Completion matrix
│   ├── utils/
│   │   ├── engine.js               # Telemetry & score calculations
│   │   └── constants.js            # Shared enums & config
│   └── styles/
│       ├── dashboard.css           # Component grid & card system
│       └── variables.css           # HSL design token definitions
├── public/
│   ├── ascendra-logo.png           # Brand logo
│   └── favicon.svg                 # Browser tab icon
├── ARCHITECTURAL_DIAGRAM.md        # System topology & sequence diagrams
├── VISUAL_DESIGN_SPEC.md           # Design token & wireframe spec
└── package.json
```

---

## 🏆 Why Ascendra Stands Out

| Criterion | Ascendra's Approach |
|-----------|-------------------|
| **Technical Depth** | Full governance lifecycle engine — not a simple CRUD form |
| **Business Relevance** | Solves real Fortune 500 quarterly execution failures |
| **Zero Infrastructure** | Fully client-side, deploys to Vercel in 60 seconds |
| **Premium UX** | Glassmorphic design, micro-animations, zero layout shift |
| **Demo Ready** | Ships with 60+ goals, 220+ logs, 12 employees — no setup needed |
| **Code Quality** | Modular ES6 architecture, reactive state, clean separation of concerns |

---

<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/Laukikrathod2007/Ascendra/main/public/ascendra-logo.png" width="260" alt="Ascendra" />
  <br/><br/>
  <strong>Built by Laukik Rathod · Engineered for Corporate Excellence</strong>
  <br/>
  <a href="https://ascendra-xi.vercel.app/">ascendra-xi.vercel.app</a>
  <br/><br/>
</div>
