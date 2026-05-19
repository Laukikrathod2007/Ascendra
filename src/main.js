import "./style.css";
import { getState, setState } from "./store/state.js";
import { renderAdminDashboard } from "./pages/AdminDashboard.js";
import { renderGoalManagement } from "./pages/GoalManagement.js";
import { renderManagerReview } from "./pages/ManagerReview.js";
import { renderReports } from "./pages/Reports.js";
import { renderQuarterlyReview } from "./pages/QuarterlyReview.js";
import { renderAdminSettings } from "./pages/AdminSettings.js";
import { renderOrgTree } from "./pages/OrgTree.js";
import { renderCompletionDashboard } from "./pages/CompletionDashboard.js";
import { renderHealthInspector } from "./pages/HealthInspector.js";
import { renderTracing } from "./pages/Tracing.js";
import { renderSmartQueue } from "./pages/SmartQueue.js";
import { renderManagerEffectiveness } from "./pages/ManagerEffectiveness.js";
import { renderAnalytics } from "./pages/Analytics.js";
import { SUBMISSION_STATUS, ROLES } from "./utils/constants.js";

const ASCENDRA_LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ag" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38BFFF"/><stop offset="100%" stop-color="#1A56DB"/></linearGradient></defs><polygon points="30,4 8,56 20,56 30,32" fill="url(#ag)" opacity="0.95"/><polygon points="30,4 52,56 40,56 30,32" fill="#1A56DB" opacity="0.85"/><polygon points="22,40 38,40 34,50 26,50" fill="#0A2A6E" opacity="0.45"/></svg>`;

const ALL_NAV = [
  { id:"admin",       icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`, label:"Dashboard",        roles:["EMPLOYEE","MANAGER","ADMIN"] },
  { id:"goals",       icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`, label:"Goals",             roles:["EMPLOYEE","MANAGER"] },
  { id:"team",        icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, label:"Team Governance",  roles:["MANAGER","ADMIN"] },
  { id:"checkins",    icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`, label:"Quarterly Check-ins", roles:["EMPLOYEE","MANAGER","ADMIN"] },
  { id:"analytics",   icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, label:"Analytics",          roles:["MANAGER","ADMIN"] },
  
  // Governance / Secondary Tools
  { id:"health-inspector", icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`, label:"Health Inspector",  roles:["MANAGER","ADMIN"] },
  { id:"smart-queue", icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, label:"Smart Queue",       roles:["MANAGER","ADMIN"] },
  { id:"tracing",     icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:"Workflow Tracing",   roles:["MANAGER","ADMIN"] },
  { id:"manager-effectiveness", icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87a9 9 0 0 0-14 0A4 4 0 0 0 5 19v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, label:"Leader Performance", roles:["MANAGER","ADMIN"] },
  { id:"org",         icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><rect x="1" y="14" width="8" height="4" rx="1"/><rect x="15" y="14" width="8" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="11"/><line x1="5" y1="14" x2="5" y2="11"/><line x1="19" y1="14" x2="19" y2="11"/><line x1="5" y1="11" x2="19" y2="11"/></svg>`, label:"Org Structure",     roles:["MANAGER","ADMIN"] },
  { id:"completion",  icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="9 17 9 12 15 12 15 17"/></svg>`, label:"Completion Matrix",  roles:["ADMIN"] },
  { id:"audit",       icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, label:"Governance Audit",  roles:["MANAGER","ADMIN"] },
  { id:"settings",    icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, label:"Platform Settings", roles:["ADMIN"] },
];

function getNavForRole(role) {
  return ALL_NAV.filter(n => n.roles.includes(role));
}

function buildShell(user) {
  const navItems = getNavForRole(user.role);
  const roleLabel = user.role === ROLES.ADMIN ? "Administrator" : user.role === ROLES.MANAGER ? "Manager" : "Employee";
  const roleColor = user.role === ROLES.ADMIN ? "#EF4444" : user.role === ROLES.MANAGER ? "#F59E0B" : "#10B981";
  const { goalSheets } = getState();
  const pendingCount = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length;
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Core navigation consists of Dashboard, Goals, Team Governance, Quarterly Check-ins, Analytics
  const primaryIds = ["admin", "goals", "team", "checkins", "analytics"];
  const primaryItems = navItems.filter(n => primaryIds.includes(n.id));
  const secondaryItems = navItems.filter(n => !primaryIds.includes(n.id));

  const primaryLinks = primaryItems.map(n => `
    <div class="sb-link" data-page="${n.id}">
      <span class="sb-icon">${n.icon}</span>
      <span class="sb-link-label">${n.label}</span>
    </div>`).join("");

  let secondarySection = "";
  if (secondaryItems.length > 0) {
    const secondaryLinks = secondaryItems.map(n => `
      <div class="sb-link sb-link-secondary" data-page="${n.id}">
        <span class="sb-icon sb-icon-secondary">${n.icon}</span>
        <span class="sb-link-label sb-link-label-secondary">${n.label}</span>
      </div>`).join("");

    secondarySection = `
      <div class="sb-divider"></div>
      <details class="sb-details" open>
        <summary class="sb-details-summary">
          <span class="sb-details-summary-label">Governance Tools</span>
          <span class="sb-details-summary-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </summary>
        <div class="sb-details-content">
          ${secondaryLinks}
        </div>
      </details>
    `;
  }

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sb-brand">
        <div class="sb-logo-wrap">${ASCENDRA_LOGO_SVG}</div>
        <div class="sb-brand-text">
          <div class="sb-name">Ascendra</div>
          <div class="sb-tag">Enterprise Governance</div>
        </div>
      </div>
      <nav class="sb-nav">
        ${primaryLinks}
        ${secondarySection}
      </nav>
      <div class="sb-footer">
        <div class="sb-scope-container" style="position:relative; width:100%;">
          <div class="sb-scope-label">Governance Scope</div>
          <div class="sb-scope-select-wrap" onclick="window.toggleScopeDropdown(event)">
            <div class="sb-scope-icon" style="background:${roleColor}22;color:${roleColor};">${initials}</div>
            <div class="sb-scope-info">
              <div class="sb-scope-title">${user.name}</div>
              <div class="sb-scope-subtitle">${roleLabel} Context</div>
            </div>
            <div class="sb-scope-caret">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="sb-scope-dropdown" id="sb-scope-dropdown" style="display:none;position:absolute;bottom:100%;left:0;right:0;background:rgba(20, 24, 38, 0.98);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:8px;padding:8px;box-shadow:0 12px 36px rgba(0,0,0,0.5);z-index:9999;backdrop-filter:blur(12px);">
            <div style="font-size:9px;font-weight:800;color:rgba(255,255,255,0.4);padding:6px 8px 8px;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:6px;">Switch Operating Scope</div>
            <div class="sb-role-btns">
              <button class="sb-role-btn ${user.id === "EMP-001" ? "active" : ""}" onclick="window.switchRole('EMP-001')">
                <span class="sb-role-btn-dot" style="background:#10B981;"></span>
                <span class="sb-role-btn-text"><span class="sb-role-btn-name">Alex Chen</span><span class="sb-role-btn-tag">Employee Scope</span></span>
              </button>
              <button class="sb-role-btn ${user.id === "EMP-002" ? "active" : ""}" onclick="window.switchRole('EMP-002')">
                <span class="sb-role-btn-dot" style="background:#10B981;"></span>
                <span class="sb-role-btn-text"><span class="sb-role-btn-name">Sarah Miller</span><span class="sb-role-btn-tag">Employee Scope</span></span>
              </button>
              <button class="sb-role-btn ${user.id === "MGR-001" ? "active" : ""}" onclick="window.switchRole('MGR-001')">
                <span class="sb-role-btn-dot" style="background:#F59E0B;"></span>
                <span class="sb-role-btn-text"><span class="sb-role-btn-name">Morgan Blake</span><span class="sb-role-btn-tag">Manager Scope</span></span>
              </button>
              <button class="sb-role-btn ${user.id === "ADM-001" ? "active" : ""}" onclick="window.switchRole('ADM-001')">
                <span class="sb-role-btn-dot" style="background:#EF4444;"></span>
                <span class="sb-role-btn-text"><span class="sb-role-btn-name">Admin User</span><span class="sb-role-btn-tag">Admin Scope</span></span>
              </button>
            </div>
          </div>
        </div>
        <div class="sb-collapse-btn" id="collapse-btn" onclick="window.collapseSidebar()">
          <svg id="collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          <span class="sb-collapse-label">Collapse</span>
        </div>
      </div>
    </aside>

    <div class="layout-main" id="layout-main">
      <nav class="navbar">
        <button class="nb-hamburger" id="hamburger-btn" onclick="window.toggleSidebar()" aria-label="Toggle navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="nb-search">
          <span class="nb-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="global-search" placeholder="Search employees, goals, departments..." oninput="window.handleSearch(this.value)">
          <span class="nb-search-kbd">⌘ K</span>
        </div>
        <div id="search-results" style="display:none;position:absolute;top:64px;left:var(--sidebar-width);right:0;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:500;max-height:320px;overflow-y:auto;margin:0 28px;"></div>
        <div class="nb-spacer"></div>
        <div class="nb-quarter-selector" onclick="window.navigate('settings')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${getState().system.currentCycle === 'GOAL_SETTING' ? 'Goal Setting Phase' : getState().system.currentCycle + ' 2026 (Apr - Jun)'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="nb-icons">
          <div class="nb-icon-btn" id="notif-btn" title="Notifications" onclick="window.showNotifications()" style="position:relative;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span id="notif-badge" style="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#EF4444;border-radius:8px;font-size:9px;font-weight:800;color:#fff;display:${pendingCount > 0 ? "flex" : "none"};align-items:center;justify-content:center;padding:0 3px;">${pendingCount > 0 ? pendingCount : ""}</span>
          </div>
          <div class="nb-icon-btn" title="Help" onclick="window.showHelp()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
        <div class="nb-user" onclick="window.navigate('admin')">
          <div class="nb-avatar-wrap" style="background:${roleColor}22;border:2px solid ${roleColor}55;">
            <span style="font-size:12px;font-weight:800;color:${roleColor};">${initials}</span>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </nav>
      <div class="page-content" id="main-content"></div>
    </div>
  `;
}

