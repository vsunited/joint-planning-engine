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

// =============================================================================
// Step 1: Planning Initiation — Doctrinal Constants
// JP 5-0, Chapter IV
// =============================================================================

/** Default staff directorates for planning organization */
export const STAFF_DIRECTORATES = [
  'J-1', 'J-2', 'J-3', 'J-4', 'J-5', 'J-6',
  'SJA', 'Surgeon', 'PAO', 'Chaplain', 'Red Team', 'CHMR',
] as const;

/** Default roles for each directorate */
export const DIRECTORATE_ROLES: Record<string, string> = {
  'J-1': 'Personnel',
  'J-2': 'Intelligence / JIPOE',
  'J-3': 'Operations',
  'J-4': 'Logistics / Deployment',
  'J-5': 'Plans / Strategy',
  'J-6': 'C4 / Cybersecurity',
  'SJA': 'Staff Judge Advocate (Legal)',
  'Surgeon': 'Staff Surgeon (Medical)',
  'PAO': 'Public Affairs Officer',
  'Chaplain': 'Chaplain',
  'Red Team': 'Red Team Lead',
  'CHMR': 'Civilian Harm Mitigation & Response',
};

/** WARNORD section labels for template structure */
export const WARNORD_SECTIONS = [
  'Situation',
  'Command Relationships',
  'Mission',
  'Operational Limitations',
  'Forces Allocated',
  'Anticipated Timeline',
  'Assumptions',
  'Directed COA Assessment',
] as const;

/** Planning trigger types */
export const PLANNING_TRIGGERS = [
  { key: 'WARNORD', label: 'Warning Order (WARNORD)', source: 'Higher HQ', description: 'Initiates COA development. Does not authorize execution.' },
  { key: 'PLANORD', label: 'Planning Order (PLANORD)', source: 'Higher HQ', description: 'Directs plan development before COA approval.' },
  { key: 'ALERTORD', label: 'Alert Order (ALERTORD)', source: 'SecDef/CJCS', description: 'Directs plan development after SecDef/POTUS approves a COA.' },
  { key: 'CCDR_INITIATIVE', label: 'CCDR/JTF Initiative', source: 'Own Authority', description: 'Bottom-up planning based on OE monitoring or imminent crisis.' },
] as const;

/** Initial staff actions — 10 doctrinal items from JP 5-0 */
export const INITIAL_STAFF_ACTIONS = [
  { id: 'sa-01', label: 'Receive and analyze higher HQ planning directive', responsible: 'J-5 / J-3', description: 'Log, disseminate, and conduct initial analysis of the planning directive or strategic guidance received from higher headquarters.' },
  { id: 'sa-02', label: 'Determine total time available; establish 1/3–2/3 allocations', responsible: 'COS / XO', description: 'Calculate total time from planning initiation to projected execution; allocate 1/3 to HQ staff and 2/3 to subordinate commands.' },
  { id: 'sa-03', label: 'Issue internal planning timeline and battle rhythm', responsible: 'COS / XO', description: 'Publish working group schedules, briefing timelines, and decision points to synchronize the headquarters planning effort.' },
  { id: 'sa-04', label: 'Organize and stand up JPG/OPT; assign directorate responsibilities', responsible: 'J-5 / J-3', description: 'Establish the Joint Planning Group or Operational Planning Team; assign leads and functional expertise from each directorate.' },
  { id: 'sa-05', label: 'Notify subordinate, adjacent, and supporting commands; request LNOs', responsible: 'J-3', description: 'Issue initial notifications and request liaison officers from subordinate, adjacent, and supporting commands and agencies.' },
  { id: 'sa-06', label: 'Initiate JIPOE Step 1 (Define the Operational Environment)', responsible: 'J-2', description: 'Begin Joint Intelligence Preparation of the Operational Environment — define geographic, physical, cyber, and informational boundaries.' },
  { id: 'sa-07', label: 'Initiate functional staff estimates across all directorates', responsible: 'All Staff', description: 'Each directorate begins evaluating the OE from their functional perspective to establish baseline feasibility and identify critical shortfalls.' },
  { id: 'sa-08', label: 'Identify existing plans (IPS, GCP, CCP, CONPLAN, OPLAN) for adaptation', responsible: 'J-5', description: 'Survey existing plans and orders that may serve as a basis for modification, reducing planning time through adaptation.' },
  { id: 'sa-09', label: 'Gather facts, baseline data, and identify critical knowledge gaps', responsible: 'J-2 / J-5', description: 'Compile verifiable evidence and empirical data; identify information gaps that require assumptions or additional intelligence collection.' },
  { id: 'sa-10', label: 'Draft and publish initial WARNORD / PLANDIR / LOI to subordinates', responsible: 'J-5 / J-3', description: 'Draft the command WARNORD or planning directive and transmit to all subordinate and supporting commands to enable parallel planning.' },
] as const;
