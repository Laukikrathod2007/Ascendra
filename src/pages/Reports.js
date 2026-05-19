import { getState, setState } from '../store/state.js';
import { goalHealthScore } from '../utils/engine.js';

export const renderReports = () => {
  const { auditLogs = [], goalSheets = [], employees = [] } = getState();
  const activeTab = window.reportsActiveTab || 'audit';
  const filterRole = window.auditFilterRole || 'All';
  const searchQuery = window.auditSearchQuery || '';

  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = filterRole === 'All' || log.role === filterRole.toLowerCase();
    const matchesSearch = !searchQuery ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.field.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleColors = {
    system:   { bg: '#F1F5F9', text: '#6B7280' },
    hr:       { bg: '#EEF2FF', text: '#4F46E5' },
    security: { bg: '#FEF2F2', text: '#EF4444' },
    MANAGER:  { bg: '#EEF2FF', text: '#4F46E5' },
    ADMIN:    { bg: '#FEF2F2', text: '#EF4444' },
    EMPLOYEE: { bg: '#ECFDF5', text: '#10B981' },
  };

  return `
  <div>
    <!-- Page Header -->
    <div class="page-header-row">
      <div>
        <div class="page-breadcrumb">Ascendra › <span>Audit Logs</span></div>
        <div class="page-title">Governance Audit Trail</div>
        <div class="page-sub">Immutable, timestamped record of all system and user actions.</div>
      </div>
      <div class="flex gap-12">
        <button class="btn btn-ghost btn-sm" onclick="window.exportAuditCSV()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Audit CSV
        </button>
        <button class="btn btn-ghost btn-sm" onclick="window.exportAchievementCSV()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Achievement Report
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.exportAchievementCSV()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Generate Report
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs mb-24">
      <div class="tab ${activeTab === 'audit' ? 'active' : ''}" onclick="window.reportsActiveTab='audit';window.navigate('audit');">Audit Trail</div>
      <div class="tab ${activeTab === 'achievement' ? 'active' : ''}" onclick="window.reportsActiveTab='achievement';window.navigate('audit');">Achievement Report</div>
      <div class="tab ${activeTab === 'post-lock' ? 'active' : ''}" onclick="window.reportsActiveTab='post-lock';window.navigate('audit');">Post-Lock Changes</div>
    </div>

    ${activeTab === 'achievement' ? renderAchievementTable(goalSheets, employees) : ''}
    ${activeTab === 'post-lock' ? renderPostLockChanges(auditLogs) : ''}
    ${activeTab !== 'audit' ? '' : `

    <!-- Summary Stats -->
    <div class="stat-grid mb-24">
      ${miniStat('stat-card-blue',   'Total Events',    auditLogs.length)}
      ${miniStat('stat-card-green',  'Filtered Results', filteredLogs.length)}
      ${miniStat('stat-card-orange', 'Unique Users',    [...new Set(auditLogs.map(l => l.user))].length)}
      ${miniStat('stat-card-pink',   'Today\'s Events', auditLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length)}
    </div>

    <!-- Filters -->
    <div class="card card-p mb-24">
      <div class="flex gap-16 items-center" style="flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div class="nb-search" style="max-width:100%;">
            <span class="nb-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input class="form-control" style="padding-left:36px;" placeholder="Search by user, action, or field..."
              value="${searchQuery}"
              oninput="window.handleAuditSearch(this.value)" />
          </div>
        </div>
        <select class="form-control" style="width:160px;" onchange="window.handleAuditFilter(this.value)">
          <option ${filterRole === 'All' ? 'selected' : ''} value="All">All Roles</option>
          <option ${filterRole === 'System' ? 'selected' : ''} value="System">System</option>
          <option ${filterRole === 'HR' ? 'selected' : ''} value="HR">HR</option>
          <option ${filterRole === 'Security' ? 'selected' : ''} value="Security">Security</option>
          <option ${filterRole === 'Admin' ? 'selected' : ''} value="Admin">Admin</option>
        </select>
        <input class="form-control" type="date" style="width:160px;" />
        <button class="btn btn-ghost btn-sm" onclick="window.auditFilterRole='All';window.auditSearchQuery='';window.navigate('audit');">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Audit Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-title">Audit Log Entries (${filteredLogs.length})</div>
        <div class="flex items-center gap-8">
          <span class="live-dot"></span>
          <span class="text-xs font-bold" style="color:var(--success);">LIVE</span>
        </div>
      </div>

      ${filteredLogs.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No results found</div>
          <div class="empty-state-sub">Try adjusting your search or filter criteria.</div>
        </div>
      ` : `
        <table class="tbl">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Field / Target</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => {
              const rc = roleColors[log.role] || roleColors.system;
              const d = new Date(log.timestamp);
              return `
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;color:var(--muted);">${d.toLocaleDateString()}</div>
                    <div style="font-size:12px;font-weight:700;color:var(--text);">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td>
                    <div class="flex items-center gap-8">
                      <div style="width:28px;height:28px;border-radius:8px;background:${rc.bg};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:${rc.text};flex-shrink:0;">
                        ${log.user.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style="font-weight:700;font-size:13px;">${log.user}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" style="font-size:9px;background:${rc.bg};color:${rc.text};">
                      ${(log.role || 'system').toUpperCase()}
                    </span>
                  </td>
                  <td style="font-weight:700;font-size:13px;">${log.action}</td>
                  <td style="color:var(--primary);font-weight:600;font-size:13px;">${log.field}</td>
                  <td style="font-size:12px;color:var(--muted);max-width:200px;">${log.reason}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      `}
    </div>
  </div>
    `}
  </div>`;
};

function renderAchievementTable(goalSheets, employees) {
  const rows = [];
  goalSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId);
    if (!emp) return;
    sheet.goals.forEach(g => {
      const t = Number(g.target) || 0;
      const a = Number(g.achievement) || 0;
      const score = t > 0 ? Math.min((a / t) * 100, 150).toFixed(1) : '0';
      const barColor = Number(score) >= 80 ? 'var(--success)' : Number(score) >= 50 ? 'var(--warning)' : 'var(--danger)';
      rows.push({ emp, sheet, g, score, barColor });
    });
  });

  if (rows.length === 0) return `<div class="card"><div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No achievement data yet</div><div class="empty-state-sub">Employees need to submit goals and enter achievements first.</div></div></div>`;

  return `
    <div class="card mb-24">
      <div class="card-header">
        <div class="card-header-title">Achievement Report — Planned vs Actual</div>
        <button class="btn btn-primary btn-sm" onclick="window.exportAchievementCSV()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>
      <table class="tbl">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Dept</th>
            <th>Goal</th>
            <th>Thrust Area</th>
            <th>UoM</th>
            <th>Planned Target</th>
            <th>Actual Achievement</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(({ emp, sheet, g, score, barColor }) => `
            <tr>
              <td>
                <div style="font-weight:700;font-size:13px;">${emp.name}</div>
                <div style="font-size:11px;color:var(--muted);">${emp.team}</div>
              </td>
              <td style="font-size:12px;color:var(--muted);">${emp.dept}</td>
              <td style="font-weight:600;font-size:13px;max-width:160px;">${g.title}</td>
              <td><span class="badge badge-primary" style="font-size:9px;">${g.area}</span></td>
              <td><span class="badge badge-neutral" style="font-size:9px;">${g.uom}</span></td>
              <td style="font-weight:800;color:var(--text);">${g.target}</td>
              <td style="font-weight:800;color:var(--primary);">${g.achievement || 0}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-weight:800;font-size:12px;color:${barColor};width:38px;">${score}%</span>
                  <div class="progress-bar-wrap" style="flex:1;height:6px;min-width:60px;">
                    <div class="progress-bar-fill" style="width:${Math.min(Number(score),100)}%;background:${barColor};"></div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-${g.goalStatus === 'Completed' ? 'success' : g.goalStatus === 'On Track' ? 'info' : 'neutral'}">${g.goalStatus || 'Not Started'}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderPostLockChanges(auditLogs) {
  // BRD: show all changes made after goal lock date
  const postLockActions = ['Quarterly Update', 'Admin Unlock', 'Shared Sync', 'Check-in Comment', 'Escalation Triggered'];
  const postLockLogs = auditLogs.filter(l => postLockActions.includes(l.action));

  if (postLockLogs.length === 0) return `<div class="card"><div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">No post-lock changes</div><div class="empty-state-sub">All changes made after goal approval will appear here.</div></div></div>`;

  return `
    <div class="card mb-24">
      <div class="card-header">
        <div class="card-header-title">Post-Lock Changes</div>
        <span class="text-xs text-muted">${postLockLogs.length} changes after goal lock</span>
      </div>
      <table class="tbl">
        <thead>
          <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Field / Target</th><th>Before</th><th>After</th><th>Reason</th></tr>
        </thead>
        <tbody>
          ${postLockLogs.map(log => {
            const d = new Date(log.timestamp);
            const actionColor = log.action === 'Admin Unlock' ? 'var(--danger)' : log.action === 'Quarterly Update' ? 'var(--primary)' : 'var(--warning)';
            return `<tr>
              <td style="font-size:11px;font-weight:700;color:var(--muted);">${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
              <td style="font-weight:700;font-size:13px;">${log.user}</td>
              <td><span style="font-size:11px;font-weight:800;color:${actionColor};">${log.action}</span></td>
              <td style="color:var(--primary);font-weight:600;font-size:12px;">${log.field}</td>
              <td style="font-size:12px;color:var(--muted);">${log.before || '-'}</td>
              <td style="font-size:12px;font-weight:700;">${log.after || '-'}</td>
              <td style="font-size:11px;color:var(--muted);max-width:160px;">${log.reason || ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

const miniStat = (cls, label, val) => `
  <div class="stat-card ${cls}" style="min-height:100px;">
    <div class="stat-label">${label}</div>
    <div class="stat-val" style="font-size:28px;">${val}</div>
  </div>`;

window.handleAuditSearch = (val) => {
  window.auditSearchQuery = val;
  window.navigate('audit');
};

window.handleAuditFilter = (role) => {
  window.auditFilterRole = role;
  window.navigate('audit');
};

// ── REAL CSV EXPORT ───────────────────────────────────────────────
const downloadCSV = (filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

window.exportAuditCSV = () => {
  const { auditLogs } = getState();
  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Field', 'Before', 'After', 'Reason'];
  const rows = auditLogs.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.user, log.role, log.action, log.field,
    log.before || '', log.after || '', log.reason || ''
  ]);
  downloadCSV('ascendra-audit-log.csv', headers, rows);
};

window.exportAchievementCSV = () => {
  const { goalSheets, employees } = getState();
  const headers = ['Employee', 'Employee ID', 'Department', 'Team', 'Goal Title', 'Thrust Area', 'UoM', 'Direction', 'Target', 'Achievement', 'Progress %', 'Goal Status', 'Weight %', 'Sheet Status', 'Health'];
  const rows = [];
  goalSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId);
    if (!emp) return;
      sheet.goals.forEach(g => {
      const t = Number(g.target) || 0;
      const a = Number(g.achievement) || 0;
      const score = t > 0 ? Math.min((a / t) * 100, 150).toFixed(1) : '0';
      rows.push([
        emp.name, emp.id, emp.dept, emp.team,
        g.title, g.area, g.uom || '%', g.direction || 'Higher',
        g.target, g.achievement || 0, score,
        g.goalStatus || 'Not Started', g.weight, sheet.status
        , goalHealthScore(g, sheet)
      ]);
    });
  });
  if (rows.length === 0) return alert('No goal data to export yet.');
  downloadCSV('ascendra-achievement-report.csv', headers, rows);
};

