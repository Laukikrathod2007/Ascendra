import { getState, setState } from "../store/state.js";
import "../styles/dashboard.css";
import { goalHealthScore } from "../utils/engine.js";
import { SUBMISSION_STATUS, ROLES } from "../utils/constants.js";
import { notifyEscalation, notifyCheckinReminder } from "../utils/notifications.js";

const AVATAR_COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#14B8A6"];

const INTERVENTION_QUEUE = [
  { initials:"AC", color:"#6366F1", name:"Alex Chen",    dept:"Sales",       issue:"Q2 check-in overdue",        issueSub:"5 days overdue",          severity:"CRITICAL", owner:"Priya Singh",  ownerColor:"#10B981", due:"May 20, 2026" },
  { initials:"DP", color:"#F59E0B", name:"Daniel Park",  dept:"Engineering", issue:"Goal progress below target", issueSub:"23% vs expected 50%",     severity:"AT RISK",  owner:"Daniel Park",  ownerColor:"#F59E0B", due:"May 21, 2026" },
  { initials:"LB", color:"#10B981", name:"Lisa Brown",   dept:"Operations",  issue:"Approval pending",           issueSub:"Waiting for 7 days",      severity:"HIGH",     owner:"Morgan Blake", ownerColor:"#6366F1", due:"May 22, 2026" },
  { initials:"SK", color:"#EF4444", name:"Samir Khan",   dept:"Marketing",   issue:"No check-in submitted",      issueSub:"Q2 check-in not started", severity:"AT RISK",  owner:"Priya Singh",  ownerColor:"#10B981", due:"May 23, 2026" },
];

const MANAGER_EFFECTIVENESS = [
  { initials:"PS", color:"#10B981", name:"Priya Singh",  dept:"Operations",  teamSize:18, sla:"1.2 days", slaTrend:10, slaTrendDir:"down", checkin:89, checkinTrend:7,  checkinDir:"up",   risk:"Low",    riskColor:"#10B981" },
  { initials:"DP", color:"#F59E0B", name:"Daniel Park",  dept:"Engineering", teamSize:22, sla:"2.1 days", slaTrend:18, slaTrendDir:"up",   checkin:76, checkinTrend:12, checkinDir:"up",   risk:"Medium", riskColor:"#F59E0B" },
  { initials:"MB", color:"#6366F1", name:"Morgan Blake", dept:"Sales",       teamSize:16, sla:"3.6 days", slaTrend:25, slaTrendDir:"up",   checkin:61, checkinTrend:8,  checkinDir:"down", risk:"High",   riskColor:"#EF4444" },
  { initials:"SL", color:"#8B5CF6", name:"Sophia Lee",   dept:"Marketing",   teamSize:14, sla:"2.8 days", slaTrend:5,  slaTrendDir:"down", checkin:83, checkinTrend:4,  checkinDir:"up",   risk:"Medium", riskColor:"#F59E0B" },
];

const DEPT_GOALS = [
  { label:"Sales",       count:367, pct:38, color:"#6366F1" },
  { label:"Engineering", count:276, pct:29, color:"#3B82F6" },
  { label:"Operations",  count:184, pct:19, color:"#10B981" },
  { label:"Marketing",   count:78,  pct:8,  color:"#F59E0B" },
  { label:"HR",          count:60,  pct:6,  color:"#EF4444" },
];

const TREND_LABELS     = ["Apr 1","Apr 15","May 1","May 15","Jun 1","Jun 15"];
const TREND_COMPLETION = [52, 58, 62, 67, 65, 68.4];
const TREND_AT_RISK    = [18, 20, 22, 20, 22, 21.7];
const TREND_ESCALATION = [8,  7,  6,  5,  5,  5.3];

const INSIGHTS_STYLE = `
<style>
  .dash-insights-row {
    display: grid;
    grid-template-columns: 58fr 42fr;
    gap: 20px;
    margin-bottom: 4px;
  }
  .insight-item {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .insight-item:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.25) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  }
  .activity-feed-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .live-pulse {
    box-shadow: 0 0 8px #10B981;
    animation: live-blink 2s infinite ease-in-out;
  }
  @keyframes live-blink {
    0% { opacity: 0.4; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.15); }
    100% { opacity: 0.4; transform: scale(0.95); }
  }
  
  .dash-stat-card {
    position: relative;
    overflow: hidden;
    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s, border-color 0.22s;
  }
  .dash-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    border-color: var(--primary-light);
  }
  
  @media (max-width: 1200px) {
    .dash-insights-row {
      grid-template-columns: 1fr;
    }
  }
</style>
`;

