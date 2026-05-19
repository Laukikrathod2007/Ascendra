import { ROLES, SUBMISSION_STATUS } from '../utils/constants.js';

// ── STORAGE KEY ───────────────────────────────────────────────────
const STORAGE_KEY = 'ascendra_state_v1';

// ── INITIAL (SEED) STATE ──────────────────────────────────────────
// Generate a richer seed dataset programmatically so demo flows and
// analytics pages have realistic data without committing a huge static
// array of literals.
const now = Date.now();
const days = (n) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();

// Departments and managers
const ADM = { id: 'ADM-001', name: 'Admin User', email: 'admin@ascendra.demo', role: ROLES.ADMIN, managerId: null, dept: 'Operations', team: 'Platform' };
const MGR_SALES = { id: 'MGR-001', name: 'Morgan Blake', email: 'morgan.blake@ascendra.demo', role: ROLES.MANAGER, managerId: 'ADM-001', dept: 'Sales', team: 'Sales Leadership' };
const MGR_OPS   = { id: 'MGR-002', name: 'Priya Singh',  email: 'priya.singh@ascendra.demo',    role: ROLES.MANAGER, managerId: 'ADM-001', dept: 'Operations', team: 'Ops Leadership' };
const MGR_HR    = { id: 'MGR-003', name: 'Daniel Park',  email: 'daniel.park@ascendra.demo',    role: ROLES.MANAGER, managerId: 'ADM-001', dept: 'Human Resources', team: 'People Ops' };

// 12 employees: 4 per department
const EMPLOYEES = [
  { id: 'EMP-001', name: 'Alex Chen',     email: 'alex.chen@ascendra.demo',     role: ROLES.EMPLOYEE, managerId: 'MGR-001', dept: 'Sales',  team: 'Enterprise' },
  { id: 'EMP-002', name: 'Sarah Miller',  email: 'sarah.miller@ascendra.demo',  role: ROLES.EMPLOYEE, managerId: 'MGR-001', dept: 'Sales',  team: 'SMB' },
  { id: 'EMP-003', name: 'Ravi Patel',    email: 'ravi.patel@ascendra.demo',    role: ROLES.EMPLOYEE, managerId: 'MGR-001', dept: 'Sales',  team: 'Channels' },
  { id: 'EMP-004', name: 'Maria Lopez',   email: 'maria.lopez@ascendra.demo',   role: ROLES.EMPLOYEE, managerId: 'MGR-001', dept: 'Sales',  team: 'Direct' },

  { id: 'EMP-005', name: 'Samir Khan',    email: 'samir.khan@ascendra.demo',    role: ROLES.EMPLOYEE, managerId: 'MGR-002', dept: 'Operations', team: 'Fulfillment' },
  { id: 'EMP-006', name: 'Olivia Reed',   email: 'olivia.reed@ascendra.demo',   role: ROLES.EMPLOYEE, managerId: 'MGR-002', dept: 'Operations', team: 'Logistics' },
  { id: 'EMP-007', name: 'Chen Wei',      email: 'chen.wei@ascendra.demo',      role: ROLES.EMPLOYEE, managerId: 'MGR-002', dept: 'Operations', team: 'SRE' },
  { id: 'EMP-008', name: 'Lisa Brown',    email: 'lisa.brown@ascendra.demo',    role: ROLES.EMPLOYEE, managerId: 'MGR-002', dept: 'Operations', team: 'Procurement' },

  { id: 'EMP-009', name: 'Tomás García',  email: 'tomas.garcia@ascendra.demo',  role: ROLES.EMPLOYEE, managerId: 'MGR-003', dept: 'Human Resources', team: 'Talent' },
  { id: 'EMP-010', name: 'Aisha Mohammed',email: 'aisha.mohammed@ascendra.demo',role: ROLES.EMPLOYEE, managerId: 'MGR-003', dept: 'Human Resources', team: 'L&D' },
  { id: 'EMP-011', name: 'Noah Kim',      email: 'noah.kim@ascendra.demo',      role: ROLES.EMPLOYEE, managerId: 'MGR-003', dept: 'Human Resources', team: 'Rewards' },
  { id: 'EMP-012', name: 'Emma Wilson',   email: 'emma.wilson@ascendra.demo',   role: ROLES.EMPLOYEE, managerId: 'MGR-003', dept: 'Human Resources', team: 'HR Ops' }
];

const allEmployees = [ADM, MGR_SALES, MGR_OPS, MGR_HR, ...EMPLOYEES];

// Goal templates per department
const SALES_GOALS = [
  { area: 'Revenue', title: 'Increase regional revenue', uom: 'Numeric' },
  { area: 'Pipeline', title: 'Improve pipeline conversion', uom: 'Percentage' },
  { area: 'Retention', title: 'Improve client retention rate', uom: 'Percentage' },
  { area: 'Acct Mgmt', title: 'Grow average deal size', uom: 'Numeric' },
  { area: 'Coverage', title: 'Increase sales outreach', uom: 'Numeric' }
];

