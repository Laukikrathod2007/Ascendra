import { UOM_TYPES, APP_CONFIG, CYCLES, SUBMISSION_STATUS } from './constants.js';
import { getState, setState } from '../store/state.js';

/**
 * GOVERNANCE: AUDIT LOGGING
 */
export const logAudit = (action, field, before, after, reason = 'Regular update') => {
  const { auditLogs, currentUser } = getState();
  const newLog = {
    id: Date.now(),
    user: currentUser.name,
    role: currentUser.role,
    action,
    field,
    before: String(before),
    after: String(after),
    reason,
    timestamp: new Date().toISOString()
  };
  setState({ auditLogs: [newLog, ...auditLogs] });
};

/**
 * GOVERNANCE: CYCLE ENFORCEMENT
 */
export const isActionAllowed = (actionType) => {
  const { system } = getState();
  const cycleConfig = CYCLES[system.currentCycle];

  if (system.cycleLocked) return false;

  switch (actionType) {
    case 'EDIT_GOALS':
      return cycleConfig.canEditGoals;
    case 'UPDATE_ACHIEVEMENT':
      return cycleConfig.canUpdateAchievement;
    default:
      return false;
  }
};

/**
 * PROGRESS ENGINE (Enhanced for BRD logic)
 */
export const computeProgress = (goal) => {
  const { uom, target, achievement } = goal;
  const t = Number(target);
  const a = Number(achievement);

  if (isNaN(t) || isNaN(a)) return 0;

  switch (uom) {
    case UOM_TYPES.NUMERIC:
    case UOM_TYPES.PERCENTAGE:
      // BRD: Achievement ÷ Target
      return t > 0 ? Math.min((a / t) * 100, 150) : 0; // Cap at 150% for display
      
    case UOM_TYPES.TIMELINE:
      // Completion date vs Deadline (Simulated as timestamp comparison)
      return a <= t ? 100 : 0;

    case UOM_TYPES.ZERO_BASED:
      // If 0 -> 100%, Else -> 0%
      return a === 0 ? 100 : 0;

    default:
      return 0;
  }
};

/**
 * SHARED GOAL ENGINE
 */
export const syncSharedGoalAchievement = (sharedId, newAchievement) => {
  const { goalSheets, sharedGoalsRegistry } = getState();
  
  // 1. Update Registry
  const updatedRegistry = { ...sharedGoalsRegistry };
  if (updatedRegistry[sharedId]) {
    updatedRegistry[sharedId].achievement = newAchievement;
  }

  // 2. Propagate to all goal sheets
  const updatedSheets = goalSheets.map(sheet => ({
    ...sheet,
    goals: sheet.goals.map(g => g.sharedId === sharedId ? { ...g, achievement: newAchievement } : g)
  }));

  setState({ goalSheets: updatedSheets, sharedGoalsRegistry: updatedRegistry });
  logAudit('Shared Sync', 'Achievement', 'Multiple', newAchievement, `Shared KPI update: ${sharedId}`);
};

/**
 * HARD VALIDATION ENGINE
 */
export const validateGoalSheet = (goals) => {
  const errors = [];
  
  if (goals.length === 0) errors.push('At least one goal is required.');
  if (goals.length > APP_CONFIG.MAX_GOALS) errors.push(`Max ${APP_CONFIG.MAX_GOALS} goals allowed.`);

  const totalWeightage = goals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);
  if (totalWeightage !== APP_CONFIG.TOTAL_WEIGHTAGE) {
    errors.push(`Total weightage must be exactly ${APP_CONFIG.TOTAL_WEIGHTAGE}%. (Current: ${totalWeightage}%)`);
  }

  goals.forEach((goal, i) => {
    if ((Number(goal.weightage) || 0) < APP_CONFIG.MIN_WEIGHTAGE) {
      errors.push(`Goal #${i + 1} weightage (${goal.weightage}%) is below minimum 10%.`);
    }
    if (!goal.title?.trim()) errors.push(`Goal #${i + 1} requires a title.`);
    if (goal.target === undefined || goal.target === null) errors.push(`Goal #${i + 1} requires a target.`);
  });

  return { isValid: errors.length === 0, errors };
};

/**
 * WORKFLOW ENGINE: SUBMIT GOAL SHEET
 */
export const submitGoalSheet = (employeeId) => {
  const { goalSheets } = getState();
  const updatedSheets = goalSheets.map(s => 
    s.employeeId === employeeId ? { ...s, status: SUBMISSION_STATUS.SUBMITTED, submittedAt: new Date().toISOString() } : s
  );
  setState({ goalSheets: updatedSheets });
  logAudit('Workflow', 'Status', SUBMISSION_STATUS.DRAFT, SUBMISSION_STATUS.SUBMITTED, `Submission by ${employeeId}`);
};

