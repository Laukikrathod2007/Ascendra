import { getState } from '../store/state.js';

export const renderDashboard = () => {
  const { goals = [], currentUser, system } = getState();
  const totalWeight = goals.reduce((s, g) => s + (Number(g.weight) || 0), 0);
  const completed = goals.filter(g => g.status === 'Completed').length;

  return `
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Ascendra › <span>My Dashboard</span></div>
          <div class="page-title">Performance Overview</div>
          <div class="page-sub">FY 2024 – Your personal goal sheet and progress tracker.</div>
        </div>
        <div class="flex gap-12">
          <button class="btn btn-ghost btn-sm" onclick="window.navigate('audit')">📋 Audit Trail</button>
          <button class="btn btn-primary btn-sm" onclick="window.navigate('goals')">🎯 Manage Goals</button>
        </div>
      </div>

      <div class="stat-grid mb-24">
        ${miniStat('Total Goals', goals.length + ' / 8', '🎯', 'stat-card-blue')}
        ${miniStat('Total Weightage', totalWeight + '%', '⚖️', totalWeight === 100 ? 'stat-card-green' : 'stat-card-pink')}
        ${miniStat('Completed', completed, '✅', 'stat-card-green')}
        ${miniStat('Current Phase', system.currentCycle.replace('_',' '), '📅', 'stat-card-orange')}
      </div>

      <div class="card">
        <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div class="section-title" style="margin:0;">My Goal Sheet</div>
          <button class="btn btn-primary btn-sm" onclick="window.navigate('goals')">+ Add Goal</button>
        </div>
        ${goals.length === 0 ? `
          <div style="padding:60px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">📋</div>
            <div style="font-weight:800;font-size:16px;margin-bottom:8px;">No goals yet</div>
            <div class="text-sm text-muted mb-20">Start building your performance goal sheet for FY2024.</div>
            <button class="btn btn-primary" onclick="window.navigate('goals')">Create First Goal</button>
          </div>` : `
          <table class="tbl">
            <thead>
              <tr><th>Thrust Area</th><th>Goal</th><th>Target</th><th>Weight</th><th>Progress</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              ${goals.map((g, i) => `
                <tr>
                  <td><span class="badge badge-primary" style="font-size:9px;">${g.area || 'General'}</span></td>
                  <td style="font-size:13px;font-weight:600;max-width:200px;">${g.title}</td>
                  <td style="font-weight:800;">${g.target} <span class="text-muted text-xs">${g.uom || '%'}</span></td>
                  <td><span class="badge badge-neutral">${g.weight}%</span></td>
                  <td>
                    <div class="progress-bar-wrap" style="width:80px;">
                      <div class="progress-bar-fill" style="width:50%;background:var(--primary);"></div>
                    </div>
                  </td>
                  <td><span class="badge badge-warning">${g.status || 'Draft'}</span></td>
                  <td><button class="btn btn-ghost btn-sm" onclick="window.removeGoal(${i})" style="padding:4px 10px;">✕</button></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
        <div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#FAFBFF;border-radius:0 0 var(--radius) var(--radius);">
          <span class="text-xs font-bold text-muted">GOALS: ${goals.length}/8</span>
          <span class="text-xs font-bold" style="color:${totalWeight===100?'var(--success)':'var(--danger)'};">
            ${totalWeight===100 ? '✅ Ready to Submit' : `⚠️ Weightage: ${totalWeight}% (needs 100%)`}
          </span>
        </div>
      </div>
    </div>
  `;
};

const miniStat = (label, val, icon, cls) => `
  <div class="stat-card ${cls}" style="min-height:110px;">
    <div class="stat-icon">${icon}</div>
    <div>
      <div class="stat-label">${label}</div>
      <div class="stat-val" style="font-size:26px;">${val}</div>
    </div>
  </div>`;