// ── SEVERITY BADGE ────────────────────────────────────────────────
function severityBadge(s) {
  const map = {
    "CRITICAL": "background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;",
    "AT RISK":  "background:#FEF3C7;color:#D97706;border:1px solid #FDE68A;",
    "HIGH":     "background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;",
  };
  return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.04em;${map[s]||'background:#F1F5F9;color:#6B7280;'}">${s}</span>`;
}

// ── RISK BADGE ────────────────────────────────────────────────────
function riskBadge(risk, color) {
  return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;background:${color}12;color:${color};border:1px solid ${color}25;">${risk}</span>`;
}

// ── TREND ARROW ───────────────────────────────────────────────────
function trendArrow(val, dir) {
  const up = dir === "up";
  const color = up ? "#10B981" : "#EF4444";
  const arrow = up ? "↑" : "↓";
  return `<span style="color:${color};font-weight:800;font-size:11px;display:inline-flex;align-items:center;gap:2px;">${arrow} ${val}%</span>`;
}

// ── STAT CARD ─────────────────────────────────────────────────────
function statCard(icon, label, val, trend, trendDir, sparkColor) {
  const up = trendDir === "up";
  const trendColor = up ? "#10B981" : "#EF4444";
  const trendArrowChar = up ? "↑" : "↓";
  const pts = sparkColor === "#EF4444"
    ? "0,22 16,18 32,14 48,16 64,12 80,18"
    : sparkColor === "#F59E0B"
    ? "0,18 16,14 32,20 48,12 64,16 80,10"
    : "0,20 16,14 32,10 48,12 64,8 80,12";
    
  const key = label.replace(/\s+/g, '');
  return `<div class="dash-stat-card">
    <div class="dash-stat-top">
      <div class="dash-stat-icon">${icon}</div>
      <div class="dash-stat-info">
        <div class="dash-stat-label">${label}</div>
        <div class="dash-stat-val">${val}</div>
      </div>
    </div>
    <div class="dash-stat-bottom" style="margin-top:12px;">
      <svg width="100%" height="24" viewBox="0 0 80 24" preserveAspectRatio="none" style="display:block;margin-bottom:6px;">
        <defs>
          <linearGradient id="sparkGrad-${key}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${sparkColor}" stop-opacity="0.18" />
            <stop offset="100%" stop-color="${sparkColor}" stop-opacity="0.00" />
          </linearGradient>
        </defs>
        <path d="M 0,24 L ${pts.split(' ').join(' L ')} L 80,24 Z" fill="url(#sparkGrad-${key})" />
        <polyline fill="none" stroke="${sparkColor}" stroke-width="1.8" points="${pts}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      </svg>
      <div class="dash-stat-trend" style="color:${trendColor};font-size:11px;font-weight:700;">${trendArrowChar} ${trend} vs last quarter</div>
    </div>
  </div>`;
}

// ── LIVE ACTIVITY FEED ────────────────────────────────────────────
const renderLiveActivityFeed = (logs) => {
  const sortedLogs = [...logs].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  return `
    <div class="card live-activity-card" style="display: flex; flex-direction: column; height: 100%;">
      <div class="dash-card-header">
        <div class="dash-card-title">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span class="live-pulse" style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
            Governance Activity Ledger
          </span>
        </div>
        <a class="dash-view-all" onclick="window.navigate('tracing')">Audit Trail</a>
      </div>
      <div class="activity-feed-scroll" style="flex: 1; overflow-y: auto; padding: 10px 20px 20px; display: flex; flex-direction: column; gap: 14px; max-height: 236px;">
        ${sortedLogs.map(log => {
          const initials = log.user.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
          const roleColor = log.role === "ADMIN" ? "#EF4444" : log.role === "MANAGER" ? "#F59E0B" : "#10B981";
          const timeStr = new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          return `
            <div style="display: flex; gap: 12px; border-bottom: 1px solid rgba(0,0,0,0.03); padding-bottom: 10px;">
              <div style="width: 32px; height: 32px; border-radius: var(--radius); background: ${roleColor}12; border: 1px solid ${roleColor}33; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${roleColor}; flex-shrink: 0;">
                ${initials}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text);">${log.user}</span>
                  <span style="font-size: 10px; font-weight: 700; color: var(--muted);">${timeStr}</span>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: var(--primary);">${log.action}</div>
                <div style="font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">${log.reason || log.field || ""}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
};

