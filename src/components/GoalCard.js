import { getState } from '../store/state.js';
import { goalHealthScore } from '../utils/engine.js';

export const renderGoalCard = (goal, idx) => {
  const pct = goal.target ? Math.min((Number(goal.achievement || 0) / Number(goal.target)) * 100, 100) : 0;
  const statusColor = { 'Completed': 'var(--success)', 'On Track': 'var(--warning)', 'Draft': 'var(--muted)', 'At Risk': 'var(--danger)' };
  const color = statusColor[goal.status] || 'var(--muted)';
  const { goalSheets } = getState();
  const owningSheet = goalSheets.find(s => Array.isArray(s.goals) && s.goals.some(g => g.id === goal.id));
  const health = goalHealthScore(goal, owningSheet || {});
  const healthBadge = health === 'Healthy' ? `<span class="badge badge-success" style="font-size:10px;margin-left:6px;">🟢 ${health}</span>` : health === 'Critical' ? `<span class="badge badge-danger" style="font-size:10px;margin-left:6px;">🔴 ${health}</span>` : `<span class="badge badge-warning" style="font-size:10px;margin-left:6px;">🟡 ${health}</span>`;

  return `
    <tr>
      <td><span class="badge badge-primary" style="font-size:9px;">${goal.area || 'General'}</span></td>
      <td>
        <div style="font-size:13px;font-weight:700;margin-bottom:2px;">${goal.title}${healthBadge}</div>
        ${goal.rationale ? `<div class="text-xs text-muted">${goal.rationale.slice(0,60)}...</div>` : ''}
      </td>
      <td style="font-weight:800;">${goal.target} <span class="text-muted text-xs">${goal.uom || '%'}</span></td>
      <td><span class="badge badge-neutral">${goal.weight}%</span></td>
      <td>
        <div class="text-xs font-bold mb-4" style="color:${color};">${pct.toFixed(0)}%</div>
        <div class="progress-bar-wrap" style="width:80px;">
          <div class="progress-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>
      </td>
      <td><span class="badge" style="background:${color}20;color:${color};">${goal.status || 'Draft'}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="window.removeGoal(${idx})" style="padding:4px 10px;">✕</button>
      </td>
    </tr>`;
};
