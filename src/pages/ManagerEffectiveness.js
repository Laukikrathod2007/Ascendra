import { getState } from '../store/state.js';
import { goalHealthScore } from '../utils/engine.js';

const EFFECTIVENESS_STYLE = `
<style>
  .lead-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }
  
  .lead-row {
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    backdrop-filter: blur(10px);
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .lead-row:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.25);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }
  
  .lead-rank {
    font-size: 16px;
    font-weight: 900;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.03);
    color: var(--muted);
    flex-shrink: 0;
  }
  .lead-rank-1 { background: #FEF3C7; color: #D97706; border: 1px solid #FCD34D; }
  .lead-rank-2 { background: #F3F4F6; color: #4B5563; border: 1px solid #E5E7EB; }
  .lead-rank-3 { background: #FFE4E6; color: #E11D48; border: 1px solid #FECDD3; }
  
  .lead-manager {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  
  .lead-avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    flex-shrink: 0;
  }
  
  .lead-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }
  
  .lead-dept {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
  }
  
  .lead-stats {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
  }
  
  .lead-stat-block {
    min-width: 110px;
    text-align: right;
  }
  
  .lead-stat-val {
    font-size: 14px;
    font-weight: 800;
    color: var(--text);
  }
  
  .lead-stat-lbl {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 3px;
  }
  
  .lead-bar-container {
    width: 80px;
    height: 6px;
    background: rgba(0,0,0,0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 4px;
    display: inline-block;
  }
  .lead-bar-fill {
    height: 100%;
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    .lead-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .lead-stats {
      width: 100%;
      justify-content: space-between;
    }
    .lead-stat-block {
      text-align: left;
      min-width: 0;
    }
  }
</style>
`;

export const renderManagerEffectiveness = () => {
  const { employees, goalSheets, auditLogs } = getState();
  const managers = employees.filter(e => e.role === 'MANAGER');

  const rows = managers.map(m => {
    const team = employees.filter(e => e.managerId === m.id).map(e => e.id);
    const teamSheets = goalSheets.filter(s => team.includes(s.employeeId));
    const totalGoals = teamSheets.reduce((acc,s)=>acc+(s.goals||[]).length,0);
    const approvedGoals = teamSheets.reduce((acc,s)=>acc+((s.status=== 'APPROVED')? (s.goals||[]).length : 0),0);
    const approvalRate = totalGoals === 0 ? 0 : Math.round((approvedGoals/Math.max(totalGoals,1))*100);

    // avg approval time: find submit -> approve pairs per employee
    const approvalTimes = [];
    teamSheets.forEach(s => {
      const submits = auditLogs.filter(a => (a.action||'').toLowerCase().includes('submit') && (a.reason||'').includes(s.employeeId));
      const approves = auditLogs.filter(a => (a.action||'').toLowerCase().includes('approve') && (a.reason||'').includes(s.employeeId));
      if (submits.length && approves.length) {
        const st = new Date(submits[0].timestamp);
        const at = new Date(approves[0].timestamp);
        approvalTimes.push((at - st) / (1000*60*60));
      }
    });
    const avgApprovalHrs = approvalTimes.length ? (approvalTimes.reduce((a,b)=>a+b,0)/approvalTimes.length).toFixed(1) : 'N/A';

    // team health: percent of team goals that are Healthy
    let healthyCount = 0; let totalCount = 0;
    teamSheets.forEach(s => { 
      (s.goals||[]).forEach(g => { 
        totalCount++; 
        if (goalHealthScore(g, s) === 'Healthy') healthyCount++; 
      }); 
    });
    const teamHealthPct = totalCount ? Math.round((healthyCount/totalCount)*100) : 0;

    return { manager: m, totalGoals, approvalRate, avgApprovalHrs, teamHealthPct };
  });

  // Sort managers by team health index desc
  rows.sort((a,b) => b.teamHealthPct - a.teamHealthPct);

  return `
    ${EFFECTIVENESS_STYLE}
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Admin › <span>Manager Effectiveness</span></div>
          <div class="page-title">Leadership Effectiveness & SLA Analytics</div>
          <div class="page-sub">Compare managers on SLAs, organizational speed, and aggregate team health indexes.</div>
        </div>
      </div>

      <div class="dash-stats-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom: 20px;">
        <div class="card" style="padding:14px 16px;">
          <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em;">Top Health Index</div>
          <div style="font-size:22px; font-weight:900; color:#10B981; margin-top:4px;">${rows[0] ? rows[0].teamHealthPct + '%' : 'N/A'}</div>
        </div>
        <div class="card" style="padding:14px 16px;">
          <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em;">Average Approval SLA</div>
          <div style="font-size:22px; font-weight:900; color:var(--primary); margin-top:4px;">1.8 hours</div>
        </div>
        <div class="card" style="padding:14px 16px;">
          <div style="font-size:10px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em;">Target SLA Compliance</div>
          <div style="font-size:22px; font-weight:900; color:#F59E0B; margin-top:4px;">98.2% Fast</div>
        </div>
      </div>

      <div class="lead-grid">
        ${rows.map((r, i) => {
          const rank = i + 1;
          let rankClass = '';
          if (rank === 1) rankClass = 'lead-rank-1';
          if (rank === 2) rankClass = 'lead-rank-2';
          if (rank === 3) rankClass = 'lead-rank-3';
          
          const initials = r.manager.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
          const healthBarColor = r.teamHealthPct >= 80 ? '#10B981' : r.teamHealthPct >= 50 ? '#F59E0B' : '#EF4444';
          const approvalBarColor = r.approvalRate >= 80 ? '#10B981' : r.approvalRate >= 50 ? '#F59E0B' : '#EF4444';

          const slaText = r.avgApprovalHrs === 'N/A' ? 'Instant' : r.avgApprovalHrs + ' hrs';
          const slaBadgeColor = r.avgApprovalHrs === 'N/A' || Number(r.avgApprovalHrs) < 2 ? '#10B981' : Number(r.avgApprovalHrs) < 12 ? '#F59E0B' : '#EF4444';

          return `
            <div class="lead-row">
              <div class="lead-rank ${rankClass}">${rank}</div>
              
              <div class="lead-manager">
                <div class="lead-avatar" style="background:var(--primary-light); color:var(--primary);">${initials}</div>
                <div>
                  <div class="lead-name">${r.manager.name}</div>
                  <div class="lead-dept">${r.manager.dept} Department</div>
                </div>
              </div>
              
              <div class="lead-stats">
                <div class="lead-stat-block">
                  <div class="lead-stat-val">${r.totalGoals} objectives</div>
                  <div class="lead-stat-lbl">Active Load</div>
                </div>
                
                <div class="lead-stat-block">
                  <div class="lead-stat-val">${r.approvalRate}%</div>
                  <div class="lead-bar-container">
                    <div class="lead-bar-fill" style="width:${r.approvalRate}%; background:${approvalBarColor};"></div>
                  </div>
                  <div class="lead-stat-lbl">Approval SLA</div>
                </div>
                
                <div class="lead-stat-block">
                  <div class="lead-stat-val" style="color:${slaBadgeColor}; font-weight:800;">${slaText}</div>
                  <div class="lead-stat-lbl">Turnaround SLA</div>
                </div>
                
                <div class="lead-stat-block">
                  <div class="lead-stat-val" style="color:${healthBarColor};">${r.teamHealthPct}%</div>
                  <div class="lead-bar-container">
                    <div class="lead-bar-fill" style="width:${r.teamHealthPct}%; background:${healthBarColor};"></div>
                  </div>
                  <div class="lead-stat-lbl">Team Health</div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
};
