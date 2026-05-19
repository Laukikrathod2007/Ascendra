import { getState, setState } from '../store/state.js';
import { approveGoalSheet, calculateProgressScore, goalHealthScore } from '../utils/engine.js';
import { SUBMISSION_STATUS } from '../utils/constants.js';
import { notifyApproval, notifyReturn, notifyCheckinReminder, notifyEscalation } from '../utils/notifications.js';

import { pageHeader } from '../components/UI.js';

export const renderManagerReview = (selectedEmpId) => {
  const { goalSheets, employees, system } = getState();
  const isGoalSettingPhase = system.currentCycle === 'GOAL_SETTING';

  if (isGoalSettingPhase) {
    return renderApprovalWorkbench(goalSheets, employees, selectedEmpId);
  } else {
    return renderQuarterlyCheckin(goalSheets, employees, system);
  }
};

// ── GOAL SETTING PHASE: Approval Workbench ────────────────────────
function renderApprovalWorkbench(goalSheets, employees, selectedEmpId) {
  // Show all submitted sheets as a queue; drill into one if selectedEmpId is set
  const submittedSheets = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED);
  const activeSheet = selectedEmpId
    ? goalSheets.find(s => s.employeeId === selectedEmpId)
    : submittedSheets[0] || null;

  // Always show the full team queue at the top
  const { currentUser } = getState();
  const teamSheets = goalSheets.filter(s => {
    const emp = employees.find(e => e.id === s.employeeId);
    if (!emp || emp.role === 'ADMIN') return false;
    // Manager sees all employees (or filter by managerId if needed)
    return true;
  });

  if (!activeSheet) {

    return `
      <div>
        ${pageHeader({ breadcrumb: 'Ascendra › <span>Team Governance</span>', title: 'Team Governance', sub: 'Goal Setting Phase — Review and approve submitted goal sheets.' })}
        ${submittedSheets.length === 0 ? `
          <div class="alert-banner alert-success mb-20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>All caught up! No goal sheets pending review.</span>
          </div>` : `
          <div class="alert-banner alert-warning mb-20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span><strong>${submittedSheets.length} goal sheet(s)</strong> pending your review. Click a row to review.</span>
          </div>`}
        <div class="card">
          <div class="card-header">
            <div class="card-header-title">Team Goal Sheet Status</div>
            <span class="badge badge-neutral" style="font-size:11px;">${teamSheets.length} members</span>
          </div>
          <table class="tbl">
            <thead><tr><th>Employee</th><th>Dept</th><th>Goals</th><th>Weight</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${teamSheets.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);">No team members found</td></tr>' :
              teamSheets.map(s => {
                const emp = employees.find(e => e.id === s.employeeId);
                const tw = s.goals.reduce((sum, g) => sum + (Number(g.weight)||0), 0);
                const sc = s.status === SUBMISSION_STATUS.APPROVED ? 'success' : s.status === SUBMISSION_STATUS.SUBMITTED ? 'warning' : s.status === SUBMISSION_STATUS.RETURNED ? 'danger' : 'neutral';
                const canReview = s.status === SUBMISSION_STATUS.SUBMITTED;
                const initials = (emp?.name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                const avatarColors = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6'];
                const color = avatarColors[Math.abs(s.employeeId.charCodeAt(4) || 0) % avatarColors.length];
                return `<tr style="cursor:${canReview?'pointer':'default'};" ${canReview ? `onclick="window.reviewSheet('${s.employeeId}')"` : ''}>
                  <td>
                    <div class="flex items-center gap-10">
                      <div style="width:32px;height:32px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;">${initials}</div>
                      <div>
                        <div style="font-weight:700;font-size:13px;">${emp?.name || s.employeeId}</div>
                        <div style="font-size:11px;color:var(--muted);">${emp?.team || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:12px;color:var(--muted);">${emp?.dept || '-'}</td>
                  <td style="font-weight:700;">${s.goals.length} / 8</td>
                  <td><span style="font-weight:800;color:${tw===100?'var(--success)':'var(--danger)'};">${tw}%</span></td>
                  <td><span class="badge badge-${sc}">${s.status}</span></td>
                  <td>
                    ${canReview ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.reviewSheet('${s.employeeId}')">Review</button>` :
                      s.status === SUBMISSION_STATUS.APPROVED ? '<span style="color:var(--success);font-size:12px;font-weight:700;">Approved</span>' :
                      s.status === SUBMISSION_STATUS.RETURNED ? '<span style="color:var(--danger);font-size:12px;font-weight:700;">Returned</span>' :
                      '<span style="color:var(--muted);font-size:12px;">Draft</span>'}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  const employee = employees.find(e => e.id === activeSheet.employeeId);
  const totalWeight = activeSheet.goals.reduce((sum, g) => sum + (Number(g.weight) || 0), 0);
  const isValid = totalWeight === 100;

  return `
  <div>
    <div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" onclick="window.navigate('team')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Team Queue
      </button>
    </div>
    ${pageHeader({ breadcrumb: 'Ascendra › <span>Team Governance</span>', title: 'Manager Review Workbench', sub: `Reviewing submission for <strong>${employee?.name}</strong> (${activeSheet.employeeId})` })}

    <div class="alert-banner ${isValid ? 'alert-info' : 'alert-danger'} mb-24">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${isValid
          ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
          : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}
      </svg>
      <span>${isValid
        ? 'Goal sheet is valid. Review the targets below before final approval.'
        : `<strong>Validation Error:</strong> Total weightage is ${totalWeight}%. Must be exactly 100% to approve.`}</span>
    </div>

    <div class="card mb-24">
      <div class="profile-header">
        <img class="profile-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name||'?')}&background=4F46E5&color=fff&size=80&bold=true" alt="${employee?.name}" />
        <div style="flex:1;">
          <div class="profile-name">${employee?.name}</div>
          <div class="profile-role">${employee?.role} · ${employee?.team} · ${employee?.dept}</div>
          <div class="flex items-center gap-8 mt-8">
            <span class="badge badge-warning" style="font-size:11px;padding:4px 12px;">${activeSheet.status}</span>
            <span class="text-xs text-muted">Submitted ${new Date(activeSheet.submittedAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="about-label">Goals</div>
          <div style="font-size:22px;font-weight:900;">${activeSheet.goals.length} / 8</div>
          <div class="about-label mt-8">Total Weight</div>
          <div style="font-size:16px;font-weight:800;color:${totalWeight===100?'var(--success)':'var(--danger)'};">${totalWeight}%</div>
          <div style="margin-top:8px;">
            <button class="btn btn-ghost btn-sm" onclick="window.exportTeamAchievementCSV && window.exportTeamAchievementCSV(getState().currentUser.id)">Export Team CSV</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-60-40" style="align-items:start;">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">Submitted Objectives</div>
          <div class="text-xs font-bold ${isValid ? 'text-success' : 'text-danger'}">Weight Total: ${totalWeight}%</div>
        </div>
        <table class="tbl">
          <thead>
            <tr><th>Area</th><th>Description</th><th>UoM</th><th>Target</th><th>Weight (%)</th></tr>
          </thead>
          <tbody>
            ${activeSheet.goals.map((g, idx) => {
              const health = goalHealthScore(g, activeSheet);
              const healthBadge = health === 'Healthy' ? `<span class="badge badge-success" style="font-size:10px;margin-left:8px;">🟢 ${health}</span>` : health === 'Critical' ? `<span class="badge badge-danger" style="font-size:10px;margin-left:8px;">🔴 ${health}</span>` : `<span class="badge badge-warning" style="font-size:10px;margin-left:8px;">🟡 ${health}</span>`;
              return `
              <tr>
                <td><span class="badge badge-primary" style="font-size:9px;">${g.area}</span></td>
                <td style="font-size:13px;max-width:180px;font-weight:600;">${g.title}${healthBadge}${g.isShared ? ' <span class="badge badge-neutral" style="font-size:8px;">SHARED</span>' : ''}</td>
                <td><span class="badge badge-neutral" style="font-size:10px;">${g.uom||'%'}</span></td>
                <td>
                  <input type="text" class="form-control-sm" style="width:70px;" value="${g.target}"
                    ${g.isShared ? 'disabled style="opacity:0.6;"' : ''}
                    onchange="window.updateManagerEdit('${activeSheet.employeeId}', ${idx}, 'target', this.value)" />
                </td>
                <td>
                  <input type="number" class="form-control-sm" style="width:65px;" value="${g.weight}"
                    onchange="window.updateManagerEdit('${activeSheet.employeeId}', ${idx}, 'weight', this.value)" />
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="card card-p">
          <div style="font-size:15px;font-weight:800;letter-spacing:-.01em;margin-bottom:16px;">Decision Matrix</div>
          <div class="form-group">
            <label class="form-label">Approval Feedback / Comments</label>
            <textarea id="mgr-feedback" class="form-control" rows="4" placeholder="Add comments for the employee..."></textarea>
          </div>
          <button class="btn btn-success w-full mb-12" style="height:44px;font-size:13px;"
            ${!isValid ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
            onclick="window.handleApproval('${activeSheet.employeeId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            APPROVE &amp; LOCK GOALS
          </button>
          <button class="btn btn-danger-o w-full" style="height:44px;font-size:13px;"
            onclick="window.handleReturn('${activeSheet.employeeId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            RETURN FOR REWORK
          </button>
        </div>
        <div class="card card-p" style="background:#FAFBFF;">
          <div class="section-label mb-12">Sheet Summary</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${summaryRow('Goals Added', `${activeSheet.goals.length} / 8`)}
            ${summaryRow('Total Weight', `${totalWeight}%`, totalWeight === 100 ? 'var(--success)' : 'var(--danger)')}
            ${summaryRow('Submitted', new Date(activeSheet.submittedAt || Date.now()).toLocaleDateString())}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── QUARTERLY PHASE: Check-in View ────────────────────────────────
function renderQuarterlyCheckin(goalSheets, employees, system) {
  const quarter = system.currentCycle;
  // Only show approved sheets — can only check-in on approved goal sheets
  const teamSheets = goalSheets.filter(s => {
    const emp = employees.find(e => e.id === s.employeeId);
    return emp && emp.role !== 'ADMIN' && s.status === 'Approved' && s.goals.length > 0;
  });
  const pendingSheets = goalSheets.filter(s => {
    const emp = employees.find(e => e.id === s.employeeId);
    return emp && emp.role !== 'ADMIN' && s.status !== 'Approved';
  });

  return `
  <div>
    <div class="page-header-row">
      <div>
        <div class="page-breadcrumb">Ascendra › <span>Team Governance</span></div>
        <div class="page-title">${system.currentCycle} Manager Check-ins</div>
        <div class="page-sub">Review Planned vs. Actual achievement for your team and log check-in comments.</div>
      </div>
      <span class="badge badge-warning" style="font-size:12px;padding:8px 16px;">Phase: ${system.currentCycle}</span>
    </div>

    ${pendingSheets.length > 0 ? `
      <div class="alert-banner alert-warning mb-20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span><strong>${pendingSheets.length} employee(s)</strong> have not yet had their goal sheets approved — check-in not available for them.</span>
      </div>` : ''}
    ${teamSheets.length === 0 ? `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">No approved goal sheets found</div>
          <div class="empty-state-sub">Check-ins are only available for employees with approved goal sheets. Approve goal sheets first in Goal Setting phase.</div>
          <button class="btn btn-primary mt-20" onclick="window.setSystemCycle('GOAL_SETTING')">Go to Goal Setting</button>
        </div>
      </div>` : teamSheets.map(sheet => {
        const emp = employees.find(e => e.id === sheet.employeeId);
        if (!emp) return '';
        let totalProgress = 0;
        sheet.goals.forEach(g => {
          totalProgress += calculateProgressScore(g) * (g.weight / 100);
        });
        const progressCls = totalProgress >= 80 ? 'success' : totalProgress >= 50 ? 'warning' : 'danger';

        return `
        <div class="card mb-20">
          <div class="card-header">
            <div class="flex items-center gap-12">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4F46E5&color=fff&size=40" style="width:40px;height:40px;border-radius:10px;" />
              <div>
                <div style="font-weight:800;font-size:15px;">${emp.name}</div>
                <div class="text-xs text-muted">${emp.role} • ${emp.dept}</div>
              </div>
            </div>
            <div class="flex items-center gap-12">
              <div style="text-align:right;">
                <div class="section-label">Overall Progress</div>
                <div style="font-size:20px;font-weight:900;color:var(--${progressCls});">${totalProgress.toFixed(1)}%</div>
              </div>
              <span class="badge badge-${sheet.status === SUBMISSION_STATUS.APPROVED ? 'success' : 'neutral'}">${sheet.status}</span>
            </div>
          </div>

          <table class="tbl">
            <thead>
              <tr><th>Goal</th><th>UoM</th><th>Planned Target</th><th>Actual Achievement</th><th>Progress Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${sheet.goals.map(g => {
                  const score = calculateProgressScore(g);
                  const ds = g.goalStatus || (score >= 100 ? 'Completed' : score > 50 ? 'On Track' : 'Not Started');
                  const sc = ds === 'Completed' ? 'success' : ds === 'On Track' ? 'info' : 'neutral';
                  const bc = ds === 'Completed' ? 'var(--success)' : ds === 'On Track' ? 'var(--info)' : 'var(--muted)';
                  const health = goalHealthScore(g, sheet);
                  const healthBadge = health === 'Healthy' ? `<span class="badge badge-success" style="font-size:10px;margin-left:6px;">🟢 ${health}</span>` : health === 'Critical' ? `<span class="badge badge-danger" style="font-size:10px;margin-left:6px;">🔴 ${health}</span>` : `<span class="badge badge-warning" style="font-size:10px;margin-left:6px;">🟡 ${health}</span>`;
                  return `<tr>
                    <td style="font-weight:700;font-size:13px;">${g.title}${healthBadge}<br/><span class="badge badge-primary" style="font-size:9px;margin-top:3px;">${g.area}</span></td>
                    <td><span class="badge badge-neutral" style="font-size:10px;">${g.uom||'%'}</span></td>
                    <td style="font-weight:700;">${g.target}</td>
                    <td style="font-weight:700;color:var(--primary);">${g.achievement || 0}</td>
                    <td>
                      <div class="flex items-center gap-8">
                        <span style="font-weight:900;font-size:13px;color:${bc};width:38px;">${score.toFixed(0)}%</span>
                        <div class="progress-bar-wrap" style="flex:1;height:8px;min-width:60px;">
                          <div class="progress-bar-fill" style="width:${Math.min(score,100)}%;background:${bc};"></div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge badge-${sc}">${ds}</span></td>
                  </tr>`;
                }).join('')}
            </tbody>
          </table>

          <div style="padding:16px 20px;border-top:1px solid var(--border);background:#FAFBFF;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <label class="form-label" style="margin:0;">Check-in Comment — ${quarter} — ${emp.name}</label>
              ${sheet[`${quarter}_checkinDate`] ? `<span class="text-xs text-muted">Last saved: ${new Date(sheet[`${quarter}_checkinDate`]).toLocaleString()}</span>` : ''}
            </div>
            <div class="flex gap-12">
              <textarea id="checkin-${sheet.employeeId}" class="form-control" rows="2"
                placeholder="Document your ${quarter} check-in discussion, observations, and guidance..."
                style="flex:1;">${sheet[`${quarter}_checkinComment`] || ''}</textarea>
              <button class="btn btn-primary btn-sm" style="align-self:flex-end;white-space:nowrap;"
                onclick="window.saveCheckinComment('${sheet.employeeId}')">
                Save ${quarter} Comment
              </button>
            </div>
          </div>
        </div>`;
      }).join('')}
  </div>`;
}

const summaryRow = (label, val, color = 'var(--text)') => `
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold text-muted">${label}</span>
    <span class="text-xs font-bold" style="color:${color};">${val}</span>
  </div>`;

// ── GLOBAL HANDLERS ───────────────────────────────────────────────
window.updateManagerEdit = (empId, goalIdx, field, value) => {
  const { goalSheets } = getState();
  const updatedSheets = goalSheets.map(s => {
    if (s.employeeId === empId) {
      const updatedGoals = [...s.goals];
      updatedGoals[goalIdx] = { ...updatedGoals[goalIdx], [field]: field === 'weight' ? Number(value) : value };
      return { ...s, goals: updatedGoals };
    }
    return s;
  });
  setState({ goalSheets: updatedSheets });
  // Update weight total display without full re-render
  const totalEl = document.querySelector('.text-xs.font-bold.text-success, .text-xs.font-bold.text-danger');
  if (totalEl) {
    const { goalSheets: gs } = getState();
    const sheet = gs.find(s => s.employeeId === empId);
    if (sheet) {
      const tw = sheet.goals.reduce((sum, g) => sum + (Number(g.weight)||0), 0);
      totalEl.textContent = 'Weight Total: ' + tw + '%';
      totalEl.className = 'text-xs font-bold ' + (tw === 100 ? 'text-success' : 'text-danger');
    }
  }
};

window.handleApproval = (empId) => {
  try {
    const feedback = document.getElementById('mgr-feedback')?.value || '';

    // engine.js validateGoalSheet checks goal.weightage but our goals use goal.weight.
    // Normalize before calling approveGoalSheet so validation passes correctly.
    const { goalSheets: sheets } = getState();
    const normalizedSheets = sheets.map(s => {
      if (s.employeeId !== empId) return s;
      return {
        ...s,
        goals: s.goals.map(g => ({ ...g, weightage: g.weight }))
      };
    });
    // Temporarily write normalized sheets so engine validation works
    setState({ goalSheets: normalizedSheets });

    approveGoalSheet(empId, getState().currentUser.id);

    // Save approval comment
    if (feedback) {
      const { goalSheets: afterApprove } = getState();
      setState({ goalSheets: afterApprove.map(s => s.employeeId === empId ? { ...s, approvalComment: feedback } : s) });
    }

    // Fire email notification to employee (non-blocking)
    const { employees, goalSheets: finalSheets, currentUser } = getState();
    const employee = employees.find(e => e.id === empId);
    const sheet    = finalSheets.find(s => s.employeeId === empId);
    if (employee && currentUser) {
      notifyApproval(employee, currentUser, feedback, sheet?.goals?.length || 0);
    }

    alert('Goal sheet approved and locked successfully.');
    window.navigate('team');
  } catch (err) {
    alert('Approval failed: ' + err.message);
  }
};

window.handleReturn = (empId) => {
  const feedback = document.getElementById('mgr-feedback')?.value;
  if (!feedback) return alert('Please provide feedback for rework.');
  const { goalSheets, employees, currentUser } = getState();
  const updatedSheets = goalSheets.map(s =>
    s.employeeId === empId ? { ...s, status: SUBMISSION_STATUS.RETURNED, managerComment: feedback } : s
  );
  setState({ goalSheets: updatedSheets });

  // Fire email notification to employee (non-blocking)
  const employee = employees.find(e => e.id === empId);
  if (employee && currentUser) {
    notifyReturn(employee, currentUser, feedback);
  }

  alert('Goal sheet returned for rework.');
  window.navigate('team');
};

window.saveCheckinComment = (empId) => {
  const textarea = document.getElementById(`checkin-${empId}`);
  if (!textarea) return;
  const comment = textarea.value.trim();
  if (!comment) return alert('Please enter a check-in comment before saving.');
  const { goalSheets, auditLogs, currentUser, system } = getState();
  const quarter = system.currentCycle;
  const updatedSheets = goalSheets.map(s =>
    s.employeeId === empId
      ? { ...s,
          checkinComment: comment,                          // keep legacy field
          checkinDate: new Date().toISOString(),            // keep legacy field
          [`${quarter}_checkinComment`]: comment,
          [`${quarter}_checkinDate`]: new Date().toISOString()
        }
      : s
  );
  setState({
    goalSheets: updatedSheets,
    auditLogs: [{
      id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Check-in Comment', field: `${system.currentCycle} Review`,
      before: '', after: comment.slice(0, 60),
      reason: `Manager check-in for ${empId}`,
      timestamp: new Date().toISOString()
    }, ...auditLogs]
  });
  alert('Check-in comment saved successfully.');
  window.navigate('team');
};


