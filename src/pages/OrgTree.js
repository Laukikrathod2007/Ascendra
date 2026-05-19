import { getState } from '../store/state.js';
import { calculateProgressScore } from '../utils/engine.js';
import { SUBMISSION_STATUS } from '../utils/constants.js';

const ORG_STYLE = `
<style>
  .org-tree-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 20px;
    padding: 20px;
    overflow-x: auto;
  }
  
  /* Hierarchy Connector Lines */
  .org-node-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  
  .org-node {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 16px;
    padding: 16px 20px;
    width: 260px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s, box-shadow 0.2s;
    position: relative;
    z-index: 10;
  }
  .org-node:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(99, 102, 241, 0.3) !important;
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
  }
  
  .org-children {
    display: flex;
    gap: 24px;
    margin-top: 32px;
    position: relative;
    padding-top: 16px;
  }
  
  /* Connectors using CSS pseudo-elements */
  .org-children::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 16px;
    background: rgba(99, 102, 241, 0.15);
  }
  
  .org-node-wrap:not(:only-child) > .org-children::after {
    content: '';
    position: absolute;
    top: 0;
    left: 130px;
    right: 130px;
    height: 2px;
    background: rgba(99, 102, 241, 0.15);
  }
  
  /* Dynamic badge tags */
  .node-role-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  
  /* Employee Info Modal/Drawer */
  .emp-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 24, 32, 0.2);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: flex-end; /* Modern side drawer layout */
    transition: opacity 0.3s ease;
  }
  
  .emp-modal-drawer {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    width: 480px;
    height: 100%;
    padding: 32px;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 40px rgba(0,0,0,0.05);
    overflow-y: auto;
    animation: drawerSlide 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes drawerSlide {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  .org-tree-scroller {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-width: max-content;
    padding-bottom: 40px;
  }
</style>
`;

export const renderOrgTree = () => {
  const { employees, goalSheets, system } = getState();

  const buildTree = (managerId = null) => {
    return employees
      .filter(e => e.managerId === managerId)
      .map(e => ({ ...e, children: buildTree(e.id) }));
  };

  const tree = buildTree(null);

  const renderNode = (node) => {
    const sheet = goalSheets.find(s => s.employeeId === node.id);
    const status = sheet ? sheet.status : 'NOT STARTED';
    const statusCls = status === SUBMISSION_STATUS.APPROVED ? 'success'
      : status === SUBMISSION_STATUS.SUBMITTED ? 'warning'
      : status === SUBMISSION_STATUS.RETURNED ? 'danger' : 'neutral';

    let progress = 0;
    if (sheet && sheet.goals.length > 0) {
      sheet.goals.forEach(g => { progress += calculateProgressScore(g) * (g.weight / 100); });
    }

    const roleColor = node.role === 'ADMIN' ? '#EF4444' : node.role === 'MANAGER' ? '#F59E0B' : '#6366F1';
    const roleLabel = node.role === 'ADMIN' ? 'Admin' : node.role === 'MANAGER' ? 'Manager' : 'Employee';

    return `
      <div class="org-node-wrap">
        <div class="org-node" onclick="window.showEmpDetail('${node.id}')">
          <div class="flex items-center gap-12">
            <div style="position:relative;flex-shrink:0;">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(node.name)}&background=4F46E5&color=fff&size=48" 
                   style="width:40px;height:40px;border-radius:10px;object-fit:cover;" alt="${node.name}" />
              <span class="node-role-indicator" style="background:${roleColor};"></span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:800;font-size:13.5px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${node.name}</div>
              <div style="font-size:10.5px;color:${roleColor};font-weight:700;">${roleLabel}</div>
            </div>
          </div>
          
          <div class="mt-8 flex gap-6" style="flex-wrap:wrap;">
            <span class="badge badge-neutral" style="font-size:9px;padding:2px 6px;">${node.dept}</span>
            <span class="badge badge-primary" style="font-size:9px;padding:2px 6px;">${node.team}</span>
          </div>
          
          ${sheet ? `
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,0.03);">
              <div class="flex items-center justify-between mb-6">
                <span class="badge badge-${statusCls}" style="font-size:9px;padding:2px 6px;">${status}</span>
                <span style="font-size:10.5px;font-weight:700;color:var(--muted);">${sheet.goals.length} goals</span>
              </div>
              ${sheet.goals.length > 0 ? `
                <div class="progress-bar-wrap" style="height:5px;background:rgba(0,0,0,0.04);">
                  <div class="progress-bar-fill" style="width:${Math.min(progress,100)}%;background:${progress>=80?'var(--success)':progress>=50?'var(--warning)':'var(--danger)'};"></div>
                </div>
                <div style="font-size:10px;font-weight:800;color:var(--muted);margin-top:4px;text-align:right;">${progress.toFixed(0)}% Complete</div>
              ` : ''}
            </div>` : `
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,0.03);">
              <span class="badge badge-neutral" style="font-size:9px;padding:2px 6px;">No goals drafted</span>
            </div>`}
        </div>
        ${node.children.length > 0 ? `
          <div class="org-children">
            ${node.children.map(child => renderNode(child)).join('')}
          </div>` : ''}
      </div>`;
  };

  return `
    ${ORG_STYLE}
    <div>
      <div class="page-header-row">
        <div>
          <div class="page-breadcrumb">Ascendra › <span>Organization Hierarchy</span></div>
          <div class="page-title">Enterprise Reporting Structure</div>
          <div class="page-sub">Dynamic organizational mapping integrated with live performance cycle telemetry.</div>
        </div>
        <div class="flex gap-12">
          <div class="flex items-center gap-8" style="padding:8px 14px;background:rgba(255,255,255,0.4);border:1px solid var(--border);border-radius:10px;backdrop-filter:blur(8px);">
            <span style="width:10px;height:10px;border-radius:50%;background:#EF4444;"></span><span class="text-xs font-bold">Admin</span>
            <span style="width:10px;height:10px;border-radius:50%;background:#F59E0B;margin-left:8px;"></span><span class="text-xs font-bold">Manager</span>
            <span style="width:10px;height:10px;border-radius:50%;background:#6366F1;margin-left:8px;"></span><span class="text-xs font-bold">Employee</span>
          </div>
        </div>
      </div>

      <div class="card card-p org-tree-container" style="background:rgba(255,255,255,0.2); border-color:rgba(255,255,255,0.3); overflow-x:auto;">
        <div class="org-tree-scroller">
          ${tree.map(root => renderNode(root)).join('')}
        </div>
      </div>

      <!-- Employee Detail Side-Drawer Modal -->
      <div id="emp-detail-modal" class="emp-modal-overlay" style="display:none;">
        <div id="emp-detail-content" class="emp-modal-drawer"></div>
      </div>
    </div>`;
};

