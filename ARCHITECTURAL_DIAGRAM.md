# 🏛️ ASCENDRA — HIGH-LEVEL SYSTEM ARCHITECTURE
### Master Engineering Topography, Reactive Pipeline, & Governance Sequence

---

This document outlines the master technical architecture of **Ascendra — Enterprise Performance & Observability Cockpit**. The system is engineered to deliver zero-latency client-side state synchronization, strict mathematical goal validations, and comprehensive audit tracing entirely inside the browser.

---

## 1. Modular System Topology Map

The diagram below maps the runtime topography of Ascendra, highlighting the visual layers, ES Module boundaries, logic triggers, and the underlying persistence layers:

```mermaid
graph TB
    %% Visual Theme Classes
    classDef client fill:#EEF2F6,stroke:#64748B,stroke-width:2px,color:#0F172A;
    classDef router fill:#FAF5FF,stroke:#A855F7,stroke-width:2px,color:#581C87;
    classDef logic fill:#ECFDF5,stroke:#10B981,stroke-width:2px,color:#064E3B;
    classDef state fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px,color:#78350F;
    classDef storage fill:#FFF1F2,stroke:#F43F5E,stroke-width:2px,color:#881337;

    subgraph Presentation_Layer ["1. CLIENT SHELL & ROLE WORKSPACES (src/main.js)"]
        Sidebar["📁 Navigation Sidebar<br>(sb-link events)"]
        Header["💼 Executive Header<br>(Global Search & Notifs)"]
        ScopeSelector["🔄 Workspace Scope Switcher<br>(window.switchRole)"]
    end
    class Sidebar,Header,ScopeSelector client;

    subgraph Virtual_SPA_Controller ["2. SPA VIEW ROUTER (window.navigate)"]
        direction TB
        RouteCore["⚡ Virtual Router Controller<br>(navigate pageId)"]
        ChartTeardown["🧹 Active Chart Teardown<br>(destroyCharts)"]
        DOMRenderer["🖌️ DOM Swap Engine<br>(area.innerHTML)"]
        
        subgraph ViewModules ["Modular Views (src/pages/*)"]
            AdminDash["AdminDashboard.js<br>(Telemetry cockpit)"]
            GoalMgmt["GoalManagement.js<br>(100% Weight enforcer)"]
            TeamReview["ManagerReview.js<br>(Approval sheets)"]
            OrgTree["OrgTree.js<br>(Dynamic node links)"]
            HealthQueue["HealthInspector.js & SmartQueue.js<br>(5-Point audit)"]
            ReportsTrail["Reports.js & Tracing.js<br>(220+ log filters)"]
            AdminConfig["AdminSettings.js<br>(Cycle locked/unlocked)"]
        end
    end
    class RouteCore,ChartTeardown,DOMRenderer,AdminDash,GoalMgmt,TeamReview,OrgTree,HealthQueue,ReportsTrail,AdminConfig router;

    subgraph Governance_Logic_Layer ["3. GOVERNANCE VALIDATION ENGINE (src/utils/*)"]
        direction TB
        TelemetryScore["🎛️ Telemetry Calculator<br>(calculateProgressScore)"]
        WeightAuditor["⚖️ Weight Compliance Enforcer<br>(Sum == 100%)"]
        
        subgraph AuditEngine ["5-Point Compliance Auditor"]
            OverdueCheck["🚨 Overdue Metrics Check"]
            OverloadCheck["👥 Manager Overload Check"]
            ConflictCheck["⚖️ Shared KPI Conflict Checks"]
            ReworkCheck["🔄 Returned Rework Tracker"]
            LockCheck["🔒 Post-Lock Edit Audit"]
        end
    end
    class TelemetryScore,WeightAuditor,OverdueCheck,OverloadCheck,ConflictCheck,ReworkCheck,LockCheck logic;

    subgraph Reactive_State_Layer ["4. CENTRAL REACTIVE STORE (src/store/state.js)"]
        direction LR
        StateStore["📦 Central Memory State<br>(getState / setState)"]
    end
    class StateStore state;

    subgraph Persistence_Storage ["5. LOCAL STORAGE ENGINE (Browser LocalStorage)"]
        direction TB
        Broker["💾 State Serialization Broker<br>(persistState / loadPersistedState)"]
        LocalStorage["🗄️ Local Database Key<br>('ascendra_state_v1')"]
    end
    class Broker,LocalStorage storage;

    %% Logical Flow Connectors
    ScopeSelector -->|Invalidates Shell Context| Presentation_Layer
    Presentation_Layer -->|Triggers UI Swap| RouteCore
    RouteCore -->|1. Cleans visual cache| ChartTeardown
    RouteCore -->|2. Swaps views| DOMRenderer
    DOMRenderer -->|Mounts page template| ViewModules
    
    %% View interactions with logic & state
    GoalMgmt -->|Validates weight totals| WeightAuditor
    TeamReview -->|Triggers review actions| TelemetryScore
    OrgTree -->|Gathers subordinate telemetry| TelemetryScore
    HealthQueue -->|Processes real-time checks| AuditEngine
    
    %% Engine connection to state
    WeightAuditor -.->|Write verified data| StateStore
    TelemetryScore -.->|Commit telemetry metrics| StateStore
    AuditEngine -.->|Read store metadata| StateStore
    ViewModules <==>|Reactive Selectors| StateStore
    
    %% State persistence connection
    StateStore <==>|Reactive Sync| Broker
    Broker <==>|JSON Serialized I/O| LocalStorage

```

---

