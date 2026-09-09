export const JPP_PHASES = [
  { id: 1, key: 'initiation', name: 'Phase I: Planning Initiation' },
  { id: 2, key: 'mission_analysis', name: 'Phase II: Mission Analysis' },
  { id: 3, key: 'coa_development', name: 'Phase III: Course of Action (COA) Development' },
  { id: 4, key: 'coa_analysis', name: 'Phase IV: COA Analysis and Wargaming' },
  { id: 5, key: 'coa_comparison', name: 'Phase V: COA Comparison' },
  { id: 6, key: 'coa_approval', name: 'Phase VI: COA Approval' },
  { id: 7, key: 'orders_production', name: 'Phase VII: Plan or Order Production' },
] as const;

export const JOINT_FUNCTIONS = [
  'Command and Control (C2)',
  'Information',
  'Intelligence',
  'Fires',
  'Movement and Maneuver',
  'Protection',
  'Sustainment',
] as const;

export const USER_ROLES = ['viewer', 'planner', 'commander', 'admin'] as const;

export const CLASSIFICATION_LEVELS = ['UNCLASSIFIED', 'CUI'] as const;