/**
 * WORKFLOW ENGINE: APPROVE GOAL SHEET
 */
export const approveGoalSheet = (employeeId, managerId) => {
  const { goalSheets } = getState();
  const sheet = goalSheets.find(s => s.employeeId === employeeId);
  const validation = validateGoalSheet(sheet.goals);
  
  if (!validation.isValid) throw new Error(validation.errors.join(', '));

  const updatedSheets = goalSheets.map(s => 
    s.employeeId === employeeId ? { 
      ...s, 
      status: SUBMISSION_STATUS.APPROVED, 
      approvedBy: managerId, 
      approvedAt: new Date().toISOString(),
      lockedAt: new Date().toISOString()
    } : s
  );
  setState({ goalSheets: updatedSheets });
  logAudit('Workflow', 'Status', SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.APPROVED, `Approval by ${managerId}`);
};

/**
 * PROGRESS ENGINE: FORMULA-BASED (Enhanced for BRD)
 */
export const calculateProgressScore = (goal) => {
  const { uom, target, achievement, direction = 'Higher' } = goal;
  const t = Number(target);
  const a = Number(achievement);

  if (isNaN(t) || isNaN(a)) return 0;

  // 1. Min (Higher is better)
  if (direction === 'Higher' && (uom === UOM_TYPES.NUMERIC || uom === UOM_TYPES.PERCENTAGE)) {
    return t > 0 ? Math.min((a / t) * 100, 150) : 0;
  }

  // 2. Max (Lower is better - e.g., TAT, Cost) — BRD formula: Target / Achievement * 100
  if (direction === 'Lower') {
    if (a === 0) return 100; // achieved zero = perfect
    return Math.min((t / a) * 100, 100);
  }

  // 3. Timeline (Completion vs Deadline)
  if (uom === UOM_TYPES.TIMELINE) {
    return a <= t ? 100 : 0;
  }

  // 4. Zero (Zero-based - e.g., Safety Incidents)
  if (uom === UOM_TYPES.ZERO_BASED) {
    return a === 0 ? 100 : 0;
  }

  return 0;
};

/**
 * ACHIEVEMENT ENGINE: QUARTERLY UPDATES
 */
export const updateQuarterlyAchievement = (employeeId, goalId, value, quarter) => {
  const { goalSheets } = getState();
  const updatedSheets = goalSheets.map(sheet => {
    if (sheet.employeeId === employeeId) {
      const updatedGoals = sheet.goals.map(g => 
        g.id === goalId ? { ...g, achievement: value, lastUpdatedQuarter: quarter, lastUpdatedAt: new Date().toISOString() } : g
      );
      return { ...sheet, goals: updatedGoals };
    }
    return sheet;
  });
  setState({ goalSheets: updatedSheets });
  logAudit('Quarterly Update', 'Achievement', 'Previous', value, `Q${quarter} Update`);
};

/**
 * Compute a health score for a goal.
 * Returns one of: 'Healthy', 'At Risk', 'Critical'
 */
export const goalHealthScore = (goal, sheet = null) => {
  const { auditLogs } = getState();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const now = Date.now();
  const lastUpdatedAt = goal.lastUpdatedAt || goal.lastUpdatedQuarter && new Date().toISOString() || goal.createdAt || null;
  const lastUpdatedTs = lastUpdatedAt ? new Date(lastUpdatedAt).getTime() : 0;
  const daysSinceUpdate = lastUpdatedTs ? Math.floor((now - lastUpdatedTs) / MS_PER_DAY) : 9999;

  const progress = typeof calculateProgressScore === 'function' ? calculateProgressScore(goal) : 0;

  const managerCommentPresent = !!(sheet && (sheet.managerComment || sheet.approvalComment));

  const escalated = auditLogs.some(l => l.action && /escalation/i.test(l.action) && l.field && (sheet ? String(l.field).includes(sheet.employeeId) : true));

  const missedMilestone = !!goal.missedMilestone;

  // Critical conditions
  if (escalated || missedMilestone) return 'Critical';

  // Healthy: recent update within 7 days AND progress reasonable OR manager commented
  if (daysSinceUpdate <= 7 && (progress >= 50 || managerCommentPresent)) return 'Healthy';

  // At Risk: no update in 14+ days OR progress below expected
  if (daysSinceUpdate > 14 || progress < 50) return 'At Risk';

  // Default fallback
  return 'At Risk';
};
