export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

export const SUBMISSION_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  RETURNED: 'Returned',
  APPROVED: 'Approved',
  LOCKED: 'Locked'
};

export const UOM_TYPES = {
  NUMERIC: 'Numeric',
  PERCENTAGE: 'Percentage',
  TIMELINE: 'Timeline',
  ZERO_BASED: 'Zero-based'
};

export const GOAL_STATUS = {
  NOT_STARTED: 'Not Started',
  ON_TRACK: 'On Track',
  COMPLETED: 'Completed'
};

// BRD Section 2.3 — Check-in Schedule
// windowMonth: 0-indexed month when the window opens
// windowDay: day of month when window opens
export const CYCLE_SCHEDULE = {
  GOAL_SETTING: { label: 'Goal Setting',  opensMonth: 4,  opensDay: 1,  action: 'Goal Creation, Submission & Approval' },
  Q1:           { label: 'Q1 Check-in',   opensMonth: 6,  opensDay: 1,  action: 'Progress Update — Planned vs. Actual' },
  Q2:           { label: 'Q2 Check-in',   opensMonth: 9,  opensDay: 1,  action: 'Progress Update — Planned vs. Actual' },
  Q3:           { label: 'Q3 Check-in',   opensMonth: 0,  opensDay: 1,  action: 'Progress Update — Planned vs. Actual' },
  Q4:           { label: 'Q4 / Annual',   opensMonth: 2,  opensDay: 1,  action: 'Final Achievement Capture' },
};

export const CYCLES = {
  GOAL_SETTING: { id: 'GOAL_SETTING', label: 'Goal Setting', month: 4, canEditGoals: true, canUpdateAchievement: false },
  Q1: { id: 'Q1', label: 'Q1 Review', month: 6, canEditGoals: false, canUpdateAchievement: true },
  Q2: { id: 'Q2', label: 'Q2 Review', month: 9, canEditGoals: false, canUpdateAchievement: true },
  Q3: { id: 'Q3', label: 'Q3 Review', month: 0, canEditGoals: false, canUpdateAchievement: true },
  Q4: { id: 'Q4', label: 'Q4 / Annual', month: 2, canEditGoals: false, canUpdateAchievement: true }
};

export const CYCLE_SEQUENCE = ['GOAL_SETTING', 'Q1', 'Q2', 'Q3', 'Q4'];

export const THRUST_AREAS = [
  'Operational Excellence',
  'Innovation & R&D',
  'Customer Centricity',
  'People & Culture',
  'Sustainability',
  'Financial Growth'
];

export const APP_CONFIG = {
  MAX_GOALS: 8,
  MIN_WEIGHTAGE: 10,
  TOTAL_WEIGHTAGE: 100
};
