import { getState } from '../store/state.js';
import { calculateProgressScore } from '../utils/engine.js';
import { SUBMISSION_STATUS } from '../utils/constants.js';

export const renderCompletionDashboard = () => {
  const { goalSheets, employees, system } = getState();
  const isGoalSetting = system.currentCycle === 'GOAL_SETTING';

  // Compute per-employee stats
  const empStats = employees.map(emp => {
    const sheet = goalSheets.find(s => s.employeeId === emp.id);
    if (!sheet) return { emp, sheet: null, progress: 0, status: 'NOT STARTED', goalCount: 0, checkinDone: false };

    let totalProgress = 0;
    sheet.goals.forEach(g => {
      totalProgress += calculateProgressScore(g) * (g.weight / 100);
    });

    const checkinKey = `${system.currentCycle}_submitted`;
    const checkinDone = !!sheet[checkinKey] || !!sheet.checkinComment;

    return {
      emp,
      sheet,
      progress: totalProgress,
      status: sheet.status,
      goalCount: sheet.goals.length,
      checkinDone,
      totalWeight: sheet.goals.reduce((s, g) => s + (Number(g.weight)||0), 0)
    };
  });

  const totalEmp    = empStats.length;
  const submitted   = empStats.filter(e => e.status === SUBMISSION_STATUS.SUBMITTED).length;
  const approved    = empStats.filter(e => e.status === SUBMISSION_STATUS.APPROVED).length;
  const checkedIn   = empStats.filter(e => e.checkinDone).length;
  const notStarted  = empStats.filter(e => !e.sheet || e.goalCount === 0).length;

  const completionPct = totalEmp > 0 ? Math.round((approved / totalEmp) * 100) : 0;
  const checkinPct    = totalEmp > 0 ? Math.round((checkedIn / totalEmp) * 100) : 0;

  return `
  <div>
    <div class="page-header-row">
      <div>
        <div class="page-breadcrumb">Ascendra › <span>Completion Dashboard</span></div>
        <div class="page-title">Completion Dashboard</div>
        <div class="page-sub">Real-time view of goal sheet completion and quarterly check-in status — ${system.currentCycle.replace('_',' ')} phase.</div>
      </div>
      <div class="flex gap-12">
        <button class="btn btn-ghost btn-sm" onclick="window.exportAchievementCSV()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.navigate('settings')">
          Manage Cycles
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="stat-grid mb-24">
      ${kpiCard('stat-card-blue',   totalEmp,    'Total Employees',      '👥', '')}
      ${kpiCard('stat-card-orange', submitted,   'Pending Approval',     '⏳', `${totalEmp > 0 ? Math.round((submitted/totalEmp)*100) : 0}% of team`)}
      ${kpiCard('stat-card-green',  approved,    'Approved & Locked',    '✅', `${completionPct}% completion`)}
      ${kpiCard('stat-card-pink',   notStarted,  'Not Yet Started',      '⚠️', `${totalEmp > 0 ? Math.round((notStarted/totalEmp)*100) : 0}% of team`)}
    </div>

    <!-- Progress Bars -->
    <div class="grid-2 mb-24">
      <div class="card card-p">
        <div class="flex items-center justify-between mb-16">
          <div class="section-title" style="margin:0;">Goal Sheet Completion</div>
          <span style="font-size:22px;font-weight:900;color:var(--primary);">${completionPct}%</span>
        </div>
        <div class="progress-bar-wrap" style="height:12px;margin-bottom:12px;">
          <div class="progress-bar-fill" style="width:${completionPct}%;background:linear-gradient(90deg,#6366F1,#8B5CF6);"></div>
        </div>
        <div class="flex justify-between text-xs text-muted font-bold">
          <span>${approved} Approved</span>
          <span>${submitted} Pending</span>
          <span>${notStarted} Not Started</span>
        </div>
      </div>

      <div class="card card-p">
        <div class="flex items-center justify-between mb-16">
          <div class="section-title" style="margin:0;">${isGoalSetting ? 'Submission Rate' : 'Check-in Completion'}</div>
          <span style="font-size:22px;font-weight:900;color:var(--success);">${isGoalSetting ? Math.round(((submitted+approved)/Math.max(totalEmp,1))*100) : checkinPct}%</span>
        </div>
        <div class="progress-bar-wrap" style="height:12px;margin-bottom:12px;">
          <div class="progress-bar-fill" style="width:${isGoalSetting ? Math.round(((submitted+approved)/Math.max(totalEmp,1))*100) : checkinPct}%;background:linear-gradient(90deg,#10B981,#14B8A6);"></div>
        </div>
        <div class="flex justify-between text-xs text-muted font-bold">
          ${isGoalSetting
            ? `<span>${submitted + approved} Submitted</span><span>${notStarted} Pending</span>`
            : `<span>${checkedIn} Checked In</span><span>${totalEmp - checkedIn} Pending</span>`}
        </div>
      </div>
    </div>

    <!-- Per-Employee Detail Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-title">Employee Status Matrix</div>
        <div class="flex items-center gap-8">
          <span class="live-dot"></span>
          <span class="text-xs font-bold" style="color:var(--success);">LIVE</span>
        </div>
      </div>
      <table class="tbl">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Goals</th>
            <th>Weight</th>
            <th>Sheet Status</th>
${!isGoalSetting ? '<th>Progress</th><th>Emp Check-in</th><th>Mgr Check-in</th>' : ''}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${empStats.map(({ emp, sheet, progress, status, goalCount, checkinDone, totalWeight }) => {
            const statusCls = status === SUBMISSION_STATUS.APPROVED ? 'success'
              : status === SUBMISSION_STATUS.SUBMITTED ? 'warning'
              : status === SUBMISSION_STATUS.RETURNED ? 'danger' : 'neutral';
            const barColor = progress >= 80 ? 'var(--success)' : progress >= 50 ? 'var(--warning)' : 'var(--danger)';

            return `
              <tr>
                <td>
                  <div class="flex items-center gap-10">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4F46E5&color=fff&size=32" style="width:32px;height:32px;border-radius:8px;flex-shrink:0;" />
                    <div>
                      <div style="font-weight:700;font-size:13px;">${emp.name}</div>
                      <div class="text-xs text-muted">${emp.role} • ${emp.dept}</div>
                    </div>
                  </div>
                </td>
                <td style="font-weight:700;">${goalCount} / 8</td>
                <td>
                  <span style="font-weight:700;color:${totalWeight===100?'var(--success)':totalWeight>0?'var(--warning)':'var(--muted)'};">
                    ${totalWeight}%
                  </span>
                </td>
                <td><span class="badge badge-${statusCls}">${status}</span></td>
                ${!isGoalSetting ? `
                  <td>
                    <div class="flex items-center gap-8">
                      <span style="font-weight:800;font-size:12px;color:${barColor};width:36px;">${progress.toFixed(0)}%</span>
                      <div class="progress-bar-wrap" style="flex:1;height:6px;min-width:60px;">
                        <div class="progress-bar-fill" style="width:${Math.min(progress,100)}%;background:${barColor};"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-${checkinDone ? 'success' : 'neutral'}">
                      ${checkinDone ? '✓ Done' : 'Pending'}
                    </span>
                  </td>` : ''}
                <td>
                  <div class="flex gap-6">
                    <button class="btn btn-ghost btn-sm" style="font-size:11px;"
                      onclick="window.navigate('team')">
                      View
                    </button>
                    ${status === SUBMISSION_STATUS.SUBMITTED ? `
                      <button class="btn btn-primary btn-sm" style="font-size:11px;"
                        onclick="window.navigate('team')">
                        Review
                      </button>` : ''}
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Thrust Area Breakdown -->
    ${renderThrustBreakdown(goalSheets, employees)}
  </div>`;
};

function renderThrustBreakdown(goalSheets, employees) {
  const areaMap = {};
  goalSheets.forEach(sheet => {
    sheet.goals.forEach(g => {
      const area = g.area || 'General';
      if (!areaMap[area]) areaMap[area] = { count: 0, totalWeight: 0, employees: new Set() };
      areaMap[area].count++;
      areaMap[area].totalWeight += Number(g.weight) || 0;
      areaMap[area].employees.add(sheet.employeeId);
    });
  });

  const areas = Object.entries(areaMap).sort((a, b) => b[1].count - a[1].count);
  if (areas.length === 0) return '';

  const maxCount = Math.max(...areas.map(([,v]) => v.count));
  const colors = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#14B8A6','#F472B6'];

  return `
    <div class="card mt-24">
      <div class="card-header">
        <div class="card-header-title">Goal Distribution by Thrust Area</div>
        <span class="text-xs text-muted">${areas.length} areas across all goal sheets</span>
      </div>
      <div style="padding:20px;">
        ${areas.map(([area, data], i) => {
          const pct = maxCount > 0 ? Math.round((data.count / maxCount) * 100) : 0;
          const color = colors[i % colors.length];
          return `
            <div style="margin-bottom:16px;">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-8">
                  <span style="width:10px;height:10px;border-radius:2px;background:${color};display:inline-block;flex-shrink:0;"></span>
                  <span style="font-weight:700;font-size:13px;">${area}</span>
                </div>
                <div class="flex items-center gap-12">
                  <span class="text-xs text-muted">${data.employees.size} employee${data.employees.size !== 1 ? 's' : ''}</span>
                  <span class="badge badge-neutral" style="font-size:10px;">${data.count} goal${data.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div class="progress-bar-wrap" style="height:8px;">
                <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

const kpiCard = (cls, val, label, icon, sub) => `
  <div class="stat-card ${cls}">
    <div class="flex items-center justify-between">
      <div class="stat-icon">${icon}</div>
    </div>
    <div>
      <div class="stat-label">${label}</div>
      <div class="stat-val" style="font-size:30px;">${val}</div>
      ${sub ? `<div class="stat-date">${sub}</div>` : ''}
    </div>
  </div>`;

