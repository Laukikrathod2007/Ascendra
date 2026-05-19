import { getState, setState } from '../store/state.js';
import { calculateProgressScore, updateQuarterlyAchievement, goalHealthScore, syncSharedGoalAchievement } from '../utils/engine.js';
import { SUBMISSION_STATUS } from '../utils/constants.js';

const QUARTERLY_STYLE = `
<style>
  .lattice-goal-card {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    border-radius: 12px;
    padding: 18px 20px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
  .lattice-goal-card:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.2) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
  
  /* Slide bar premium aesthetics */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 8px;
    outline: none;
    transition: background 0.15s;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
    transition: transform 0.15s;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.25);
  }
</style>
`;

export const renderQuarterlyReview = () => {
  const { goalSheets, currentUser, system } = getState();
  const userSheet = goalSheets.find(s => s.employeeId === currentUser.id);

  if (!userSheet || userSheet.goals.length === 0) {
    return `
      <div>
        <div class="page-header-row">
          <div>
            <div class="page-breadcrumb">Ascendra › <span>Quarterly Check-ins</span></div>
            <div class="page-title">${system.currentCycle} Progress Tracking</div>
            <div class="page-sub">Update your quarterly achievements for FY2026.</div>
          </div>
        </div>
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <div class="empty-state-title">No goals found</div>
            <div class="empty-state-sub">Please complete your Goal Setting phase before starting quarterly reviews.</div>
            <button class="btn btn-primary mt-20" onclick="window.navigate('goals')">Go to Goal Builder</button>
          </div>
        </div>
      </div>`;
  }

  const currentQuarter = system.currentCycle;
  const isReadOnly = userSheet.status !== SUBMISSION_STATUS.APPROVED || system.cycleLocked;

  let totalWeightedProgress = 0;
  userSheet.goals.forEach(g => {
    const progress = calculateProgressScore(g);
    totalWeightedProgress += (progress * (g.weight / 100));
  });

  const overallStatus = totalWeightedProgress >= 80 ? 'On Track' : totalWeightedProgress >= 50 ? 'Needs Attention' : 'At Risk';
  const overallStatusCls = totalWeightedProgress >= 80 ? 'success' : totalWeightedProgress >= 50 ? 'warning' : 'danger';

  return `
  ${QUARTERLY_STYLE}
  <div>
    <div class="page-header-row">
      <div>
        <div class="page-breadcrumb">Ascendra › <span>Quarterly Check-ins</span></div>
        <div class="page-title">${currentQuarter} — Achievement Tracking</div>
        <div class="page-sub">Log your actual achievements against planned targets for <strong>${currentQuarter}</strong>.</div>
      </div>
      <div class="flex gap-12 items-center">
        <div class="card" style="padding:12px 20px;text-align:center;min-width:140px;">
          <div class="section-label mb-4">Overall Score</div>
          <div style="font-size:28px;font-weight:900;color:var(--primary);letter-spacing:-.03em;">${totalWeightedProgress.toFixed(1)}%</div>
          <span class="badge badge-${overallStatusCls}" style="font-size:10px;margin-top:6px;">${overallStatus}</span>
        </div>
      </div>
    </div>

    <div class="alert-banner ${isReadOnly ? 'alert-warning' : 'alert-info'} mb-24" style="display:flex; align-items:center; gap:10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${isReadOnly
          ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
          : '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'}
      </svg>
      <span>${isReadOnly
        ? '<strong>Read-Only Mode:</strong> Goal sheet must be approved and cycle must be open to edit achievements.'
        : `<strong>Active Window:</strong> You are currently updating achievements for ${currentQuarter}. Adjust range sliders below to log actual progress.`}</span>
    </div>

    <div class="card mb-24">
      <div class="workday-section-header">
        <div class="workday-section-title">My Goals — ${currentQuarter}</div>
        <span class="badge badge-${overallStatusCls}">${overallStatus}</span>
      </div>
      <div style="padding:0 20px; display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
        ${userSheet.goals.map((g) => {
          const score = calculateProgressScore(g);
          const autoStatus = score >= 100 ? 'Completed' : score > 50 ? 'On Track' : 'Not Started';
          const displayStatus = g.goalStatus || autoStatus;
          const barColor = displayStatus === 'Completed' ? 'var(--success)' : displayStatus === 'On Track' ? 'var(--info)' : '#D1D5DB';
          const pillCls = displayStatus === 'Completed' ? 'status-pill-completed' : displayStatus === 'On Track' ? 'status-pill-progress' : 'status-pill-draft';
          const health = goalHealthScore(g, userSheet);
          const healthBadge = health === 'Healthy' ? `<span class="badge badge-success" style="font-size:10px;margin-left:8px;">🟢 ${health}</span>` : health === 'Critical' ? `<span class="badge badge-danger" style="font-size:10px;margin-left:8px;">🔴 ${health}</span>` : `<span class="badge badge-warning" style="font-size:10px;margin-left:8px;">🟡 ${health}</span>`;

          const maxLimit = typeof g.target === 'number' ? g.target * 1.5 : parseInt(g.target) ? parseInt(g.target) * 1.5 : 150;

          return `
            <div class="lattice-goal-card">
              <div class="lattice-goal-title">
                <div style="flex:1;min-width:0;">
                  <div style="font-size:14px;font-weight:700;margin-bottom:4px;color:var(--text);">${g.title}${healthBadge}</div>
                  <div class="flex items-center gap-8 flex-wrap">
                    <span class="badge badge-primary" style="font-size:9px;">${g.area}</span>
                    <span class="text-xs text-muted">Wt: ${g.weight}%</span>
                    <span class="text-xs text-muted">${g.uom} · Target: <strong>${g.target}</strong></span>
                    ${g.direction ? `<span class="text-xs text-muted">${g.direction === 'Lower' ? '↓ Lower' : '↑ Higher'}</span>` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-10" style="flex-shrink:0;">
                  ${isReadOnly
                    ? `<span class="status-pill ${pillCls}">${displayStatus}</span>`
                    : `<select class="form-control-sm" style="width:120px;border-radius:8px;font-weight:600;" onchange="window.updateGoalStatus('${currentUser.id}', ${g.id}, this.value)">
                        <option value="Not Started" ${displayStatus === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="On Track" ${displayStatus === 'On Track' ? 'selected' : ''}>On Track</option>
                        <option value="Completed" ${displayStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                      </select>`
                  }
                </div>
              </div>
              
              <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
                <div style="display:flex;align-items:center;gap:12px;width:100%;">
                  <span style="font-size:11px;color:var(--muted);white-space:nowrap;font-weight:700;">Achievement Level:</span>
                  ${isReadOnly
                    ? `<span style="font-size:12px;font-weight:800;color:var(--primary);">${g.achievement || 0}</span>`
                    : `<input type="range" style="flex:1;" min="0" max="${maxLimit}" value="${g.achievement || 0}"
                         oninput="this.nextElementSibling.textContent = this.value; window.handleAchievementUpdate('${currentUser.id}', ${g.id}, this.value)">
                       <span style="font-size:12px;font-weight:800;color:var(--primary);min-width:32px;text-align:right;">${g.achievement || 0}</span>`
                  }
                  <span style="font-size:11px;color:var(--muted);">/ ${g.target}</span>
                </div>
                
                <div class="lattice-goal-progress-row" style="margin-top:4px;">
                  <div class="lattice-goal-progress-bar" style="flex:1;">
                    <div class="lattice-goal-progress-fill" style="width:${Math.min(score,100)}%;background:${barColor};"></div>
                  </div>
                  <span class="lattice-goal-pct" style="color:${barColor};font-weight:800;font-size:12px;">${score.toFixed(0)}%</span>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="flex justify-end gap-12">
      <button class="btn btn-ghost" onclick="window.navigate('goals')">Refresh Progress</button>
      <button class="btn btn-primary" ${isReadOnly ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
        onclick="window.submitQuarterlyReview('${currentUser.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Submit Quarterly Review
      </button>
    </div>
  </div>`;
};

window.handleAchievementUpdate = (empId, goalId, value) => {
  const numVal = Number(value);
  updateQuarterlyAchievement(empId, goalId, numVal, getState().system.currentCycle);

  // If this goal is a shared goal, sync achievement across all linked sheets
  const { goalSheets } = getState();
  const sheet = goalSheets.find(s => s.employeeId === empId);
  if (sheet) {
    const goal = sheet.goals.find(g => g.id === goalId);
    if (goal && goal.sharedId) {
      syncSharedGoalAchievement(goal.sharedId, numVal);
    }
  }
};

window.updateGoalStatus = (empId, goalId, status) => {
  const { goalSheets } = getState();
  const updatedSheets = goalSheets.map(sheet => {
    if (sheet.employeeId === empId) {
      const updatedGoals = sheet.goals.map(g =>
        g.id === goalId ? { ...g, goalStatus: status } : g
      );
      return { ...sheet, goals: updatedGoals };
    }
    return sheet;
  });
  setState({ goalSheets: updatedSheets });
};

window.submitQuarterlyReview = (empId) => {
  const { goalSheets, auditLogs, currentUser, system } = getState();
  const updatedSheets = goalSheets.map(s =>
    s.employeeId === empId
      ? { ...s, [`${system.currentCycle}_submitted`]: true, [`${system.currentCycle}_submittedAt`]: new Date().toISOString() }
      : s
  );
  setState({
    goalSheets: updatedSheets,
    auditLogs: [{
      id: Date.now(), user: currentUser.name, role: currentUser.role,
      action: 'Quarterly Submit', field: system.currentCycle,
      before: 'In Progress', after: 'Submitted',
      reason: `${system.currentCycle} review submitted by ${empId}`,
      timestamp: new Date().toISOString()
    }, ...auditLogs]
  });
  alert(`${system.currentCycle} quarterly review submitted to your manager.`);
  window.navigate('goals');
};