// Export team-specific achievement CSV for a manager's team
window.exportTeamAchievementCSV = (managerId) => {
  const { goalSheets, employees } = getState();
  const manager = employees.find(e => e.id === managerId);
  if (!manager) return alert('Manager not found');
  const teamMembers = employees.filter(e => e.managerId === managerId).map(e => e.id);
  const headers = ['Employee', 'Employee ID', 'Department', 'Team', 'Goal Title', 'Thrust Area', 'UoM', 'Direction', 'Target', 'Achievement', 'Progress %', 'Goal Status', 'Weight %', 'Sheet Status', 'Health'];
  const rows = [];
  goalSheets.forEach(sheet => {
    if (!teamMembers.includes(sheet.employeeId)) return;
    const emp = employees.find(e => e.id === sheet.employeeId);
    if (!emp) return;
    sheet.goals.forEach(g => {
      const t = Number(g.target) || 0;
      const a = Number(g.achievement) || 0;
      const score = t > 0 ? Math.min((a / t) * 100, 150).toFixed(1) : '0';
      rows.push([
        emp.name, emp.id, emp.dept, emp.team,
        g.title, g.area, g.uom || '%', g.direction || 'Higher',
        g.target, g.achievement || 0, score,
        g.goalStatus || 'Not Started', g.weight, sheet.status,
        goalHealthScore(g, sheet)
      ]);
    });
  });
  if (rows.length === 0) return alert('No team goal data to export yet.');
  downloadCSV(`team-achievement-report-${manager?.name || managerId}.csv`, headers, rows);
};

