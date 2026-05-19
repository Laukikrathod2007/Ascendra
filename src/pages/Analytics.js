import { getState } from "../store/state.js";
import { calculateProgressScore } from "../utils/engine.js";

// ── QUARTERS for QoQ simulation ──────────────────────────────────
const QUARTERS = ["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABELS = ["Goal Setting", "Q1", "Q2", "Q3", "Q4"];

// ── HELPERS ───────────────────────────────────────────────────────
function avgProgress(goals) {
  if (!goals || goals.length === 0) return 0;
  const total = goals.reduce((sum, g) => sum + calculateProgressScore(g) * (g.weight / 100), 0);
  return Math.round(total);
}

function getQoQData(goalSheets, employees) {
  // Simulate QoQ by using actual achievement data and distributing across quarters
  // In a real system each quarter would have its own snapshot; here we derive from current data
  const depts = [...new Set(employees.filter(e => e.role === "EMPLOYEE").map(e => e.dept))];
  const result = {};
  depts.forEach(dept => {
    const deptEmps = employees.filter(e => e.dept === dept && e.role === "EMPLOYEE").map(e => e.id);
    const deptSheets = goalSheets.filter(s => deptEmps.includes(s.employeeId));
    const baseProgress = deptSheets.length
      ? Math.round(deptSheets.reduce((sum, s) => sum + avgProgress(s.goals), 0) / deptSheets.length)
      : 0;
    // Simulate Q1-Q4 progression (ramp up from 20% to current)
    result[dept] = QUARTERS.map((q, i) => {
      if (q === "GOAL_SETTING") return 0;
      const factor = [0.2, 0.45, 0.65, 0.85, 1.0][i];
      return Math.round(baseProgress * factor);
    });
  });
  return result;
}

export const renderAnalytics = () => {
  const { goalSheets, employees, system } = getState();

  const allGoals = goalSheets.reduce((acc, s) => acc.concat((s.goals || []).map(g => ({ ...g, empId: s.employeeId, sheetStatus: s.status }))), []);
  const managers = employees.filter(e => e.role === "MANAGER");
  const depts = [...new Set(employees.filter(e => e.role === "EMPLOYEE").map(e => e.dept))];
  const qoqData = getQoQData(goalSheets, employees);

  // ── Goal Distribution ──────────────────────────────────────────
  const byArea = {};
  const byUom = {};
  const byStatus = { "Not Started": 0, "On Track": 0, "Completed": 0 };
  allGoals.forEach(g => {
    byArea[g.area || "General"] = (byArea[g.area || "General"] || 0) + 1;
    byUom[g.uom || "Numeric"] = (byUom[g.uom || "Numeric"] || 0) + 1;
    const s = g.goalStatus || "Not Started";
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  // ── Manager Effectiveness ──────────────────────────────────────
  const mgrData = managers.map(m => {
    const team = employees.filter(e => e.managerId === m.id).map(e => e.id);
    const teamSheets = goalSheets.filter(s => team.includes(s.employeeId));
    const approved = teamSheets.filter(s => s.status === "Approved").length;
    const checkinDone = teamSheets.filter(s => s[`${system.currentCycle}_checkinComment`] || s.checkinComment).length;
    const checkinRate = teamSheets.length ? Math.round((checkinDone / teamSheets.length) * 100) : 0;
    const approvalRate = teamSheets.length ? Math.round((approved / teamSheets.length) * 100) : 0;
    const avgProg = teamSheets.length
      ? Math.round(teamSheets.reduce((sum, s) => sum + avgProgress(s.goals), 0) / teamSheets.length)
      : 0;
    return { name: m.name, dept: m.dept, teamSize: team.length, checkinRate, approvalRate, avgProg };
  });

  // ── Org Heatmap data ───────────────────────────────────────────
  const heatmapData = depts.map(dept => {
    const deptEmps = employees.filter(e => e.dept === dept && e.role === "EMPLOYEE");
    return deptEmps.map(emp => {
      const sheet = goalSheets.find(s => s.employeeId === emp.id);
      const prog = sheet ? avgProgress(sheet.goals) : 0;
      return { name: emp.name.split(" ")[0], dept, prog };
    });
  });

  const CHART_COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#14B8A6","#F472B6","#FB923C"];

  return `<div class="analytics-root">

    <!-- HEADER -->
    <div class="dash-header mb-24">
      <div>
        <div class="page-breadcrumb">Ascendra › <span>Analytics</span></div>
        <div class="page-title">Analytics Module</div>
        <div class="page-sub">Quarter-on-Quarter trends, completion heatmaps, goal distribution, and manager effectiveness.</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="window.exportAchievementCSV()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export Data
      </button>
    </div>

    <!-- SECTION 1: QoQ Trends -->
    <div class="card mb-24">
      <div class="dash-card-header">
        <div class="dash-card-title">Quarter-on-Quarter Achievement Trends</div>
        <span class="badge badge-neutral" style="font-size:11px;">By Department</span>
      </div>
      <div class="dash-chart-legend" style="padding:8px 20px 0;">
        ${depts.map((d, i) => `<span class="dash-legend-item"><span class="dash-legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]};"></span>${d}</span>`).join("")}
      </div>
      <div style="padding:16px 20px 20px;height:280px;position:relative;">
        <canvas id="qoq-chart"></canvas>
      </div>
    </div>

    <!-- SECTION 2: Org Heatmap + Goal Distribution -->
    <div class="dash-charts-row mb-24">
      <!-- Org Completion Heatmap -->
      <div class="card">
        <div class="dash-card-header">
          <div class="dash-card-title">Org Completion Heatmap</div>
          <span class="text-xs text-muted">Progress % per employee</span>
        </div>
        <div style="padding:16px 20px 20px;">
          ${heatmapData.map((deptEmps, di) => {
            if (deptEmps.length === 0) return "";
            return `<div style="margin-bottom:16px;">
              <div style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">${deptEmps[0].dept}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${deptEmps.map(e => {
                  const color = e.prog >= 80 ? "#10B981" : e.prog >= 50 ? "#F59E0B" : e.prog > 0 ? "#EF4444" : "#E5E7EB";
                  const textColor = e.prog > 0 ? "#fff" : "#9CA3AF";
                  return `<div title="${e.name}: ${e.prog}%" style="width:52px;height:52px;border-radius:10px;background:${color};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:default;transition:transform .15s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    <span style="font-size:9px;font-weight:700;color:${textColor};text-align:center;line-height:1.2;">${e.name}</span>
                    <span style="font-size:11px;font-weight:900;color:${textColor};">${e.prog}%</span>
                  </div>`;
                }).join("")}
              </div>
            </div>`;
          }).join("")}
          <div style="display:flex;align-items:center;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
            <span style="font-size:11px;font-weight:700;color:var(--muted);">Legend:</span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;"><span style="width:12px;height:12px;border-radius:3px;background:#10B981;display:inline-block;"></span>≥80%</span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;"><span style="width:12px;height:12px;border-radius:3px;background:#F59E0B;display:inline-block;"></span>50-79%</span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;"><span style="width:12px;height:12px;border-radius:3px;background:#EF4444;display:inline-block;"></span>&lt;50%</span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;"><span style="width:12px;height:12px;border-radius:3px;background:#E5E7EB;display:inline-block;"></span>No data</span>
          </div>
        </div>
      </div>

      <!-- Goal Distribution -->
      <div class="card">
        <div class="dash-card-header">
          <div class="dash-card-title">Goal Distribution</div>
          <span class="text-xs text-muted">${allGoals.length} total goals</span>
        </div>
        <div style="padding:16px 20px 20px;">
          <!-- By Status -->
          <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">By Status</div>
            ${Object.entries(byStatus).map(([status, count]) => {
              const total = allGoals.length || 1;
              const pct = Math.round((count / total) * 100);
              const color = status === "Completed" ? "#10B981" : status === "On Track" ? "#6366F1" : "#9CA3AF";
              return `<div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:12px;font-weight:700;">${status}</span>
                  <span style="font-size:12px;font-weight:800;color:${color};">${count} (${pct}%)</span>
                </div>
                <div class="progress-bar-wrap" style="height:7px;">
                  <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
                </div>
              </div>`;
            }).join("")}
          </div>
          <!-- By UoM -->
          <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">By Unit of Measure</div>
            ${Object.entries(byUom).map(([uom, count], i) => {
              const pct = Math.round((count / (allGoals.length || 1)) * 100);
              return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="width:10px;height:10px;border-radius:50%;background:${CHART_COLORS[i % CHART_COLORS.length]};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:600;flex:1;">${uom}</span>
                <span style="font-size:12px;font-weight:800;">${count}</span>
                <span style="font-size:11px;color:var(--muted);">${pct}%</span>
              </div>`;
            }).join("")}
          </div>
          <!-- By Thrust Area (top 5) -->
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">By Thrust Area (Top 5)</div>
            ${Object.entries(byArea).sort((a,b) => b[1]-a[1]).slice(0,5).map(([area, count], i) => {
              const pct = Math.round((count / (allGoals.length || 1)) * 100);
              const color = CHART_COLORS[i % CHART_COLORS.length];
              return `<div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:12px;font-weight:700;">${area}</span>
                  <span style="font-size:12px;font-weight:800;color:${color};">${count}</span>
                </div>
                <div class="progress-bar-wrap" style="height:6px;">
                  <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
                </div>
              </div>`;
            }).join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: Manager Effectiveness -->
    <div class="card mb-24">
      <div class="dash-card-header">
        <div class="dash-card-title">Manager Effectiveness — L1 Comparison</div>
        <span class="text-xs text-muted">Check-in rate, approval rate, avg team progress</span>
      </div>
      <div style="padding:0 20px 20px;">
        <div style="height:240px;position:relative;margin-bottom:20px;">
          <canvas id="mgr-chart"></canvas>
        </div>
        <table class="tbl">
          <thead>
            <tr>
              <th>Manager</th>
              <th>Dept</th>
              <th>Team Size</th>
              <th>Check-in Rate</th>
              <th>Approval Rate</th>
              <th>Avg Progress</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            ${mgrData.map(m => {
              const risk = m.checkinRate < 50 || m.approvalRate < 50 ? "High" : m.checkinRate < 75 ? "Medium" : "Low";
              const riskColor = risk === "High" ? "#EF4444" : risk === "Medium" ? "#F59E0B" : "#10B981";
              return `<tr>
                <td style="font-weight:700;">${m.name}</td>
                <td style="color:var(--muted);font-size:12px;">${m.dept}</td>
                <td style="font-weight:700;">${m.teamSize}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="progress-bar-wrap" style="width:80px;height:6px;">
                      <div class="progress-bar-fill" style="width:${m.checkinRate}%;background:#6366F1;"></div>
                    </div>
                    <span style="font-weight:800;font-size:12px;">${m.checkinRate}%</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="progress-bar-wrap" style="width:80px;height:6px;">
                      <div class="progress-bar-fill" style="width:${m.approvalRate}%;background:#10B981;"></div>
                    </div>
                    <span style="font-weight:800;font-size:12px;">${m.approvalRate}%</span>
                  </div>
                </td>
                <td style="font-weight:800;color:var(--primary);">${m.avgProg}%</td>
                <td><span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;background:${riskColor}18;color:${riskColor};">${risk}</span></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECTION 4: Individual QoQ (top performers) -->
    <div class="card">
      <div class="dash-card-header">
        <div class="dash-card-title">Individual Achievement Snapshot</div>
        <span class="text-xs text-muted">Current quarter progress per employee</span>
      </div>
      <div style="padding:16px 20px 20px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
          ${goalSheets.filter(s => s.goals.length > 0).slice(0, 12).map(sheet => {
            const emp = employees.find(e => e.id === sheet.employeeId);
            if (!emp) return "";
            const prog = avgProgress(sheet.goals);
            const color = prog >= 80 ? "#10B981" : prog >= 50 ? "#6366F1" : prog > 0 ? "#F59E0B" : "#9CA3AF";
            const initials = emp.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
            return `<div style="padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:36px;height:36px;border-radius:10px;background:${color}22;border:2px solid ${color}44;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:${color};flex-shrink:0;">${initials}</div>
                <div>
                  <div style="font-size:12px;font-weight:700;">${emp.name}</div>
                  <div style="font-size:10px;color:var(--muted);">${emp.dept}</div>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:11px;color:var(--muted);">${sheet.goals.length} goals</span>
                <span style="font-size:16px;font-weight:900;color:${color};">${prog}%</span>
              </div>
              <div class="progress-bar-wrap" style="height:6px;">
                <div class="progress-bar-fill" style="width:${Math.min(prog,100)}%;background:${color};"></div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>

  </div>`;
};

// ── CHART INIT ────────────────────────────────────────────────────
window.initAnalyticsCharts = function() {
  if (!window.Chart) return;

  const { goalSheets, employees, system } = getState();
  const depts = [...new Set(employees.filter(e => e.role === "EMPLOYEE").map(e => e.dept))];
  const CHART_COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#14B8A6"];
  const QUARTER_LABELS = ["Goal Setting","Q1","Q2","Q3","Q4"];

  // Destroy existing
  if (window._qoqChart)  { try { window._qoqChart.destroy(); } catch(e) {} window._qoqChart = null; }
  if (window._mgrChart)  { try { window._mgrChart.destroy(); } catch(e) {} window._mgrChart = null; }

  // QoQ Line Chart
  const qoqEl = document.getElementById("qoq-chart");
  if (qoqEl) {
    const datasets = depts.map((dept, i) => {
      const deptEmps = employees.filter(e => e.dept === dept && e.role === "EMPLOYEE").map(e => e.id);
      const deptSheets = goalSheets.filter(s => deptEmps.includes(s.employeeId));
      const baseProgress = deptSheets.length
        ? Math.round(deptSheets.reduce((sum, s) => {
            const prog = s.goals.reduce((a, g) => a + (g.achievement && g.target ? Math.min((Number(g.achievement)/Number(g.target))*100, 100) * (g.weight/100) : 0), 0);
            return sum + prog;
          }, 0) / deptSheets.length)
        : 0;
      const data = [0, 0.2, 0.45, 0.65, 0.85].map(f => Math.round(baseProgress * f));
      data[4] = baseProgress; // current = actual
      return {
        label: dept,
        data,
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + "15",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS[i % CHART_COLORS.length],
        fill: false
      };
    });

    window._qoqChart = new window.Chart(qoqEl, {
      type: "line",
      data: { labels: QUARTER_LABELS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#1C2333", titleFont: { family: "Inter", size: 12, weight: "800" }, bodyFont: { family: "Inter", size: 11, weight: "600" }, padding: 12, cornerRadius: 10, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "Inter", size: 11, weight: "600" }, color: "#9CA3AF" } },
          y: { min: 0, max: 100, grid: { color: "#F1F5F9" }, border: { display: false }, ticks: { font: { family: "Inter", size: 11, weight: "600" }, color: "#9CA3AF", callback: v => `${v}%` } }
        }
      }
    });
  }

  // Manager Effectiveness Bar Chart
  const mgrEl = document.getElementById("mgr-chart");
  if (mgrEl) {
    const managers = employees.filter(e => e.role === "MANAGER");
    const mgrLabels = managers.map(m => m.name.split(" ")[0]);
    const checkinRates = managers.map(m => {
      const team = employees.filter(e => e.managerId === m.id).map(e => e.id);
      const teamSheets = goalSheets.filter(s => team.includes(s.employeeId));
      const done = teamSheets.filter(s => s[`${system.currentCycle}_checkinComment`] || s.checkinComment).length;
      return teamSheets.length ? Math.round((done / teamSheets.length) * 100) : 0;
    });
    const approvalRates = managers.map(m => {
      const team = employees.filter(e => e.managerId === m.id).map(e => e.id);
      const teamSheets = goalSheets.filter(s => team.includes(s.employeeId));
      const approved = teamSheets.filter(s => s.status === "Approved").length;
      return teamSheets.length ? Math.round((approved / teamSheets.length) * 100) : 0;
    });

    window._mgrChart = new window.Chart(mgrEl, {
      type: "bar",
      data: {
        labels: mgrLabels,
        datasets: [
          { label: "Check-in Rate %", data: checkinRates, backgroundColor: "#6366F1", borderRadius: 6, barPercentage: 0.4 },
          { label: "Approval Rate %", data: approvalRates, backgroundColor: "#10B981", borderRadius: 6, barPercentage: 0.4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", font: { family: "Inter", size: 11, weight: "700" }, color: "#6B7280", padding: 16 } },
          tooltip: { backgroundColor: "#1C2333", titleFont: { family: "Inter", size: 12, weight: "800" }, bodyFont: { family: "Inter", size: 11, weight: "600" }, padding: 12, cornerRadius: 10, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "Inter", size: 11, weight: "700" }, color: "#374151" } },
          y: { min: 0, max: 100, grid: { color: "#F1F5F9" }, border: { display: false }, ticks: { font: { family: "Inter", size: 11, weight: "600" }, color: "#9CA3AF", callback: v => `${v}%` } }
        }
      }
    });
  }
};
