/**
 * Ascendra — Frontend Notification Utility
 *
 * Calls the local notification server (server/notify.js) which uses Resend
 * to send emails. All calls are fire-and-forget — a failure never blocks
 * the main app workflow.
 */

const NOTIFY_URL = 'http://localhost:3001';

// ── INTERNAL HELPER ───────────────────────────────────────────────
async function post(endpoint, payload) {
  try {
    const res = await fetch(`${NOTIFY_URL}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.skipped) {
      console.info(`[Ascendra Notify] Email skipped (no API key) — ${endpoint}`);
    }
    return data;
  } catch (err) {
    // Server is offline or unreachable — log quietly, never throw
    console.warn(`[Ascendra Notify] Server unreachable (${endpoint}). Is server/notify.js running?`);
    return null;
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────

/**
 * Notify the manager that an employee has submitted their goal sheet.
 * @param {object} employee  - { name, email }
 * @param {object} manager   - { name, email }
 * @param {number} goalCount - number of goals in the sheet
 * @param {number} totalWeight - total weightage (should be 100)
 */
export async function notifySubmission(employee, manager, goalCount, totalWeight) {
  return post('/notify/submission', {
    employeeName:  employee.name,
    employeeEmail: employee.email,
    managerName:   manager.name,
    managerEmail:  manager.email,
    goalCount,
    totalWeight,
  });
}

/**
 * Notify the employee that their goal sheet has been approved.
 * @param {object} employee - { name, email }
 * @param {object} manager  - { name, email }
 * @param {string} comment  - optional approval comment
 * @param {number} goalCount
 */
export async function notifyApproval(employee, manager, comment, goalCount) {
  return post('/notify/approval', {
    employeeName:  employee.name,
    employeeEmail: employee.email,
    managerName:   manager.name,
    comment:       comment || '',
    goalCount,
  });
}

/**
 * Notify the employee that their goal sheet has been returned for rework.
 * @param {object} employee - { name, email }
 * @param {object} manager  - { name, email }
 * @param {string} comment  - mandatory rework feedback
 */
export async function notifyReturn(employee, manager, comment) {
  return post('/notify/return', {
    employeeName:  employee.name,
    employeeEmail: employee.email,
    managerName:   manager.name,
    comment,
  });
}

/**
 * Send a quarterly check-in reminder to an employee.
 * @param {object} employee - { name, email }
 * @param {string} quarter  - e.g. 'Q1', 'Q2'
 * @param {string} deadline - optional deadline string
 */
export async function notifyCheckinReminder(employee, quarter, deadline = '') {
  return post('/notify/checkin-reminder', {
    employeeName:  employee.name,
    employeeEmail: employee.email,
    quarter,
    deadline,
  });
}

/**
 * Send an escalation email to an overdue employee.
 * @param {object} employee   - { name, email }
 * @param {object} admin      - { name }
 * @param {number} daysOverdue
 */
export async function notifyEscalation(employee, admin, daysOverdue) {
  return post('/notify/escalation', {
    employeeName:  employee.name,
    employeeEmail: employee.email,
    adminName:     admin.name,
    daysOverdue,
  });
}
