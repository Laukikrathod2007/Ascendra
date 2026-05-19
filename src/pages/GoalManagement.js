import { getState, setState } from '../store/state.js';
import { submitGoalSheet, goalHealthScore } from '../utils/engine.js';
import { SUBMISSION_STATUS, THRUST_AREAS as CONST_AREAS } from '../utils/constants.js';
import { notifySubmission } from '../utils/notifications.js';
import { pageHeader } from '../components/UI.js';

const THRUST_AREAS = CONST_AREAS && CONST_AREAS.length
  ? CONST_AREAS
  : ['Financial Growth','Customer Excellence','Operational Efficiency','People & Culture','Technology & Innovation'];

// Stepper component for visual lifecycles
const renderStepper = (status) => {
  const steps = [
    { label: "Drafting", desc: "Create your sheet" },
    { label: "Submitted", desc: "Awaiting Manager" },
    { label: "Approved", desc: "Locked & Finalized" }
  ];
  let activeIdx = 0;
  if (status === SUBMISSION_STATUS.SUBMITTED) activeIdx = 1;
  if (status === SUBMISSION_STATUS.APPROVED) activeIdx = 2;
  if (status === SUBMISSION_STATUS.RETURNED) activeIdx = 0;

  return `
    <div class="card stepper-card" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; background: rgba(255,255,255,0.4); border-color: rgba(99, 102, 241, 0.08); backdrop-filter: blur(10px);">
      <div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; display:flex; align-items:center; gap:6px;">
        <span style="width:6px; height:6px; background:var(--primary); border-radius:50%;"></span>
        Governance Lifecycle Status
      </div>
      <div style="display: flex; align-items: center; position: relative; margin: 10px 0;">
        <div style="position: absolute; left: 15%; right: 15%; height: 2px; background: rgba(0,0,0,0.05); top: 50%; transform: translateY(-50%); z-index: 1;"></div>
        <div style="position: absolute; left: 15%; width: ${activeIdx === 0 ? '0%' : activeIdx === 1 ? '35%' : '70%'}; height: 2px; background: var(--primary); top: 50%; transform: translateY(-50%); z-index: 1; transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        
        ${steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx;
          const isReturnedState = status === SUBMISSION_STATUS.RETURNED && idx === 0;
          const color = isReturnedState ? '#EF4444' : isActive ? 'var(--primary)' : isDone ? 'var(--success)' : 'var(--muted)';
          const bgColor = isReturnedState ? 'rgba(239, 68, 68, 0.1)' : isActive ? 'rgba(99, 102, 241, 0.1)' : isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.03)';
          const borderStyle = isReturnedState ? '1px solid #EF4444' : isActive ? '2px solid var(--primary)' : isDone ? '1px solid var(--success)' : '1px solid rgba(0,0,0,0.06)';
          
          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${bgColor}; border: ${borderStyle}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${color}; transition: all 0.2s;">
                ${isReturnedState ? '⚠' : isDone ? '✓' : idx + 1}
              </div>
              <div style="font-size: 11.5px; font-weight: 700; color: ${color}; margin-top: 6px;">${isReturnedState ? 'Rework Returned' : step.label}</div>
              <div style="font-size: 9.5px; color: var(--muted); margin-top: 1px;">${step.desc}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
};

// Collapsible activity log for goal sheet history
const renderHistoryLog = (history) => {
  if (!history || history.length === 0) return '';
  
  return `
    <div style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
      <details style="border: none;" class="sb-details">
        <summary style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; list-style: none; outline: none; user-select: none;">
          <span style="display:flex; align-items:center; gap:6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Goal Sheet Activity History (${history.length})
          </span>
          <span style="font-size: 10px; color: var(--muted);">Toggle History ↓</span>
        </summary>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
          ${[...history].reverse().map(h => {
            const timeStr = new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let badgeClass = 'badge-neutral';
            if (h.action.includes('Approved')) badgeClass = 'badge-success';
            if (h.action.includes('Returned') || h.action.includes('Reject')) badgeClass = 'badge-danger';
            if (h.action.includes('Submit')) badgeClass = 'badge-primary';
            return `
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 10px; background: rgba(0,0,0,0.01); border: 1px solid rgba(0,0,0,0.03); border-radius: 8px;">
                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="badge ${badgeClass}" style="font-size: 9px; padding: 2px 6px;">${h.action}</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text);">${h.actor || 'User'}</span>
                  </div>
                  ${h.comment ? `<div style="font-size: 11px; color: var(--muted); margin-top: 4px; font-style: italic; background:rgba(0,0,0,0.01); padding:4px 8px; border-left:2px solid var(--border);">${h.comment}</div>` : ''}
                </div>
                <span style="font-size: 10px; font-weight: 600; color: var(--muted); flex-shrink: 0; margin-top:2px;">${timeStr}</span>
              </div>
            `;
          }).join("")}
        </div>
      </details>
    </div>
  `;
};

export const renderGoalManagement = () => {
  const { goalSheets, currentUser, system } = getState();
  let userSheet = goalSheets.find(s => s.employeeId === currentUser.id);

  if (!userSheet) {
    userSheet = { employeeId: currentUser.id, status: SUBMISSION_STATUS.DRAFT, goals: [], history: [] };
    setTimeout(() => {
      setState({ goalSheets: [...getState().goalSheets, userSheet] });
    }, 0);
  }

  const goals = userSheet.goals || [];
  const totalWeight = goals.reduce((s, g) => s + (Number(g.weight) || 0), 0);
  const allWeightsValid = goals.length === 0 || goals.every(g => Number(g.weight) >= 10);
  const isValid = totalWeight === 100 && goals.length > 0 && allWeightsValid && goals.length <= 8;
  const isSubmitted = userSheet.status === SUBMISSION_STATUS.SUBMITTED;
  const isApproved  = userSheet.status === SUBMISSION_STATUS.APPROVED;
  const isReturned  = userSheet.status === SUBMISSION_STATUS.RETURNED;
  const isLocked    = isSubmitted || isApproved;

  return `
  <div>
    ${pageHeader({ breadcrumb: 'Ascendra › <span>My Goals</span>', title: 'Goal Sheet Builder', sub: `Create, manage and submit your performance goals • Status: <strong>${userSheet.status}</strong>`, actions: `<div style="text-align:right;"><div class="section-label">Goalsheet Health</div><div style="font-size:26px;font-weight:900;color:${isValid ? 'var(--success)' : 'var(--danger)'};">${totalWeight}%</div><div class="text-xs text-muted">/ 100%</div></div><div class="card" style="padding:10px 16px;border:2px solid ${isValid ? 'var(--success)' : 'var(--danger)'};background:${isValid ? 'var(--success-light)' : 'var(--danger-light)'};"><div class="text-xs font-bold" style="color:${isValid ? 'var(--success)' : 'var(--danger)'};">PHASE: ${system.currentCycle}</div><div class="text-xs" style="color:var(--muted);">DEADLINE: MAY 31, 2026</div></div>` })}

    ${userSheet.managerComment ? `
      <div class="alert-banner alert-danger mb-20" style="display:flex; align-items:center; gap:10px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span><strong>Returned for Rework:</strong> ${userSheet.managerComment}</span>
      </div>
    ` : ''}

    ${isApproved ? `
    <div class="alert-banner alert-success mb-20" style="display:flex; align-items:center; gap:10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span><strong>Goal Sheet Finalized & Locked.</strong> Your quarterly performance objectives are locked. Contact administrative support to trigger dynamic modifications.</span>
    </div>
    <div class="card mb-24">
      <div class="card-header">
        <div class="card-header-title">Approved Goals — ${system.currentCycle}</div>
        <span class="badge badge-success">Approved ${userSheet.approvedAt ? new Date(userSheet.approvedAt).toLocaleDateString() : ''}</span>
      </div>
      <table class="tbl">
        <thead><tr><th>Thrust Area</th><th>Goal</th><th>UoM</th><th>Target</th><th>Weight</th><th>Direction</th></tr></thead>
        <tbody>
          ${goals.map(g => `<tr>
            <td><span class="badge badge-primary" style="font-size:9px;">${g.area || 'General'}</span></td>
            <td style="font-weight:700;font-size:13px;">${g.title}${g.isShared ? ' <span class="badge badge-neutral" style="font-size:8px;margin-left:4px;">SHARED</span>' : ''}</td>
            <td><span class="badge badge-neutral" style="font-size:10px;">${g.uom}</span></td>
            <td style="font-weight:700;">${g.target}</td>
            <td><span class="badge badge-neutral" style="font-size:10px;">${g.weight}%</span></td>
            <td style="font-size:12px;color:var(--muted);">${g.direction === 'Lower' ? '↓ Lower is better' : '↑ Higher is better'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="padding:12px 20px;border-top:1px solid var(--border);background:#F8FFF8;display:flex;align-items:center;justify-content:space-between;">
        <span class="text-xs text-muted">Total Weight: <strong style="color:var(--success);">${totalWeight}%</strong> · ${goals.length} goals</span>
        <button class="btn btn-ghost btn-sm" onclick="window.navigate('checkins')">View Progress Tracking →</button>
      </div>
    </div>` : ''}

    ${renderStepper(userSheet.status)}

    <div class="grid-60-40" style="align-items:start;">
      <!-- Builder Pane -->
      <div style="display:flex;flex-direction:column;gap:20px;">

        <!-- Goal Form Card -->
        <div class="card card-p">
          <div class="flex items-center gap-10 mb-20">
            <div style="width:32px;height:32px;background:var(--primary-light);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--primary);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div class="section-title" style="margin:0;">${isLocked ? 'Sheet is Locked' : 'Create New Goal'}</div>
            ${isLocked ? `<span class="badge badge-warning" style="margin-left:auto;">LOCKED</span>` : ''}
          </div>

          <form onsubmit="window.addGoal(event)" ${isLocked ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
            <div class="form-group">
              <label class="form-label">Goal Title</label>
              <input id="gf-title" class="form-control" placeholder="e.g. Expand Market Share in APAC" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Thrust Area</label>
                <select id="gf-area" class="form-control">
                  <option value="">Select Area...</option>
                  ${THRUST_AREAS.map(a => `<option>${a}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Weight (%) <span style="color:var(--danger);">min 10%</span></label>
                <input id="gf-weight" class="form-control" type="number" min="10" max="100" placeholder="20" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Target Value</label>
                <input id="gf-target" class="form-control" placeholder="e.g. 200" required />
              </div>
              <div class="form-group">
                <label class="form-label">Unit of Measure</label>
                <select id="gf-uom" class="form-control">
                  <option value="Numeric">Numeric (#)</option>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Timeline">Timeline (Date)</option>
                  <option value="Zero-based">Zero-based</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <select id="gf-direction" class="form-control">
                <option value="Higher">Higher is Better (e.g. Revenue, NPS)</option>
                <option value="Lower">Lower is Better (e.g. Cost, TAT, Incidents)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Strategic Alignment &amp; Rationale</label>
              <textarea id="gf-rationale" class="form-control" rows="2" placeholder="Explain the 'why' behind this goal..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-full" style="height:44px;font-size:13px;border-radius:12px;letter-spacing:.02em;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ADD GOAL TO DRAFT
            </button>
          </form>
        </div>

        <!-- Workbench Checklist -->
        <div class="card card-p" style="border:2px solid var(--border);">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--primary);margin-bottom:16px;">Workbench Checklist</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${checkItem(goals.length > 0, 'At least one goal added to the sheet')}
            ${checkItem(goals.length <= 8, 'Maximum 8 goals per goal sheet', goals.length > 8)}
            ${checkItem(allWeightsValid, 'Each goal must have minimum 10% weightage', !allWeightsValid && goals.length > 0)}
            ${checkItem(totalWeight === 100, 'Total weightage must equal exactly 100%', totalWeight !== 100 && goals.length > 0)}
          </div>
        </div>
      </div>

      <!-- Active Goal Sheet Panel -->
      <div class="card" style="position:sticky;top:80px;">
        <div class="card-header">
          <div class="flex items-center gap-8">
            <div class="card-header-title">Active Goal Sheet</div>
            <span class="badge badge-${isValid ? 'success' : 'danger'}" style="font-size:10px;">${isValid ? 'VALID' : 'DRAFT'}</span>
          </div>
          <button class="btn btn-primary btn-sm"
            ${!isValid || isLocked ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}
            onclick="window.submitUserSheet('${currentUser.id}')">
            ${isLocked ? '✓ SUBMITTED' : 'Submit to Review'}
          </button>
        </div>

        ${goals.length === 0 ? `
          <div class="empty-state" style="padding:60px 20px;">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">Goal sheet is empty</div>
            <div class="empty-state-sub">Start drafting your performance goals using the builder on the left.</div>
          </div>
        ` : `
          <div style="padding:0 20px;">
            ${goals.map((g, i) => {
              const pct = g.achievement && g.target ? Math.min(Math.round((Number(g.achievement)/Number(g.target))*100), 100) : 0;
              const barColor = pct >= 80 ? 'var(--success)' : pct >= 40 ? '#F59E0B' : 'var(--primary)';
              const health = goalHealthScore(g, userSheet);
              const healthBadge = health === 'Healthy' ? `<span class="badge badge-success" style="font-size:10px;margin-left:8px;">🟢 ${health}</span>` : health === 'Critical' ? `<span class="badge badge-danger" style="font-size:10px;margin-left:8px;">🔴 ${health}</span>` : `<span class="badge badge-warning" style="font-size:10px;margin-left:8px;">🟡 ${health}</span>`;
              return `
                <div class="lattice-goal-card">
                  <div class="lattice-goal-title">
                    <span>${g.title}${g.isShared ? ' <span class="badge badge-neutral" style="font-size:8px;margin-left:6px;">SHARED</span>' : ''}</span>
                    ${healthBadge}
                    ${!isLocked && !g.isShared ? `
                      <button class="btn btn-ghost btn-sm" onclick="window.removeGoal('${currentUser.id}', ${i})" style="padding:3px 8px;color:var(--danger);flex-shrink:0;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>` : ''}
                  </div>
                  <div class="lattice-goal-meta">
                    <span class="badge badge-primary" style="font-size:9px;">${g.area || 'General'}</span>
                    <span class="badge badge-neutral" style="font-size:9px;">${g.uom || '%'}</span>
                    <span class="text-xs text-muted">Target: <strong>${g.target}</strong></span>
                    ${g.isShared && !isLocked ? `
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:10px;font-weight:700;color:var(--muted);">Weight:</span>
                        <input type="number" min="10" max="100" value="${g.weight}"
                          style="width:52px;height:26px;border:1px solid var(--border);border-radius:6px;padding:0 6px;font-size:11px;font-weight:700;"
                          onchange="window.updateSharedGoalWeight('${currentUser.id}', ${i}, this.value)"
                          onclick="event.stopPropagation()" />
                        <span style="font-size:10px;color:var(--muted);">%</span>
                      </div>` :
                      `<span class="badge ${Number(g.weight) < 10 ? 'badge-danger' : 'badge-neutral'}" style="font-size:9px;">${g.weight}% weight</span>`}
                  </div>
                  <div class="lattice-goal-progress-row">
                    <div class="lattice-goal-progress-bar">
                      <div class="lattice-goal-progress-fill" style="width:${pct}%;background:${barColor};"></div>
                    </div>
                    <span class="lattice-goal-pct" style="color:${barColor};">${pct}%</span>
                  </div>
                </div>`;
            }).join('')}
          </div>
        `}

        <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:12px;background:#FAFBFF;border-radius:0 0 var(--radius) var(--radius);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="text-xs font-bold text-muted">GOALS: ${goals.length}/8</span>
            <span class="text-xs font-bold" style="color:${totalWeight === 100 ? 'var(--success)' : 'var(--danger)'};">
              ${totalWeight === 100 ? '✓ Ready to Submit' : `⚠ Weightage: ${totalWeight}%`}
            </span>
          </div>
          
          ${renderHistoryLog(userSheet.history)}
        </div>
      </div>
    </div>
  </div>`;
};

const checkItem = (done, label, isError = false) => `
  <div class="flex items-center gap-10">
    <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${done ? 'var(--success)' : isError ? 'var(--danger)' : 'var(--border)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${done ? 'var(--success)' : 'transparent'};">
      ${done ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
    </div>
    <span style="font-size:12px;font-weight:600;color:${isError ? 'var(--danger)' : done ? 'var(--text)' : 'var(--muted)'};">${label}</span>
  </div>`;

window.addGoal = (e) => {
  e.preventDefault();
  const title     = document.getElementById('gf-title').value.trim();
  const area      = document.getElementById('gf-area').value;
  const weight    = Number(document.getElementById('gf-weight').value);
  const target    = document.getElementById('gf-target').value.trim();
  const uom       = document.getElementById('gf-uom').value;
  const direction = document.getElementById('gf-direction').value;
  const rat       = document.getElementById('gf-rationale').value;

  if (!title) return alert('Goal title is required.');
  if (weight < 10) return alert('Minimum weightage per goal is 10%.');
  if (weight > 100) return alert('Weightage cannot exceed 100%.');

  const { goalSheets, currentUser } = getState();
  const updatedSheets = goalSheets.map(s => {
    if (s.employeeId === currentUser.id) {
      if (s.goals.length >= 8) { alert('Maximum 8 goals allowed.'); return s; }
      const nowIso = new Date().toISOString();
      const newGoal = { id: Date.now(), title, area, weight, target, uom, direction, rationale: rat, achievement: 0, goalStatus: 'Not Started', createdAt: nowIso, lastUpdatedAt: nowIso };
      const newHistory = [...(s.history || []), { timestamp: nowIso, action: "Goal Added", actor: currentUser.name, comment: `Added: "${title.slice(0,35)}..."` }];
      return { ...s, goals: [...s.goals, newGoal], history: newHistory };
    }
    return s;
  });
  setState({ goalSheets: updatedSheets });
  window.navigate('goals');
};

window.removeGoal = (empId, idx) => {
  const { goalSheets, currentUser } = getState();
  const updatedSheets = goalSheets.map(s => {
    if (s.employeeId === empId) {
      const removed = s.goals[idx];
      const nowIso = new Date().toISOString();
      const newHistory = [...(s.history || []), { timestamp: nowIso, action: "Goal Removed", actor: currentUser.name, comment: `Removed: "${removed?.title.slice(0,35)}..."` }];
      return { ...s, goals: s.goals.filter((_, i) => i !== idx), history: newHistory };
    }
    return s;
  });
  setState({ goalSheets: updatedSheets });
  window.navigate('goals');
};

window.updateSharedGoalWeight = (empId, goalIdx, value) => {
  const weight = Number(value);
  if (weight < 10) return alert('Minimum weightage per goal is 10%.');
  if (weight > 100) return alert('Weightage cannot exceed 100%.');
  const { goalSheets } = getState();
  const updatedSheets = goalSheets.map(s => {
    if (s.employeeId !== empId) return s;
    const updatedGoals = [...s.goals];
    updatedGoals[goalIdx] = { ...updatedGoals[goalIdx], weight };
    return { ...s, goals: updatedGoals };
  });
  setState({ goalSheets: updatedSheets });
};

window.submitUserSheet = (empId) => {
  const { goalSheets, employees, currentUser } = getState();
  const sheet = goalSheets.find(s => s.employeeId === empId);
  if (!sheet) return;
  const goals = sheet.goals || [];
  const totalWeight = goals.reduce((s, g) => s + (Number(g.weight) || 0), 0);
  if (goals.length === 0) return alert('Add at least one goal before submitting.');
  if (goals.length > 8) return alert('Maximum 8 goals allowed.');
  if (totalWeight !== 100) return alert(`Total weightage must be exactly 100%. Current: ${totalWeight}%`);
  if (goals.some(g => Number(g.weight) < 10)) return alert('Each goal must have a minimum weightage of 10%.');
  submitGoalSheet(empId);

  // Fire email notification to manager (non-blocking)
  const employee = employees.find(e => e.id === empId);
  const manager  = employees.find(e => e.id === employee?.managerId);
  if (employee && manager) {
    notifySubmission(employee, manager, goals.length, totalWeight);
  }

  alert('Goal sheet submitted successfully!');
  window.navigate('goals');
};