const OPS_GOALS = [
  { area: 'TAT', title: 'Reduce turnaround time', uom: 'Numeric', direction: 'Lower' },
  { area: 'Cost', title: 'Optimize fulfillment cost', uom: 'Numeric', direction: 'Lower' },
  { area: 'Compliance', title: 'Improve process compliance', uom: 'Percentage' },
  { area: 'Reliability', title: 'Reduce incidents', uom: 'Numeric', direction: 'Lower' },
  { area: 'Throughput', title: 'Increase throughput per shift', uom: 'Numeric' }
];

const HR_GOALS = [
  { area: 'Hiring', title: 'Reduce time-to-hire', uom: 'Numeric', direction: 'Lower' },
  { area: 'Training', title: 'Increase training completion', uom: 'Percentage' },
  { area: 'Attrition', title: 'Reduce attrition rate', uom: 'Percentage' },
  { area: 'Quality', title: 'Improve offer acceptance', uom: 'Percentage' },
  { area: 'Engagement', title: 'Increase engagement survey score', uom: 'Numeric' }
];

// create 5 goals per employee to reach ~60 goals total
let gid = 1001;
const goalSheets = EMPLOYEES.map(emp => {
  const isSales = emp.dept === 'Sales';
  const templates = isSales ? SALES_GOALS : emp.dept === 'Operations' ? OPS_GOALS : HR_GOALS;
  const goals = templates.map((t, i) => {
    const target = t.uom === 'Percentage' ? 80 + i : (t.uom === 'Numeric' ? (i + 3) * 10 : 1);
    // Stagger achievements so some are behind, some ahead
    const achievement = Math.max(0, Math.round(target * (0.2 + Math.random() * 1.2)));
    const createdAgo = Math.floor(Math.random() * 60); // days ago
    const lastUpdatedAgo = Math.floor(Math.random() * 40);
    return {
      id: gid++,
      area: t.area,
      title: t.title,
      target,
      uom: t.uom,
      direction: t.direction || 'Higher',
      weight: 20, // simple distribution
      achievement,
      rationale: `${t.title} to support department objectives`,
      goalStatus: achievement >= target ? 'Completed' : achievement >= (target * 0.6) ? 'On Track' : 'Not Started',
      createdAt: days(createdAgo + 30),
      lastUpdatedAt: days(lastUpdatedAgo)
    };
  });

  // Randomize sheet status across draft/submitted/approved; ensure some returned/unlocked cases
  const rnd = Math.random();
  let status = SUBMISSION_STATUS.DRAFT;
  if (rnd > 0.7) status = SUBMISSION_STATUS.APPROVED;
  else if (rnd > 0.4) status = SUBMISSION_STATUS.SUBMITTED;

  return {
    employeeId: emp.id,
    status,
    submittedAt: status === SUBMISSION_STATUS.SUBMITTED || status === SUBMISSION_STATUS.APPROVED ? days(20 + Math.floor(Math.random()*10)) : null,
    goals,
    history: [],
    managerComment: '',
    checkinComment: '',
  };
});

// Inject specific failure cases as requested
// 2 overdue goals: mark two goals' lastUpdatedAt far in past and low achievement
goalSheets[0].goals[0].lastUpdatedAt = days(60);
goalSheets[1].goals[1].lastUpdatedAt = days(75);
goalSheets[0].goals[0].achievement = 0; // overdue
goalSheets[1].goals[1].achievement = 5;

// 2 escalated employees: add audit escalation entries for their sheets
const escalatedEmployees = [goalSheets[2].employeeId, goalSheets[3].employeeId];

// 1 overloaded manager: make MGR-002 have many pending submissions
for (let i = 4; i < 8; i++) { goalSheets[i].status = SUBMISSION_STATUS.SUBMITTED; }

// 1 shared-goal conflict: create a shared goal with different targets for two employees
const sharedId = 'KPI-SH-01';
const sharedGoalDef = { title: 'Shared: Reduce Customer Escapes', target: 0, uom: 'Zero-based', weight: 10, type: 'Shared' };
const s1 = { id: gid++, area: 'Customer', title: 'Shared: Reduce Customer Escapes', target: 0, uom: 'Zero-based', direction: 'Lower', weight: 10, achievement: 1, sharedId };
const s2 = { id: gid++, area: 'Customer', title: 'Shared: Reduce Customer Escapes', target: 2, uom: 'Zero-based', direction: 'Lower', weight: 10, achievement: 0, sharedId };
goalSheets[0].goals.push(s1);
goalSheets[4].goals.push(s2);

// 1 returned goal: set sheet status returned and managerComment
goalSheets[5].status = SUBMISSION_STATUS.RETURNED;
goalSheets[5].managerComment = 'Please correct targets and resubmit.';