## 2. Reactive State Mutation & DOM-Swap Pipeline

Every single user event (e.g., modifying goal metric progress, switching cycle phases, adding comments, approving sheets) undergoes a strict visual-integrity loop:

```mermaid
sequenceDiagram
    autonumber
    actor User as Subordinate / Leader / Admin
    participant UI as Interactive UI (DOM View)
    participant Engine as Governance Engine (src/utils/engine.js)
    participant State as Memory Store (src/store/state.js)
    participant Storage as LocalStorage Database
    participant Router as SPA Router (window.navigate)

    User->>UI: Triggers action (e.g., Click "Approve Goal Sheet")
    UI->>Engine: Dispatches raw parameters & action variables
    
    activate Engine
    Note over Engine: Enforces business logic & weight totals (Sum == 100%)
    Engine->>Engine: Calculate updated telemetry scores
    Engine->>State: Calls setState(updatedStoreNode)
    deactivate Engine

    activate State
    Note over State: Re-binds active memory state nodes
    State->>Storage: Dispatches serialization trigger (persistState)
    Storage-->>State: Confirms local database transaction ('ascendra_state_v1' updated)
    State-->>Router: Dispatches state change event notification
    deactivate State

    activate Router
    Note over Router: Calls destroyCharts() to flush canvas handles
    Router->>UI: Re-renders swap template with fresh state properties
    Note over UI: Visuals updated in 12ms (Zero screen flicker)
    deactivate Router

```

---

## 3. Comprehensive Enterprise Governance Sequence Loop

This sequence diagram maps the standard planning cycle workflow: Employee drafting and submission, Manager governance and rework flows, and Administrative cycle lockdowns.

```mermaid
sequenceDiagram
    autonumber
    actor Emp as Employee (Morgan Blake)
    actor Mgr as Department Manager
    actor Admin as Platform Admin
    participant State as Local Store Engine
    participant SmartQ as Smart Intervention Queue

    %% Phase 1: Goal Drafting
    Note over Admin, State: Phase 1: Cycle Phase set to 'GOAL_SETTING' (Cycle Unlocked)
    Emp->>State: Adds new strategic goal (e.g., Target: 98% execution)
    Emp->>State: Saves goals in 'DRAFT' status
    
    %% Weight Check Trigger
    Emp->>State: Clicks 'Submit for Approval'
    Note over State: Performs mathematical weight audit
    alt Weight Total != 100%
        State-->>Emp: Enforces validation block (Goal sum must equal 100%)
    else Weight Total == 100%
        State->>State: Sets sheet status to 'SUBMITTED'
        State-->>Emp: Locks form inputs (opacity set to 0.5; pointer-events disabled)
        State->>SmartQ: Sweeps managers; Overload Check evaluates active reviews
    end

    %% Phase 2: Manager Review Loop
    Note over Mgr, State: Phase 2: Manager enters Review Terminal
    alt Goal Targets are Disproportionate
        Mgr->>State: Inputs rework comments & clicks 'Return for Rework'
        State->>State: Sets status to 'RETURNED'
        State-->>Emp: Unlocks form inputs in Employee panel with rework notes
    else Goal Targets Approved
        Mgr->>State: Clicks 'Approve Sheet'
        State->>State: Sets status to 'APPROVED'
        State-->>Emp: Locks sheet in final audited state
    end

    %% Phase 3: Lock-down
    Admin->>State: Shifts cycle phase to 'MID_QUARTER_REVIEW' & Sets 'cycleLocked: true'
    State->>State: Restricts all subordinate draft inputs globally
    alt User attempts Post-Audit modification
        Emp->>State: Modifies performance progress metrics
        State->>SmartQ: Flags event in Post-Lock Changes Audit
    end

```

---

## 4. Technical File Responsibility Matrix

The core mechanics are cleanly distributed across these files to maintain modularity:

| Module / File Path | Responsibility | Core Implementation Details |
| :--- | :--- | :--- |
| **[`src/store/state.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/store/state.js)** | Central Store & Persistence | Manages rehydration, contains the default seed data (60+ goals, 220+ logs), and handles `localStorage` saves under `ascendra_state_v1`. |
| **[`src/main.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/main.js)** | Application Bootstrapper & Routing | Binds navigation, compiles workspace shells (`buildShell`), handles role switching (`switchRole`), and drives DOM swaps (`window.navigate`). |
| **[`src/styles/dashboard.css`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/styles/dashboard.css)** | Executive Visual System | Custom grid classes (`.grid-60-40`, `.stat-grid`), glassmorphic card templates, custom colors, and transition scales. |
| **[`src/pages/GoalManagement.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/pages/GoalManagement.js)** | Subordinate Goal Console | Handles goal creation forms, checks that weights sum to `100%`, and disables inputs on submitted/approved locks. |
| **[`src/pages/ManagerReview.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/pages/ManagerReview.js)** | Manager Review Terminal | Allows department managers to examine team sheets, add review comments, approve forms, or trigger returns for rework. |
| **[`src/pages/HealthInspector.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/pages/HealthInspector.js)** | Smart Telemetry & Logs | Compiles real-time compliance telemetry across five automated structural integrity checks (Overdue, Overload, Conflicts, Rework, Post-Locks). |
| **[`src/pages/OrgTree.js`](file:///c:/Users/LAUKIK/Desktop/AtomBerg/src/pages/OrgTree.js)** | Reporting Hierarchy Map | Generates hierarchical reporting views with dynamic cards, live metrics badges, and quick-action side drawers. |
