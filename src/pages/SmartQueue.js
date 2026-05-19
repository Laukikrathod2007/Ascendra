import { getState, setState } from '../store/state.js';
import { goalHealthScore } from '../utils/engine.js';

const QUEUE_STYLE = `
<style>
  .queue-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 20px;
  }
  
  .queue-item {
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 16px 20px;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .queue-item:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.25);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
  
  .queue-emp-avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  
  .queue-info {
    flex: 1;
    min-width: 0;
  }
  
  .queue-title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
    line-height: 1.4;
  }
  
  .queue-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
    flex-wrap: wrap;
  }
  
  .queue-metrics {
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: right;
    flex-shrink: 0;
  }
  
  .queue-health-pill {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .health-pill-critical { background: rgba(239, 68, 68, 0.08); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.15); }
  .health-pill-risk { background: rgba(245, 158, 11, 0.08); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.15); }
  .health-pill-healthy { background: rgba(16, 185, 129, 0.08); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.15); }
  
  .queue-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    .queue-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }
    .queue-metrics {
      width: 100%;
      justify-content: space-between;
      text-align: left;
    }
    .queue-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
`;

export const renderSmartQueue = () => {
  const { goalSheets, employees, auditLogs } = getState();
  
  // Flatten goals with metadata
  const items = [];
  goalSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId) || { name: sheet.employeeId, dept: 'N/A' };
    (sheet.goals || []).forEach(g => {
      const health = goalHealthScore(g, sheet);
      const lastUpdated = g.lastUpdatedAt ? new Date(g.lastUpdatedAt) : null;
      const daysStale = lastUpdated ? Math.floor((Date.now() - lastUpdated)/ (1000*60*60*24)) : 999;
      const escalations = auditLogs.filter(a => (a.action||'').toLowerCase().includes('escalation') && (a.reason||'').includes(sheet.employeeId)).length;
      items.push({ goal: g, sheet, emp, health, daysStale, escalations });
    });
  });

  // Priority: Critical, At Risk, then Healthy; within same health sort by escalations desc, daysStale desc
  items.sort((a,b) => {
    const rank = { 'Critical': 0, 'At Risk': 1, 'Healthy': 2 };
    if (rank[a.health] !== rank[b.health]) return rank[a.health] - rank[b.health];
    if (b.escalations !== a.escalations) return b.escalations - a.escalations;
    return b.daysStale - a.daysStale;
  });

  const renderQueueItem = (it) => {
    const initials = it.emp.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
    const avatarBg = it.emp.role === 'ADMIN' ? '#EF4444' : it.emp.role === 'MANAGER' ? '#F59E0B' : '#6366F1';
    
    let healthClass = 'health-pill-healthy';
    if (it.health === 'Critical') healthClass = 'health-pill-critical';
    if (it.health === 'At Risk') healthClass = 'health-pill-risk';
    
    return `
      <div class="queue-item">
        <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:0;">
          <div class="queue-emp-avatar" style="background:${avatarBg};">${initials}</div>
          <div class="queue-info">
            <div class="queue-title">${it.goal.title}</div>
            <div class="queue-meta">
              <span style="font-weight:700; color:var(--text);">${it.emp.name}</span>
              <span>•</span>
              <span>${it.emp.dept}</span>
              <span>•</span>
              <span class="badge badge-neutral" style="font-size:9px;">${it.goal.area || 'General'}</span>
              <span>•</span>
              <span>Cycle status: <strong>${it.sheet.status}</strong></span>
            </div>
          </div>
        </div>
        
        <div class="queue-metrics">
          <div>
            <span class="queue-health-pill ${healthClass}">${it.health}</span>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11.5px; font-weight:700; color:var(--text);">Stale ${it.daysStale === 999 ? 'Unknown' : it.daysStale + ' days'}</div>
            <div style="font-size:9.5px; color:var(--muted); margin-top:2px;">Escalations: ${it.escalations}</div>
          </div>
        </div>
        
        <div class="queue-actions">
          <button class="btn btn-ghost btn-sm" onclick="window.navigate('team', '${it.emp.id}')">Intervene</button>
          <button class="btn btn-danger-o btn-sm" onclick="window.escalateGoalQueue('${it.emp.id}', '${it.goal.id}', '${it.goal.title.replace(/'/g, "\\'")}')">Escalate</button>
        </div>
      </div>
    `;
  };

  return `
    ${QUEUE_STYLE}
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Admin › <span>Smart Attention Queue</span></div>
          <div class="page-title">Smart Intervention Queue</div>
          <div class="page-sub">Prioritized cockpit operational board of objectives requiring high-priority leadership governance.</div>
        </div>
      </div>

      <div class="card" style="padding: 16px 20px; margin-bottom: 20px; display:flex; align-items:center; justify-content:space-between; background:rgba(239,68,68,0.02); border-color:rgba(239,68,68,0.12);">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:20px;">🚨</div>
          <div>
            <div style="font-size:13.5px; font-weight:800; color:var(--text);">Critical Action Queue</div>
            <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">Sort algorithm weighted by objective health status, stale counters and escalation logs.</div>
          </div>
        </div>
        <span class="badge badge-danger" style="padding:4px 10px; font-size:11px; font-weight:800;">${items.filter(i=>i.health==='Critical').length} CRITICAL BLOCKS</span>
      </div>

      <div class="queue-list">
        ${items.length === 0 
          ? `<div class="card" style="padding:60px 20px;"><div class="empty-state"><div class="empty-state-icon">🟢</div><div class="empty-state-title">Cockpit Status Healthy</div><div class="empty-state-sub">Zero execution anomalies detected across all team objectives.</div></div></div>` 
          : items.slice(0,50).map(renderQueueItem).join('')
        }
      </div>
    </div>
  `;
};

window.escalateGoalQueue = (empId, goalId, goalTitle) => {
  const { currentUser, auditLogs } = getState();
  const nowIso = new Date().toISOString();
  
  const newAudit = {
    id: Date.now(),
    user: currentUser.name,
    role: currentUser.role,
    action: "Escalation Sent",
    field: `Goal: ${goalTitle.slice(0,35)}...`,
    before: "Active",
    after: "Escalated",
    reason: `Priority cockpit escalation dispatched to manager for employee ${empId} (Goal ID: ${goalId})`,
    timestamp: nowIso
  };
  
  setState({ auditLogs: [newAudit, ...auditLogs] });
  alert(`Smart Execution Escalation dispatched successfully to manager for goal: "${goalTitle}"\n\nAudit log updated.`);
  window.navigate('smart-queue');
};