// 1 unlocked goal: simulate an approval then an unlock audit entry
goalSheets[6].status = SUBMISSION_STATUS.APPROVED;

// Build audit logs (200+ events) with mix of actions
const actions = ['Created', 'Edited', 'Returned', 'Approved', 'Escalation Triggered', 'Shared Sync', 'Unlocked', 'Exported', 'Check-in Comment'];
const auditLogs = [];
let aid = 2001;
for (let i = 0; i < 220; i++) {
  const actorPool = [ADM, MGR_SALES, MGR_OPS, MGR_HR, ...EMPLOYEES];
  const actor = actorPool[Math.floor(Math.random() * actorPool.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const targetSheet = goalSheets[Math.floor(Math.random() * goalSheets.length)];
  const field = targetSheet ? `${targetSheet.employeeId}` : 'System';
  const reason = `${action} for ${field}`;
  const ts = days(Math.floor(Math.random() * 120));
  auditLogs.push({ id: aid++, timestamp: ts, user: actor.name, role: actor.role === ROLES.EMPLOYEE ? 'employee' : actor.role === ROLES.MANAGER ? 'manager' : 'admin', action, field, before: '', after: '', reason });
}

// Add explicit escalations for the escalated employees
escalatedEmployees.forEach(empId => {
  auditLogs.unshift({ id: aid++, timestamp: days(5), user: 'System', role: 'system', action: 'Escalation Triggered', field: empId, before: '', after: '', reason: `Auto-escalation for ${empId}` });
});

// Notifications seed
const notifications = [];
const notifTypes = ['Submission','Approval','Reminder','Escalation','Shared Sync'];
for (let i = 0; i < 60; i++) {
  const nActor = EMPLOYEES[i % EMPLOYEES.length];
  notifications.push({ id: `N-${3000+i}`, user: nActor.name, type: notifTypes[i % notifTypes.length], message: `${notifTypes[i % notifTypes.length]} for ${nActor.name}`, read: Math.random() > 0.6, timestamp: days(Math.floor(Math.random()*30)) });
}

const initialState = {
  isAuthenticated: true,
  currentUser: MGR_SALES,
  system: { currentCycle: 'GOAL_SETTING', cycleLocked: false },
  employees: allEmployees,
  goalSheets,
  sharedGoalsRegistry: { [sharedId]: sharedGoalDef },
  auditLogs,
  notifications
};

// ── PERSISTENCE HELPERS ───────────────────────────────────────────

/**
 * Load persisted state from localStorage.
 * Returns null if nothing is stored or if the stored data is corrupt.
 */
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic sanity check — must have the core keys
    if (!parsed.employees || !parsed.goalSheets || !parsed.system) return null;
    return parsed;
  } catch (e) {
    console.warn('[Ascendra] Failed to load persisted state:', e);
    return null;
  }
}

/**
 * Save current state to localStorage.
 * Skips saving if localStorage is unavailable (e.g. private browsing quota exceeded).
 */
function persistState(stateToSave) {
  try {
    // Persist everything including currentUser so role switch survives refresh
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.warn('[Ascendra] Failed to persist state (storage full?):', e);
  }
}

/**
 * Merge persisted state with initial state.
 * Persisted data wins for goalSheets, auditLogs, system, sharedGoalsRegistry.
 * employees always comes from initialState (source of truth for org structure).
 */
function buildInitialState() {
  const persisted = loadPersistedState();
  if (!persisted) return { ...initialState };

  return {
    ...initialState,
    // Restore mutable data from storage
    goalSheets:          persisted.goalSheets          ?? initialState.goalSheets,
    auditLogs:           persisted.auditLogs           ?? initialState.auditLogs,
    system:              persisted.system              ?? initialState.system,
    sharedGoalsRegistry: persisted.sharedGoalsRegistry ?? initialState.sharedGoalsRegistry,
    // employees always from seed (org structure is not user-editable in this app)
    employees: initialState.employees,
    // Restore last-used role if persisted, otherwise default to MGR-001
    currentUser: persisted.currentUser
      ? (initialState.employees.find(e => e.id === persisted.currentUser.id) || initialState.currentUser)
      : initialState.currentUser,
  };
}

// ── STATE STORE ───────────────────────────────────────────────────
let state = buildInitialState();
const listeners = new Set();

export const getState = () => state;

export const setState = (newState) => {
  state = { ...state, ...newState };
  persistState(state);           // ← auto-save on every state change
  listeners.forEach(l => l(state));
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Hard-reset: clears localStorage and reloads the page.
 * Exposed on window so the Admin "Global Reset" can optionally call it.
 */
export const clearPersistedState = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
};

// Expose for admin use
if (typeof window !== 'undefined') {
  window.__clearAscendraData = () => {
    clearPersistedState();
    window.location.reload();
  };
}