// ── CHART LIFECYCLE ──────────────────────────────────────────────
function destroyCharts() {
  if (window._areaChart)  { try { window._areaChart.destroy();  } catch(e) {} window._areaChart  = null; }
  if (window._donutChart) { try { window._donutChart.destroy(); } catch(e) {} window._donutChart = null; }
}

window.initDashboardCharts = function() {
  if (!window.Chart) { console.warn("Chart.js not loaded"); return; }
  destroyCharts();

  const areaEl = document.getElementById("area-chart");
  if (areaEl) {
    window._areaChart = new window.Chart(areaEl, {
      type: "line",
      data: {
        labels: ["Apr 1","Apr 15","May 1","May 15","Jun 1","Jun 15"],
        datasets: [
          { label:"Completion %", data:[52,58,62,67,65,68.4], borderColor:"#6366F1", backgroundColor:"rgba(99,102,241,0.08)", borderWidth:2.5, tension:0.4, pointRadius:3, pointBackgroundColor:"#6366F1", pointHoverRadius:5, fill:false },
          { label:"At Risk %",    data:[18,20,22,20,22,21.7], borderColor:"#F59E0B", backgroundColor:"rgba(245,158,11,0.06)",  borderWidth:2.5, tension:0.4, pointRadius:3, pointBackgroundColor:"#F59E0B", pointHoverRadius:5, fill:false },
          { label:"Escalation %", data:[8, 7, 6, 5, 5, 5.3],  borderColor:"#EF4444", backgroundColor:"rgba(239,68,68,0.06)",   borderWidth:2.5, tension:0.4, pointRadius:3, pointBackgroundColor:"#EF4444", pointHoverRadius:5, fill:false }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:"index", intersect:false },
        plugins:{
          legend:{ display:false },
          tooltip:{ backgroundColor:"#1C2333", titleFont:{family:"Inter",size:12,weight:"800"}, bodyFont:{family:"Inter",size:11,weight:"600"}, padding:12, cornerRadius:10,
            callbacks:{ label:(ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
          }
        },
        scales:{
          x:{ grid:{display:false}, border:{display:false}, ticks:{font:{family:"Inter",size:11,weight:"600"},color:"#9CA3AF"} },
          y:{ min:0, max:100, grid:{color:"#F1F5F9"}, border:{display:false}, ticks:{font:{family:"Inter",size:11,weight:"600"},color:"#9CA3AF",callback:v=>`${v}%`} }
        }
      }
    });
  }

  const donutEl = document.getElementById("donut-chart");
  if (donutEl) {
    window._donutChart = new window.Chart(donutEl, {
      type:"doughnut",
      data:{
        labels:["Sales","Engineering","Operations","Marketing","HR"],
        datasets:[{ data:[367,276,184,78,60], backgroundColor:["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444"], borderWidth:0, hoverOffset:6 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:"68%",
        plugins:{ legend:{display:false}, tooltip:{ backgroundColor:"#1C2333", titleFont:{family:"Inter",size:12,weight:"800"}, bodyFont:{family:"Inter",size:11,weight:"600"}, padding:12, cornerRadius:10 } }
      }
    });
  }
};

// ── GLOBAL SEARCH ─────────────────────────────────────────────────
window.handleSearch = (val) => {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;
  if (!val || val.length < 2) { resultsEl.style.display = "none"; return; }
  const { goalSheets, employees, auditLogs } = getState();
  const q = val.toLowerCase();
  const results = [];
  employees.forEach(e => {
    if (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      results.push({ type:"Employee", label:e.name, sub:`${e.role} - ${e.dept}`, action:`window.navigate('org')` });
  });
  goalSheets.forEach(sheet => {
    const emp = employees.find(e => e.id === sheet.employeeId);
    (sheet.goals||[]).forEach(g => {
      if (g.title.toLowerCase().includes(q) || (g.area||"").toLowerCase().includes(q))
        results.push({ type:"Goal", label:g.title, sub:`${emp ? emp.name : sheet.employeeId} - ${g.area}`, action:`window.navigate('goals')` });
    });
  });
  (auditLogs||[]).slice(0,50).forEach(log => {
    if ((log.action||"").toLowerCase().includes(q) || (log.user||"").toLowerCase().includes(q))
      results.push({ type:"Audit", label:log.action, sub:`${log.user} - ${new Date(log.timestamp).toLocaleDateString()}`, action:`window.navigate('audit')` });
  });

  if (results.length === 0) {
    resultsEl.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px;">No results for "${val}"</div>`;
  } else {
    resultsEl.innerHTML = results.slice(0,8).map(r => `
      <div onclick="${r.action};document.getElementById('search-results').style.display='none';document.getElementById('global-search').value='';"
           style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid var(--border);"
           onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background=''">
        <span class="badge badge-${r.type==="Goal"?"primary":r.type==="Employee"?"success":"neutral"}" style="font-size:9px;flex-shrink:0;">${r.type}</span>
        <div><div style="font-weight:700;font-size:13px;">${r.label}</div><div style="font-size:11px;color:var(--muted);">${r.sub}</div></div>
      </div>`).join("");
  }
  resultsEl.style.display = "block";
};

document.addEventListener("click", (e) => {
  const sr = document.getElementById("search-results");
  const gs = document.getElementById("global-search");
  if (sr && gs && !gs.contains(e.target) && !sr.contains(e.target)) sr.style.display = "none";
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────
window.showNotifications = () => {
  const { goalSheets } = getState();
  const submitted = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length;
  const msgs = [];
  if (submitted > 0) msgs.push(`${submitted} goal sheet(s) pending your review`);
  if (msgs.length === 0) msgs.push("No pending notifications");
  alert(msgs.join("\n"));
};

window.showHelp = () => {
  alert("Ascendra Help\n\nSwitch roles using the sidebar Workspace Scope dropdown to demo all 3 user journeys.\nGoal Setting phase: Employees create goals, Manager approves.\nQuarterly phases (Q1-Q4): Employees update achievements, Manager checks in.\nAdmin can unlock sheets, push shared KPIs, and manage cycles.");
};

// ── WORKSPACE SELECTOR TOGGLE ─────────────────────────────────────
window.toggleScopeDropdown = (e) => {
  e.stopPropagation();
  const dd = document.getElementById("sb-scope-dropdown");
  if (dd) {
    dd.style.display = dd.style.display === "none" ? "block" : "none";
  }
};

document.addEventListener("click", () => {
  const dd = document.getElementById("sb-scope-dropdown");
  if (dd) dd.style.display = "none";
});

// ── NAVIGATION ────────────────────────────────────────────────────
function navigate(pageId, extraArg) {
  const { currentUser } = getState();
  const navItem = ALL_NAV.find(n => n.id === pageId);
  if (navItem && !navItem.roles.includes(currentUser.role)) pageId = "admin";

  document.querySelectorAll(".sb-link").forEach(el =>
    el.classList.toggle("active", el.dataset.page === pageId));

  const area = document.getElementById("main-content");
  if (!area) return;
  destroyCharts();

  const state = getState();
  switch (pageId) {
    case "admin":                 area.innerHTML = renderAdminDashboard(); break;
    case "health-inspector":      area.innerHTML = renderHealthInspector(); break;
    case "tracing":               area.innerHTML = renderTracing(); break;
    case "smart-queue":           area.innerHTML = renderSmartQueue(); break;
    case "manager-effectiveness": area.innerHTML = renderManagerEffectiveness(); break;
    case "goals":                 area.innerHTML = renderGoalManagement(); break;
    case "checkins":              area.innerHTML = renderQuarterlyReview(); break;
    case "team":                  area.innerHTML = renderManagerReview(extraArg); break;
    case "completion":            area.innerHTML = renderCompletionDashboard(); break;
    case "org":                   area.innerHTML = renderOrgTree(); break;
    case "audit":
    case "audit-logs":            area.innerHTML = renderReports(); break;
    case "analytics":             area.innerHTML = renderAnalytics(); break;
    case "settings":              area.innerHTML = renderAdminSettings(); break;
    default:
      area.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚧</div><div class="empty-state-title">Coming Soon</div><div class="empty-state-sub">This module is under construction.</div><button class="btn btn-primary mt-20" onclick="window.navigate('admin')">Back to Dashboard</button></div>`;
  }

  if (pageId === "admin") requestAnimationFrame(() => window.initDashboardCharts());
  if (pageId === "analytics") requestAnimationFrame(() => window.initAnalyticsCharts && window.initAnalyticsCharts());

  const badge = document.getElementById("notif-badge");
  if (badge) {
    const { goalSheets } = getState();
    const pending = goalSheets.filter(s => s.status === SUBMISSION_STATUS.SUBMITTED).length;
    badge.style.display = pending > 0 ? "flex" : "none";
    badge.textContent = pending > 0 ? String(pending) : "";
  }
}

window.navigate = navigate;
window.reviewSheet = function(empId) { navigate('team', empId); };

window.setSystemCycle = (cycle) => {
  const { system, currentUser } = getState();
  setState({ system: { ...system, currentCycle: cycle } });
  navigate(currentUser.role === "ADMIN" ? "settings" : "goals");
};

// ── SIDEBAR COLLAPSE (desktop) ────────────────────────────────────
window.collapseSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const main    = document.getElementById("layout-main");
  const icon    = document.getElementById("collapse-icon");
  const label   = document.querySelector(".sb-collapse-label");
  if (!sidebar) return;

  const isCollapsed = sidebar.classList.toggle("sidebar-collapsed");
  if (main) main.classList.toggle("main-expanded", isCollapsed);

  // Flip the arrow direction
  if (icon) {
    icon.innerHTML = isCollapsed
      ? `<polyline points="9 18 15 12 9 6"/>`
      : `<polyline points="15 18 9 12 15 6"/>`;
  }
  if (label) label.style.display = isCollapsed ? "none" : "inline";
};

// ── SIDEBAR TOGGLE (mobile) ───────────────────────────────────────
window.toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("sidebar-open");
};

window.switchRole = (userId) => {
  const { employees } = getState();
  const user = employees.find(e => e.id === userId);
  if (!user) return;
  setState({ currentUser: user });
  const shell = document.getElementById("app-shell");
  shell.innerHTML = buildShell(user);
  document.querySelectorAll(".sb-link").forEach(el =>
    el.addEventListener("click", () => navigate(el.dataset.page)));
  navigate("admin");
};

function initApp() {
  const loading = document.getElementById("loading-screen");
  const shell   = document.getElementById("app-shell");
  const state   = getState();

  const { goalSheets } = state;
  if (!goalSheets.find(s => s.employeeId === "EMP-002")) {
    setState({ goalSheets: [...goalSheets, { employeeId:"EMP-002", status:SUBMISSION_STATUS.DRAFT, goals:[], history:[], managerComment:"" }] });
  }

  setTimeout(() => {
    loading.style.opacity = "0";
    setTimeout(() => {
      loading.style.display = "none";
      shell.style.display = "flex";
      shell.innerHTML = buildShell(state.currentUser);
      document.querySelectorAll(".sb-link").forEach(el =>
        el.addEventListener("click", () => navigate(el.dataset.page)));
      navigate("admin");
    }, 400);
  }, 1000);
}

window.addEventListener("DOMContentLoaded", initApp);
