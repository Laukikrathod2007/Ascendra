export const pageHeader = ({ breadcrumb = '', title = '', sub = '', actions = '' } = {}) => {
  return `
    <div class="page-header-row">
      <div>
        <div class="page-breadcrumb">${breadcrumb}</div>
        <div class="page-title">${title}</div>
        <div class="page-sub">${sub}</div>
      </div>
      <div class="flex gap-12">
        ${actions}
      </div>
    </div>`;
};

export const statCardSmall = (label, val, hint='') => `
  <div class="stat-card stat-card-blue">
    <div class="stat-label">${label}</div>
    <div class="stat-val">${val}</div>
    <div class="stat-date">${hint}</div>
  </div>`;

export default { pageHeader, statCardSmall };