export const renderAdminDashboard = () => {
  const { goalSheets, employees, auditLogs, currentUser } = getState();

  const totalEmp = employees.filter(e => e.role === ROLES.EMPLOYEE).length;
  const activeSheets = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED || s.status === SUBMISSION_STATUS.APPROVED).length;
  const approvalBacklog = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length;
  const allGoals = goalSheets.reduce((acc, s) => acc.concat(s.goals || []), []);
  const healthyGoals = allGoals.filter(g => {
    const sheet = goalSheets.find(s => s.goals && s.goals.includes(g));
    return sheet && goalHealthScore(g, sheet) === "Healthy";
  });
  const avgHealth = allGoals.length ? Math.round((healthyGoals.length / allGoals.length) * 100) : 72;
  const escalationCount = (auditLogs || []).filter(l => /Escalation/i.test(l.action || "")).length;
  const now = new Date();
  const lastUpdated = now.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) + " " + now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

  return `
    ${INSIGHTS_STYLE}
    <div class="dash-root">

    <!-- PAGE HEADER -->
    <div class="dash-header">
      <div class="dash-header-left">
        <div class="dash-welcome">Welcome back, ${currentUser.name || "Admin"} <span>👋</span></div>
        <div class="dash-welcome-sub">Here's your organization's execution overview and performance health.</div>
      </div>
      <div class="dash-header-right">
        <span class="dash-last-updated">Last updated: ${lastUpdated}</span>
        <button class="dash-refresh-btn" onclick="window.navigate('admin')" title="Refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="dash-stats-grid">
      ${statCard(
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        "Total Employees", "1,248", "8.2%", "up", "#6366F1"
      )}
      ${statCard(
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
        "Active Goal Sheets", activeSheets || "965", "6.1%", "up", "#10B981"
      )}
      ${statCard(
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        "Approval Backlog", approvalBacklog || "42", "12.5%", "down", "#F59E0B"
      )}
      ${statCard(
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        "Avg Goal Health", avgHealth + "%" || "72%", "5.3%", "up", "#6366F1"
      )}
      ${statCard(
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        "Escalation Count", escalationCount || "18", "18.0%", "down", "#EF4444"
      )}
    </div>

    <!-- AI INSIGHTS & SCROLLING ACTIVITY FEED ROW -->
    <div class="dash-insights-row">
      <!-- AI Strategic Insights -->
      <div class="card insights-panel" style="display: flex; flex-direction: column; gap: 16px; padding: 20px;">
        <div class="dash-card-header" style="padding: 0;">
          <div class="dash-card-title" style="font-size: 14px;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Strategic Execution Insights
            </span>
          </div>
          <span class="badge badge-primary" style="font-size: 9px; padding: 3px 8px; border-radius: 6px; font-weight: 800;">AI Copilot</span>
        </div>
        
        <div class="insights-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1;">
          <!-- Bottleneck 1 -->
          <div class="insight-item card" style="background: rgba(239, 68, 68, 0.02); border-color: rgba(239, 68, 68, 0.08); padding: 14px; display: flex; flex-direction: column; gap: 8px; border-radius: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="badge" style="background: rgba(239, 68, 68, 0.08); color: #EF4444; font-size: 9px; font-weight: 800; border: 1px solid rgba(239,68,68,0.15); padding: 2px 6px;">CRITICAL RISK</span>
              <span style="font-size: 10px; font-weight: 700; color: var(--muted);">Confidence: 94%</span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">Engineering Approval SLA degraded 12%</div>
            <div style="font-size: 11.5px; color: var(--muted); line-height: 1.4; flex: 1;">Daniel Park's average team turnaround SLA has drifted to 2.1 days, delaying critical roadmaps.</div>
            <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--primary); cursor: pointer;" onclick="window.navigate('smart-queue')">
              Open Smart Intervention Queue <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
          
          <!-- Bottleneck 2 -->
          <div class="insight-item card" style="background: rgba(245, 158, 11, 0.02); border-color: rgba(245, 158, 11, 0.08); padding: 14px; display: flex; flex-direction: column; gap: 8px; border-radius: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.08); color: #F59E0B; font-size: 9px; font-weight: 800; border: 1px solid rgba(245,158,11,0.15); padding: 2px 6px;">CYCLE SLIPPAGE</span>
              <span style="font-size: 10px; font-weight: 700; color: var(--muted);">Confidence: 87%</span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">Sales cycle velocity slowing down</div>
            <div style="font-size: 11.5px; color: var(--muted); line-height: 1.4; flex: 1;">Morgan Blake's team has 6 draft sheets remaining with targets unaligned. Looming deadline.</div>
            <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--primary); cursor: pointer;" onclick="window.sendCheckinReminders()">
              Send Bulk Goal Reminders <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Live Audit feed -->
      ${renderLiveActivityFeed(auditLogs)}
    </div>

    <!-- CHARTS ROW -->
    <div class="dash-charts-row">
      <!-- Execution Trend -->
      <div class="card dash-chart-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Execution Trend
            <span class="dash-card-info-icon" title="Completion %, At Risk %, Escalation % over the quarter">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
          </div>
          <div class="dash-card-actions">
            <button class="dash-period-btn">This Quarter <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>
        </div>
        <div class="dash-chart-legend">
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#6366F1;"></span>Completion %</span>
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#F59E0B;"></span>At Risk %</span>
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#EF4444;"></span>Escalation %</span>
        </div>
        <div style="padding:0 20px 20px;">
          <div style="position:relative;height:220px;">
            <canvas id="area-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Goals by Department -->
      <div class="card dash-donut-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Goals by Department</div>
          <div class="dash-card-actions">
            <button class="dash-period-btn">This Quarter <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>
        </div>
        <div class="dash-donut-body">
          <div class="dash-donut-chart-wrap">
            <canvas id="donut-chart" style="max-width:180px;max-height:180px;"></canvas>
            <div class="dash-donut-center">
              <div class="dash-donut-center-label">Total</div>
              <div class="dash-donut-center-val" id="donut-center-val">965</div>
              <div class="dash-donut-center-sub">Goals</div>
            </div>
          </div>
          <div class="dash-donut-legend">
            ${DEPT_GOALS.map(d => `
              <div class="dash-donut-legend-row">
                <span class="dash-donut-legend-dot" style="background:${d.color};"></span>
                <span class="dash-donut-legend-label">${d.label}</span>
                <span class="dash-donut-legend-count">${d.count}</span>
                <span class="dash-donut-legend-pct">(${d.pct}%)</span>
              </div>`).join("")}
          </div>
        </div>
        <div class="dash-donut-footer" onclick="window.navigate('completion')">
          View detailed breakdown <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
      </div>
    </div>

    <!-- BOTTOM TABLES ROW -->
    <div class="dash-tables-row">
      <!-- Priority Intervention Queue -->
      <div class="card dash-table-card">
        <div class="dash-card-header">
          <div class="dash-card-title">
            Priority Intervention Queue
            <span class="dash-count-badge">${INTERVENTION_QUEUE.length}</span>
          </div>
          <a class="dash-view-all" onclick="window.navigate('smart-queue')">View all</a>
        </div>
        <div class="dash-table-wrap">
          <table class="dash-tbl">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>ISSUE</th>
                <th>SEVERITY</th>
                <th>OWNER</th>
                <th>DUE DATE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${INTERVENTION_QUEUE.map(item => `
                <tr class="dash-tbl-row" onclick="window.navigate('smart-queue')">
                  <td>
                    <div class="dash-emp-cell">
                      <div class="dash-emp-avatar" style="background:${item.color};">${item.initials}</div>
                      <div>
                        <div class="dash-emp-name">${item.name}</div>
                        <div class="dash-emp-dept">${item.dept}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="dash-issue-title">${item.issue}</div>
                    <div class="dash-issue-sub">${item.issueSub}</div>
                  </td>
                  <td>${severityBadge(item.severity)}</td>
                  <td>
                    <div class="dash-owner-cell">
                      <div class="dash-owner-avatar" style="background:${item.ownerColor};">${item.owner.split(" ").map(w=>w[0]).join("")}</div>
                      <span class="dash-owner-name">${item.owner}</span>
                    </div>
                  </td>
                  <td class="dash-due-date">${item.due}</td>
                  <td>
                    <button class="dash-more-btn" title="More options">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Manager Effectiveness -->
      <div class="card dash-table-card">
        <div class="dash-card-header">
          <div class="dash-card-title">Manager Effectiveness</div>
          <a class="dash-view-all" onclick="window.navigate('manager-effectiveness')">View all</a>
        </div>
        <div class="dash-table-wrap">
          <table class="dash-tbl">
            <thead>
              <tr>
                <th>MANAGER</th>
                <th>TEAM SIZE</th>
                <th>APPROVAL SLA</th>
                <th>CHECK-IN RATE</th>
                <th>RISK INDEX</th>
              </tr>
            </thead>
            <tbody>
              ${MANAGER_EFFECTIVENESS.map(m => `
                <tr class="dash-tbl-row" onclick="window.navigate('manager-effectiveness')">
                  <td>
                    <div class="dash-emp-cell">
                      <div class="dash-emp-avatar" style="background:${m.color};">${m.initials}</div>
                      <div>
                        <div class="dash-emp-name">${m.name}</div>
                        <div class="dash-emp-dept">${m.dept}</div>
                      </div>
                    </div>
                  </td>
                  <td class="dash-team-size">${m.teamSize}</td>
                  <td>
                    <div class="dash-sla-cell">
                      <span class="dash-sla-val">${m.sla}</span>
                      ${trendArrow(m.slaTrend, m.slaTrendDir)}
                    </div>
                  </td>
                  <td>
                    <div class="dash-sla-cell">
                      <span class="dash-sla-val">${m.checkin}%</span>
                      ${trendArrow(m.checkinTrend, m.checkinDir)}
                    </div>
                  </td>
                  <td>${riskBadge(m.risk, m.riskColor)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BOTTOM STATUS BAR -->
    <div class="dash-status-bar">
      <div class="dash-status-item">
        <div class="dash-status-icon dash-status-green">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div class="dash-status-label">System Health</div>
          <div class="dash-status-val">All Systems Operational</div>
        </div>
      </div>
      <div class="dash-status-divider"></div>
      <div class="dash-status-item">
        <div class="dash-status-icon dash-status-blue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div class="dash-status-label">Data Freshness</div>
          <div class="dash-status-val">5 mins ago</div>
        </div>
      </div>
      <div class="dash-status-divider"></div>
      <div class="dash-status-item">
        <div class="dash-status-icon dash-status-green">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div class="dash-status-label">Audit Logging</div>
          <div class="dash-status-val">Active</div>
        </div>
      </div>
      <div class="dash-status-divider"></div>
      <div class="dash-status-item" onclick="window.showNotifications()" style="cursor:pointer;">
        <div class="dash-status-icon dash-status-orange">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div>
          <div class="dash-status-label">Notifications</div>
          <div class="dash-status-val" style="color:#F59E0B;">23 Unread</div>
        </div>
      </div>
      <div class="dash-status-divider"></div>
      <div class="dash-status-item" onclick="window.showHelp()" style="cursor:pointer;">
        <div class="dash-status-icon dash-status-blue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <div class="dash-status-label">Help &amp; Support</div>
          <div class="dash-status-val" style="color:#6366F1;">View Documentation</div>
        </div>
      </div>
    </div>

  </div>`;
};

// ── ESCALATION HANDLER ────────────────────────────────────────────
window.runEscalation = (_count) => {
  const { goalSheets, employees, currentUser, auditLogs } = getState();
  const overdueSheets = goalSheets.filter(s => s.status === "Draft");
  if (overdueSheets.length === 0) { alert("No overdue sheets found."); return; }
  overdueSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId);
    if (emp) notifyEscalation(emp, currentUser, 2);
  });
  setState({ auditLogs: [{ id: Date.now(), user: currentUser.name, role: currentUser.role, action: "Escalation Triggered", field: "Goal Sheet Submission", before: "Pending", after: `${overdueSheets.length} escalation(s) sent`, reason: `Admin triggered escalation for ${overdueSheets.length} overdue goal sheet(s)`, timestamp: new Date().toISOString() }, ...auditLogs] });
  alert(`Escalation emails sent to ${overdueSheets.length} employee(s).\n\nAudit log updated.`);
};

// ── CHECK-IN REMINDER HANDLER ─────────────────────────────────────
window.sendCheckinReminders = () => {
  const { goalSheets, employees, system, currentUser, auditLogs } = getState();
  const approvedSheets = goalSheets.filter(s => s.status === "Approved");
  if (approvedSheets.length === 0) { alert("No approved goal sheets found."); return; }
  approvedSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId);
    if (emp) notifyCheckinReminder(emp, system.currentCycle, "End of this month");
  });
  setState({ auditLogs: [{ id: Date.now(), user: currentUser.name, role: currentUser.role, action: "Check-in Reminders Sent", field: `${system.currentCycle} Review`, before: "Not Sent", after: `${approvedSheets.length} reminder(s) sent`, reason: `Admin sent ${system.currentCycle} check-in reminders`, timestamp: new Date().toISOString() }, ...auditLogs] });
  alert(`Check-in reminders sent to ${approvedSheets.length} employee(s) for ${system.currentCycle}.`);
};
