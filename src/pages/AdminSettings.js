import { getState, setState, clearPersistedState } from '../store/state.js';
import { CYCLE_SCHEDULE } from '../utils/constants.js';
import { SUBMISSION_STATUS } from '../utils/constants.js';
import { notifyCheckinReminder } from '../utils/notifications.js';

export const renderAdminSettings = () => {
  const { system, goalSheets, employees } = getState();
  const phases = [
    { id: 'GOAL_SETTING', label: 'Goal Setting', month: 'May', icon: '✏️' },
    { id: 'Q1',           label: 'Q1 Review',    month: 'July',    icon: '📊' },
    { id: 'Q2',           label: 'Q2 Review',    month: 'Oct',     icon: '🕐' },
    { id: 'Q3',           label: 'Q3 Review',    month: 'Jan',     icon: '📅' },
    { id: 'Q4',           label: 'Q4 Review',    month: 'Mar/Apr', icon: '💰' },
  ];

  const currentIdx = phases.findIndex(p => p.id === system.currentCycle);
  const totalEmployees = employees.filter(e => e.role !== 'ADMIN').length;
  const submitted = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length;
  const approved  = goalSheets.filter(s => s.status === SUBMISSION_STATUS.APPROVED).length;
  const pending   = totalEmployees - approved;

  return `
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Ascendra › <span>Platform Settings</span></div>
          <div class="page-title">Admin Control Center</div>
          <div class="page-sub">Global governance hub and cycle management for FY24 Performance Operations.</div>
        </div>
        <div class="flex gap-12">
          <button class="btn btn-ghost btn-sm" onclick="window.exportAchievementCSV()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.pushSharedGoal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Push Shared KPI
          </button>
        </div>
      </div>

      <!-- Completion Stats -->
      <div class="stat-grid mb-24">
        ${adminStat('stat-card-blue',   'Total Employees',   totalEmployees, '👥')}
        ${adminStat('stat-card-orange', 'Pending Approval',  submitted,      '⏳')}
        ${adminStat('stat-card-green',  'Goals Approved',    approved,       '✅')}
        ${adminStat('stat-card-pink',   'Not Yet Started',   pending - submitted, '⚠️')}
      </div>

      <!-- Cycle Timeline -->
      <div class="card card-p mb-24">
        <div class="flex items-center justify-between mb-24">
          <div>
            <div class="section-title" style="margin:0;">Enterprise Cycle Timeline</div>
            <div class="text-xs text-muted mt-4">BRD Section 2.3 — Click any phase to activate it for demo</div>
          </div>
          <span class="badge badge-success" style="font-size:12px;padding:6px 14px;">Active: ${system.currentCycle.replace('_',' ')}</span>
        </div>
        <!-- BRD Schedule Table -->
        <div style="margin-bottom:24px;overflow-x:auto;">
          <table class="tbl" style="font-size:12px;">
            <thead><tr><th>Period</th><th>Window Opens</th><th>Action</th><th>Status</th></tr></thead>
            <tbody>
              ${Object.entries(CYCLE_SCHEDULE).map(([id, s]) => {
                const isActive = system.currentCycle === id;
                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return `<tr style="background:${isActive ? 'var(--primary-light)' : ''};">
                  <td style="font-weight:700;">${s.label}</td>
                  <td>${monthNames[s.opensMonth]} ${s.opensDay}</td>
                  <td style="color:var(--muted);">${s.action}</td>
                  <td>${isActive
                    ? '<span class="badge badge-success">Active Now</span>'
                    : '<span class="badge badge-neutral">Inactive</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="flex items-center" style="padding:0 20px;overflow-x:auto;">
          ${phases.map((p, i) => {
            const isDone   = i < currentIdx;
            const isActive = i === currentIdx;
            return `
              ${i > 0 ? `<div style="flex:1;height:2px;background:${isDone ? 'var(--success)' : 'var(--border)'};margin-top:-36px;min-width:20px;"></div>` : ''}
              <div class="cycle-step" style="flex:none;width:100px;text-align:center;">
                <div class="cycle-node ${isDone ? 'done' : isActive ? 'active' : 'upcoming'}"
                     onclick="window.setSystemCycle('${p.id}')"
                     style="cursor:pointer;margin:0 auto;" title="Activate ${p.label}">
                  ${isDone ? '✓' : isActive ? '●' : p.icon}
                </div>
                <div class="cycle-label mt-8">
                  <b>${p.month}</b><br/>${p.label}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Dept Completion Rates -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-header-title">Completion Rates by Department</div>
          <span class="text-xs text-muted">Approved / Total employees per dept</span>
        </div>
        <div style="padding:16px 20px;">
          ${(() => {
            const depts = [...new Set(employees.filter(e => e.role !== 'ADMIN').map(e => e.dept))];
            return depts.map(dept => {
              const deptEmps = employees.filter(e => e.dept === dept && e.role !== 'ADMIN');
              const deptApproved = deptEmps.filter(e => {
                const s = goalSheets.find(gs => gs.employeeId === e.id);
                return s && s.status === SUBMISSION_STATUS.APPROVED;
              }).length;
              const pct = deptEmps.length ? Math.round((deptApproved / deptEmps.length) * 100) : 0;
              const barColor = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
              return `<div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span style="font-size:13px;font-weight:700;">${dept}</span>
                  <span style="font-size:12px;font-weight:800;color:${barColor};">${deptApproved}/${deptEmps.length} (${pct}%)</span>
                </div>
                <div class="progress-bar-wrap" style="height:8px;">
                  <div class="progress-bar-fill" style="width:${pct}%;background:${barColor};"></div>
                </div>
              </div>`;
            }).join('');
          })()}
        </div>
      </div>

      <!-- Exception Log -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-header-title">Exception Log</div>
          <span class="text-xs text-muted">Admin overrides & interventions</span>
        </div>
        <div style="max-height:200px;overflow-y:auto;">
          ${(() => {
            const exceptions = (getState().auditLogs || []).filter(l =>
              ['Admin Unlock','Global Reset','Shared Goal Push','Escalation Triggered'].includes(l.action)
            ).slice(0, 20);
            if (exceptions.length === 0) return '<div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">No exceptions logged</div>';
            return '<table class="tbl"><thead><tr><th>Action</th><th>By</th><th>Target</th><th>Time</th></tr></thead><tbody>' +
              exceptions.map(e => `<tr>
                <td><span class="badge badge-${e.action.includes('Reset') ? 'danger' : e.action.includes('Unlock') ? 'warning' : 'info'}" style="font-size:10px;">${e.action}</span></td>
                <td style="font-size:12px;font-weight:700;">${e.user}</td>
                <td style="font-size:12px;color:var(--muted);">${e.field}</td>
                <td style="font-size:11px;color:var(--muted);">${new Date(e.timestamp).toLocaleDateString()}</td>
              </tr>`).join('') +
              '</tbody></table>';
          })()}
        </div>
      </div>

      <div class="grid-60-40">
        <!-- Completion Matrix -->
        <div class="card">
          <div class="card-header">
            <div class="card-header-title">Completion Status Matrix</div>
            <span class="text-xs text-muted">${approved}/${totalEmployees} approved</span>
          </div>
          <table class="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goals</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const sheet = goalSheets.find(s => s.employeeId === emp.id);
                const status = sheet ? sheet.status : 'NOT STARTED';
                const statusCls = status === SUBMISSION_STATUS.APPROVED ? 'success'
                  : status === SUBMISSION_STATUS.SUBMITTED ? 'warning'
                  : status === SUBMISSION_STATUS.RETURNED ? 'danger' : 'neutral';
                const totalW = sheet ? sheet.goals.reduce((s, g) => s + (Number(g.weight)||0), 0) : 0;
                const canUnlock = status === SUBMISSION_STATUS.APPROVED || status === SUBMISSION_STATUS.SUBMITTED;
                return `
                  <tr>
                    <td>
                      <div class="flex items-center gap-8">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4F46E5&color=fff&size=28" style="width:28px;height:28px;border-radius:7px;" />
                        <div>
                          <div style="font-weight:700;font-size:13px;">${emp.name}</div>
                          <div class="text-xs text-muted">${emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>${sheet ? sheet.goals.length : 0} / 8</td>
                    <td><span style="font-weight:700;color:${totalW===100?'var(--success)':'var(--muted)'};">${totalW}%</span></td>
                    <td><span class="badge badge-${statusCls}">${status}</span></td>
                    <td>
                      ${canUnlock ? `
                        <button class="btn btn-ghost btn-sm" onclick="window.adminUnlockSheet('${emp.id}', '${emp.name}')" style="font-size:11px;">
                          🔓 Unlock
                        </button>` : ''}
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- System Governance -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card card-p">
            <div class="section-title">System Governance</div>
            <div class="alert-banner alert-info mb-16" style="padding:12px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div class="text-xs">Immutable audit logging is active for all overrides.</div>
            </div>
            <button class="btn btn-warning w-full mb-12" onclick="window.bulkUnlockSubmitted()" style="background:#FEF3C7;color:#92400E;border-color:#FDE68A;">
              Bulk Unlock All Submitted
            </button>
            <button class="btn btn-danger-o w-full mb-12" onclick="window.resetAllSheets()">
              ⚠️ Global Reset (Admin Only)
            </button>
            <button class="btn btn-ghost w-full mb-12" onclick="window.exportAuditCSV()">
              📥 Download Audit Log (CSV)
            </button>
            <button class="btn btn-ghost w-full mb-12" onclick="window.exportAchievementCSV()">
              📊 Download Achievement Report
            </button>
            <button class="btn btn-primary w-full" onclick="window.sendCheckinReminders()">
              📣 Send Check-in Reminders
            </button>
          </div>

          <!-- Shared Goals Registry -->
          <div class="card card-p">
            <div class="section-title">Shared Goals Registry</div>
            <div class="text-xs text-muted mb-16">Push a shared KPI to all active goal sheets. Recipients can only adjust weightage.</div>
            <div style="background:#F8FAFC;border-radius:10px;padding:12px;margin-bottom:12px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Zero Security Breaches</div>
              <div class="flex items-center gap-8">
                <span class="badge badge-neutral" style="font-size:9px;">Zero-based</span>
                <span class="badge badge-neutral" style="font-size:9px;">Target: 0 Incidents</span>
                <span class="badge badge-primary" style="font-size:9px;">SHARED KPI</span>
              </div>
            </div>
            <button class="btn btn-primary w-full" onclick="window.pushSharedGoal()">
              📢 Push to All Goal Sheets
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const adminStat = (cls, label, val, icon) => `
  <div class="stat-card ${cls}" style="min-height:110px;">
    <div class="flex items-center justify-between">
      <div class="stat-icon">${icon}</div>
    </div>
    <div>
      <div class="stat-label">${label}</div>
      <div class="stat-val" style="font-size:30px;">${Math.max(0, val)}</div>
    </div>
  </div>`;

window.pushSharedGoal = () => {
  const { goalSheets, employees, auditLogs, currentUser } = getState();
  const sharedGoal = {
    id: 'SEC-' + Date.now(),
    area: 'Governance',
    title: 'Zero Security Breaches',
    target: 0,
    uom: 'Zero-based',
    direction: 'Lower',
    weight: 10,
    achievement: 0,
    rationale: 'Org-wide security KPI — pushed by Admin',
    isShared: true,
    sharedId: 'KPI-SEC-01',
    goalStatus: 'Not Started'
  };

  // Only push to sheets that don't already have this shared goal
  const updatedSheets = goalSheets.map(sheet => {
    const alreadyHas = sheet.goals.some(g => g.sharedId === 'KPI-SEC-01');
    if (alreadyHas) return sheet;
    return { ...sheet, goals: [...sheet.goals, sharedGoal] };
  });

  setState({
    goalSheets: updatedSheets,
    auditLogs: [{
      id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Shared Goal Push', field: 'Zero Security Breaches',
      before: 'Not Assigned', after: 'All Sheets',
      reason: 'Admin pushed shared KPI to all goal sheets',
      timestamp: new Date().toISOString()
    }, ...auditLogs]
  });
  alert('Shared Security KPI pushed to all active goal sheets.');
  window.navigate('settings');
};

window.resetAllSheets = () => {
  if (!confirm('CRITICAL: This will reset ALL goal sheets to Draft mode and clear all saved data. This cannot be undone. Proceed?')) return;
  const { goalSheets, auditLogs, currentUser } = getState();
  const updatedSheets = goalSheets.map(s => ({
    ...s,
    status: SUBMISSION_STATUS.DRAFT,
    managerComment: 'Reset by Admin.',
    checkinComment: '',
    approvalComment: ''
  }));
  setState({
    goalSheets: updatedSheets,
    auditLogs: [{
      id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Global Reset', field: 'All Goal Sheets',
      before: 'Various', after: SUBMISSION_STATUS.DRAFT,
      reason: 'Admin initiated global reset',
      timestamp: new Date().toISOString()
    }, ...auditLogs]
  });
  clearPersistedState();
  alert('All goal sheets have been reset to Draft. Data cleared.');
  window.navigate('settings');
};

window.bulkUnlockSubmitted = () => {
  if (!confirm('Unlock all SUBMITTED goal sheets back to Draft? Employees will need to resubmit.')) return;
  const { goalSheets, auditLogs, currentUser } = getState();
  const toUnlock = goalSheets.filter(s => s.status === 'Submitted');
  if (toUnlock.length === 0) { alert('No submitted sheets to unlock.'); return; }
  const updatedSheets = goalSheets.map(s =>
    s.status === 'Submitted' ? { ...s, status: 'Draft', managerComment: 'Bulk unlocked by Admin.' } : s
  );
  setState({
    goalSheets: updatedSheets,
    auditLogs: [{ id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Admin Unlock', field: `Bulk — ${toUnlock.length} sheets`,
      before: 'Submitted', after: 'Draft',
      reason: 'Admin bulk unlock of submitted sheets',
      timestamp: new Date().toISOString() }, ...auditLogs]
  });
  alert(`${toUnlock.length} submitted sheet(s) unlocked back to Draft.`);
  window.navigate('settings');
};

window.adminUnlockSheet = (empId, empName) => {
  if (!confirm(`Unlock goal sheet for ${empName}? This will reset their status to Draft so they can edit goals.`)) return;
  const { goalSheets, auditLogs, currentUser } = getState();
  const sheet = goalSheets.find(s => s.employeeId === empId);
  const prevStatus = sheet?.status || 'Unknown';
  const updatedSheets = goalSheets.map(s =>
    s.employeeId === empId
      ? { ...s, status: SUBMISSION_STATUS.DRAFT, managerComment: 'Unlocked by Admin for revision.' }
      : s
  );
  setState({
    goalSheets: updatedSheets,
    auditLogs: [{
      id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Admin Unlock', field: `Goal Sheet — ${empName}`,
      before: prevStatus, after: SUBMISSION_STATUS.DRAFT,
      reason: 'Admin intervention — goal sheet unlocked for revision',
      timestamp: new Date().toISOString()
    }, ...auditLogs]
  });
  alert(`Goal sheet for ${empName} has been unlocked. They can now edit their goals.`);
  window.navigate('settings');
};

