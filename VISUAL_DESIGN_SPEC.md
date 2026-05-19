# 🎨 ASCENDRA — VISUAL DESIGN SPECIFICATION
### Executive Design Tokens, UI Topography, & Wireframe Blueprint

---

This document defines the high-end visual design system and UI layout topography of **Ascendra**. Engineered for the C-Suite, the design balances rich information density with modern **glassmorphic card styling**, vibrant glowing indicators, and fluid motion states.

---

## 1. Visual Color Tokens & HSL Palette

Ascendra abandons standard raw primary colors in favor of a balanced, low-fatigue slate theme with vibrant neon execution telemetry accents:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE ASCENDRA COLOR WAY                            │
├───────────────┬───────────────────────────────┬─────────────────────────────┤
│ Color Role    │ HSL Token Mapping             │ Hex Approximation           │
├───────────────┼───────────────────────────────┼─────────────────────────────┤
│ Primary Accent│ HSL(242, 82%, 65%)            │ #6366F1 (Indigo Glow)       │
│ Success State │ HSL(150, 84%, 44%)            │ #10B981 (Emerald Green)     │
│ Warning State │ HSL(38, 92%, 50%)             │ #F59E0B (Amber Warning)     │
│ Danger/Risk   │ HSL(0, 84%, 60%)              │ #EF4444 (Vibrant Rose)      │
│ Base Slate    │ HSL(222, 47%, 11%)            │ #0F172A (Deep Slate Dark)   │
│ Light Canvas  │ HSL(210, 40%, 98%)            │ #F8FAFC (Clean Canvas Light)│
└───────────────┴───────────────────────────────┴─────────────────────────────┘
```

---

## 2. High-Fidelity UI Layout Map (Desktop Viewport)

Below is the layout map representing the spatial composition of the **Executive Governance Cockpit** inside the dynamic main panel:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ASCENDRA 🏛️                                         🔍 Search employees, goals, or audit logs...   👤 ADMIN  │
├──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 📂 Workspace Scope                                  │ 📈 EXECUTIVE PERFORMANCE TELEMETRY                    │
│   ├── 👤 Platform Administrator                     │   ├─────────────────────────────────────────────────┐ │
│   ├── 👥 Department Manager                         │   │  [Chart.js Line Graph: Q1 Completion vs Risk]   │ │
│   └── 🧑‍💻 Employee (Morgan Blake)                   │   │  85% ───────────────────*                       │ │
│                                                      │   │  60% ──────────────*                            │ │
│ 🖥️ SYSTEM MENU                                       │   │  30% ───────*                                   │ │
│   ├── 📊 Dashboard Telemetry                         │   │  0%  ──*─────────────────────────────────────── │ │
│   ├── 🎯 Goal Stepper Console                        │   │        Apr 1    Apr 15    May 1    May 15          │ │
│   ├── 🌳 Org Tree Map                                │   └─────────────────────────────────────────────────┘ │
│   └── 📜 Governance Audit Logs                       │   ├───────────────────────────┬───────────────────────────┤
│                                                      │ 🍩 CONTRIBUTION RATIOS     │ 🩺 INTERVENTION ALERTS    │
│ ⚙️ SETTINGS                                           │    Sales      [  36%  ]   │    [🚨 Conflict] EMP-002   │
│   └── 🔒 Cycle Control Panel                         │    Eng        [  27%  ]   │    [⚠️ Overload] Mgr Blake │
│                                                      │    Ops        [  18%  ]   │    [⏳ Overdue ] Goal #24  │
│                                                      │    HR         [  10%  ]   │    [🔄 Rework  ] Goal #15  │
└──────────────────────────────────────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

## 3. Glassmorphic CSS Implementation Blueprint

The UI cards use thin translucent borders, light reflecting backdrops, and active scale animations. This is the exact CSS component blueprint from `src/styles/dashboard.css`:

```css
/* Custom Executive Card Class */
.card-p {
  background: var(--bg-card); /* Resolves to semi-transparent HSL on theme load */
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
              0 2px 4px -1px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s ease-in-out;
}

/* Micro-Interaction Response */
.card-p:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08),
              0 4px 6px -2px rgba(0, 0, 0, 0.04);
  border-color: var(--primary-light);
}

/* Active Scale Feedback on Clicks */
.card-p:active {
  transform: scale(0.98);
}
```

---

## 4. Component Layout Hierarchy (Symmetry Rules)

To maintain grid symmetry and eliminate visual shifts:
1.  **Sidebar Collapsed State:** Sidebars shrink from `260px` to `80px` smoothly using `transition: width 0.3s ease;`.
2.  **Telemetry Grid (`.grid-60-40`):** Combines the large historical line chart (60% width) and the intervention check lists (40% width) side-by-side.
3.  **Metrics Grid (`.grid-2`):** Distributes departmental contribution tables and smart queues in two equal blocks on desktop, which cleanly stacks into single-column cards on smaller viewports (`@media (max-width: 1024px)`).
4.  **Indicators & Badges:** Features custom padding (`4px 8px`), light background opacity, and uppercase fonts (`font-size: 10px; font-weight: 700; letter-spacing: 0.05em;`).