window.showEmpDetail = (empId) => {
  const { employees, goalSheets, system } = getState();
  const emp = employees.find(e => e.id === empId);
  const sheet = goalSheets.find(s => s.employeeId === empId);
  if (!emp) return;

  const modal = document.getElementById('emp-detail-modal');
  const content = document.getElementById('emp-detail-content');
  if (!modal || !content) return;

  const status = sheet ? sheet.status : 'NOT STARTED';
  const statusCls = status === 'Approved' ? 'success' : status === 'Submitted' ? 'warning' : status === 'Returned' ? 'danger' : 'neutral';

  let totalWeightedProgress = 0;
  if (sheet && sheet.goals.length > 0) {
    sheet.goals.forEach(g => { totalWeightedProgress += (calculateProgressScore(g) * (g.weight / 100)); });
  }

  content.innerHTML = `
    <div class="flex items-center justify-between mb-24" style="border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:20px;">
      <div class="flex items-center gap-14">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4F46E5&color=fff&size=56" style="width:48px;height:48px;border-radius:12px;" />
        <div>
          <div style="font-size:16px;font-weight:900;color:var(--text);">${emp.name}</div>
          <div class="text-xs text-muted" style="margin-top:2px;">${emp.role} · ${emp.dept} department</div>
          <span class="badge badge-${statusCls} mt-6" style="padding:2px 8px; font-size:10px;">${status}</span>
        </div>
      </div>
      <button onclick="document.getElementById('emp-detail-modal').style.display='none';" 
              style="width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);background:var(--surface);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:background 0.2s;">✕</button>
    </div>
    
    <div style="flex:1; display:flex; flex-direction:column; gap:20px;">
      ${sheet && sheet.goals.length > 0 ? `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(99,102,241,0.04); padding:12px 16px; border-radius:12px; border:1px solid rgba(99,102,241,0.08);">
          <span style="font-size:12px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em;">Performance Index</span>
          <span style="font-size:18px; font-weight:900; color:var(--primary);">${totalWeightedProgress.toFixed(1)}%</span>
        </div>
        
        <div>
          <div class="section-label mb-12">Cycle Objectives (${sheet.goals.length})</div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${sheet.goals.map(g => {
              const score = calculateProgressScore(g);
              const bc = score >= 80 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--danger)';
              return `
                <div style="padding:14px;background:rgba(0,0,0,0.01);border:1px solid rgba(0,0,0,0.03);border-radius:12px;">
                  <div class="flex items-center justify-between mb-6">
                    <span style="font-weight:700;font-size:13px;color:var(--text);">${g.title}</span>
                    <span class="badge badge-neutral" style="font-size:9px;padding:2px 6px;">${g.weight}% Wt</span>
                  </div>
                  <div class="flex items-center gap-8 mb-8">
                    <span class="badge badge-primary" style="font-size:9px;padding:2px 6px;">${g.area}</span>
                    <span class="text-xs text-muted">${g.uom} · Target: <strong>${g.target}</strong></span>
                    <span class="text-xs text-muted">Actual: <strong>${g.achievement || 0}</strong></span>
                  </div>
                  <div class="flex items-center gap-8 mt-10">
                    <span style="font-weight:800;font-size:11px;color:${bc};width:34px;">${score.toFixed(0)}%</span>
                    <div class="progress-bar-wrap" style="flex:1;height:5px;background:rgba(0,0,0,0.04);">
                      <div class="progress-bar-fill" style="width:${Math.min(score,100)}%;background:${bc};"></div>
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      ` : `
        <div style="text-align:center;padding:40px 20px;color:var(--muted);">
          <div style="font-size:32px;margin-bottom:12px;">📋</div>
          <div style="font-weight:700;color:var(--text);">No Objectives Configured</div>
          <div style="font-size:12px;margin-top:4px;">This operator has not created or aligned goal sheets for this lifecycle.</div>
        </div>
      `}
      
      ${sheet?.checkinComment ? `
        <div style="margin-top:auto;padding:14px;background:rgba(99,102,241,0.04);border-radius:12px;border:1px dashed rgba(99,102,241,0.15);">
          <div class="section-label mb-6">Leadership Check-in SLA Note</div>
          <div style="font-size:12.5px;color:var(--text);font-style:italic;">"${sheet.checkinComment}"</div>
        </div>` : ''}
    </div>
  `;

  modal.style.display = 'flex';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
};
