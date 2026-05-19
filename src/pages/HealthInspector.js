import { getState } from '../store/state.js';
import { goalHealthScore } from '../utils/engine.js';

const HEALTH_STYLE = `
<style>
  .health-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
  }
  
  .health-column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }
  
  .health-column-critical { background: rgba(239, 68, 68, 0.08); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.15); }
  .health-column-risk { background: rgba(245, 158, 11, 0.08); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.15); }
  .health-column-healthy { background: rgba(16, 185, 129, 0.08); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.15); }
  
  .health-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .health-card {
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 14px 16px;
    backdrop-filter: blur(8px);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .health-card:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.25);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
  
  .health-card-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
    line-height: 1.4;
  }
  
  .health-card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 11px;
    color: var(--muted);
  }
  
  .health-card-operator {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.03);
  }
  
  .health-card-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 800;
    color: #fff;
  }
  
  @media (max-width: 1024px) {
    .health-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
`;

export const renderHealthInspector = () => {
  const { goalSheets, employees, auditLogs } = getState();
  const allGoals = goalSheets.reduce((acc, s) => acc.concat((s.goals || []).map(g => ({ goal: g, sheet: s }))), []);
  const grouped = allGoals.reduce((acc, { goal, sheet }) => {
    const h = goalHealthScore(goal, sheet);
    if (!acc[h]) acc[h] = [];
    acc[h].push({ goal, sheet });
    return acc;
  }, {});

  const total = allGoals.length;
  const critical = (grouped['Critical'] || []).length;
  const atRisk = (grouped['At Risk'] || []).length;
  const healthy = (grouped['Healthy'] || []).length;
  const healthyPct = total ? Math.round((healthy / total) * 100) : 100;

  const renderCard = ({ goal, sheet }) => {
    const emp = employees.find(e => e.id === sheet.employeeId) || { name: sheet.employeeId, dept: 'N/A' };
    const initials = emp.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const avatarBg = emp.role === 'ADMIN' ? '#EF4444' : emp.role === 'MANAGER' ? '#F59E0B' : '#10B981';
    
    return `
      <div class="health-card">
        <div class="health-card-title">${goal.title}</div>
        <div class="health-card-meta">
          <span class="badge badge-primary" style="font-size:9px;">${goal.area || 'General'}</span>
          <span class="badge badge-neutral" style="font-size:9px;">${goal.weight}% Wt</span>
          <span style="font-size:10px;">Target: <strong>${goal.target}</strong></span>
        </div>
        <div class="health-card-operator">
          <div class="health-card-avatar" style="background:${avatarBg};">${initials}</div>
          <span style="font-weight:700;font-size:11.5px;color:var(--text);">${emp.name}</span>
          <span style="font-size:10px;color:var(--muted);margin-left:auto;">${emp.dept}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:6px;border-top:1px dashed rgba(0,0,0,0.04);">
          <span style="font-size:10px;color:var(--muted);">Status: <strong style="color:var(--primary);">${sheet.status}</strong></span>
          <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:10px;" onclick="window.navigate('team', '${emp.id}')">Review →</button>
        </div>
      </div>`;
  };

  return `
    ${HEALTH_STYLE}
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Admin › <span>Health Inspector</span></div>
          <div class="page-title">Execution Health Inspector</div>
          <div class="page-sub">Aggregate objective health metrics across the organization to resolve silent failure points.</div>
        </div>
      </div>

      <!-- OVERALL HEALTH CARD -->
      <div class="card mb-20" style="padding:16px 20px; display:flex; align-items:center; gap:20px; background:rgba(99,102,241,0.03); border-color:rgba(99,102,241,0.15);">
        <div style="width:52px; height:52px; border-radius:14px; background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); display:flex; align-items:center; justify-content:center; color:var(--primary); font-size:24px; font-weight:800; flex-shrink:0;">
          📊
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em;">Overall Governance Score</div>
          <div style="font-size:24px; font-weight:900; color:var(--text); margin-top:2px;">
            ${healthyPct}% Objectives Healthy
            <span style="font-size:13px; font-weight:700; color:var(--muted); margin-left:8px;">(${healthy} of ${total} total objectives)</span>
          </div>
        </div>
        <button class="btn btn-primary" style="margin-left:auto;" onclick="window.sendCheckinReminders()">Trigger Pulse Alerts</button>
      </div>

      <!-- STATUS COLUMNS -->
      <div class="health-grid">
        <!-- Critical Column -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div class="health-column-header health-column-critical">
            <span>Critical Alerts</span>
            <span class="badge badge-danger">${critical}</span>
          </div>
          <div class="health-list">
            ${ (grouped['Critical'] || []).map(renderCard).join('') || '<div class="empty-state" style="padding:40px 10px;"><div class="empty-state-icon">🟢</div><div class="empty-state-title" style="font-size:13px;">No critical failures</div></div>' }
          </div>
        </div>
        
        <!-- At Risk Column -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div class="health-column-header health-column-risk">
            <span>At Risk Objectives</span>
            <span class="badge badge-warning">${atRisk}</span>
          </div>
          <div class="health-list">
            ${ (grouped['At Risk'] || []).map(renderCard).join('') || '<div class="empty-state" style="padding:40px 10px;"><div class="empty-state-icon">🟢</div><div class="empty-state-title" style="font-size:13px;">No at-risk objectives</div></div>' }
          </div>
        </div>
        
        <!-- Healthy Column -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div class="health-column-header health-column-healthy">
            <span>Healthy / On Track</span>
            <span class="badge badge-success">${healthy}</span>
          </div>
          <div class="health-list">
            ${ (grouped['Healthy'] || []).map(renderCard).join('') || '<div class="empty-state" style="padding:40px 10px;"><div class="empty-state-icon">📋</div><div class="empty-state-title" style="font-size:13px;">No active objectives</div></div>' }
          </div>
        </div>
      </div>
    </div>
  `;
};
