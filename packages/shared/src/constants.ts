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

// =============================================================================
// Step 2: Mission Analysis — Doctrinal Constants
// JP 5-0, Chapter IV — 16 Sub-Tasks
// =============================================================================

/** 16 Mission Analysis Sub-Tasks per JP 5-0 */
export const MISSION_ANALYSIS_SUBTASKS = [
  { id: 'ma-01', label: 'Begin Logistics Supportability Analysis', responsible: 'J-4', description: 'Evaluate APODs/SPODs, LOC capacity, prepositioned WRM, HNS, and OCS to identify sustainment feasibility and constraints.' },
  { id: 'ma-02', label: 'Analyze Higher HQ Directives & Strategic Guidance', responsible: 'J-5', description: 'Dissect CPG, JSCP, GEF, and higher orders to identify strategic ends, national assumptions, and policy constraints.' },
  { id: 'ma-03', label: 'Review Commander\'s Initial Planning Guidance', responsible: 'J-5 / J-3', description: 'Review commander\'s initial visualization of the OE, problem statement, and operational approach from Step 1.' },
  { id: 'ma-04', label: 'Determine Known Facts & Develop Planning Assumptions', responsible: 'All Staff', description: 'Compile verifiable evidence and establish valid assumptions (logical, realistic, essential) to bridge knowledge gaps.' },
  { id: 'ma-05', label: 'Determine & Analyze Operational Limitations', responsible: 'SJA / J-3', description: 'Isolate constraints (must do) and restraints (cannot do) from higher authority, law, policy, or ROE.' },
  { id: 'ma-06', label: 'Determine Specified, Implied, and Essential Tasks', responsible: 'J-5 / J-3', description: 'Extract assigned tasks, deduce implied requirements, and select decisive essential tasks for the mission statement.' },
  { id: 'ma-07', label: 'Develop Mission Statement', responsible: 'J-5', description: 'Draft concise statement answering WHO, WHAT, WHEN, WHERE, and WHY.' },
  { id: 'ma-08', label: 'Conduct Initial Force & Resource Analysis', responsible: 'J-3 / J-4', description: 'Develop ROM force requirement; assess assigned/allocated forces via GFMIG; identify initial shortfalls.' },
  { id: 'ma-09', label: 'Develop Risk Assessment', responsible: 'J-5 / J-3', description: 'Analyze Risk-to-Mission (operational) and Risk-to-Force (force management) across probability and consequence.' },
  { id: 'ma-10', label: 'Develop COA Evaluation Criteria', responsible: 'J-5', description: 'Define objective and subjective standards for evaluating COAs in Step 5. Established now to prevent post-wargaming bias.' },
  { id: 'ma-11', label: 'Develop Operational-Level Objectives', responsible: 'J-5 / J-3', description: 'Formulate clear operational objectives linking tactical actions to strategic ends; define desired and undesired effects.' },
  { id: 'ma-12', label: 'Develop Commander\'s Critical Information Requirements', responsible: 'J-2 / J-3', description: 'Identify PIRs (J-2 managed) and FFIRs (J-3 managed) tied to decision points; identify EEFIs for OPSEC.' },
  { id: 'ma-13', label: 'Prepare Staff Estimates', responsible: 'All Staff', description: 'Each directorate evaluates how their area supports the mission, identifies resource gaps, and determines supportability.' },
  { id: 'ma-14', label: 'Prepare & Deliver Mission Analysis Brief', responsible: 'J-5', description: 'Comprehensive briefing to commander and staff establishing shared situational understanding.' },
  { id: 'ma-15', label: 'Publish Commander\'s Updated Guidance, Intent & Refined Approach', responsible: 'CDR / COS', description: 'Commander approves restated mission, issues refined intent and guidance to focus COA development.' },
  { id: 'ma-16', label: 'Analyze Commercial Capability Reliance (Change 1)', responsible: 'J-4 / VTM', description: 'Identify reliance on commercial infrastructure and integrate Vendor Threat Mitigation per DoDD 3000.16.' },
] as const;

/** Default COA Evaluation Criteria from JP 5-0 */
export const DEFAULT_COA_EVAL_CRITERIA = [
  { id: 'crit-01', name: 'Decisive Action vs Enemy COG', description: 'Does the COA effectively target the enemy center of gravity?' },
  { id: 'crit-02', name: 'Risk', description: 'What is the overall risk-to-mission and risk-to-force?' },
  { id: 'crit-03', name: 'Flexibility', description: 'Does the COA allow for adjustment and adaptation?' },
  { id: 'crit-04', name: 'Surprise', description: 'Does the COA achieve tactical or operational surprise?' },
  { id: 'crit-05', name: 'Sustainment', description: 'Can the force be logistically sustained throughout the operation?' },
  { id: 'crit-06', name: 'Force Protection', description: 'Does the COA adequately protect the force?' },
  { id: 'crit-07', name: 'Time', description: 'Can the COA be executed within the required timeline?' },
  { id: 'crit-08', name: 'Civilian Environment', description: 'What is the impact on civilians and civil infrastructure?' },
] as const;

/** Mission Analysis Briefing sections (JP 5-0, Figure IV-8) */
export const MA_BRIEFING_SECTIONS = [
  { id: 'brief-01', section: 'Introduction (Purpose & Agenda)' },
  { id: 'brief-02', section: 'Situation Overview (OE, PMESII, Enemy COGs, Neutral Assessment)' },
  { id: 'brief-03', section: 'Friendly Assessment (Facts, Assumptions, Limitations, Capabilities)' },
  { id: 'brief-04', section: 'Communication Synchronization (Strategic Narrative, Info Themes)' },
  { id: 'brief-05', section: 'Objectives, Effects & Task Analysis (Specified/Implied/Essential)' },
  { id: 'brief-06', section: 'Operational Protection (Risk Assessment & Mitigation)' },
  { id: 'brief-07', section: 'Proposed Initial CCIRs (PIRs & FFIRs)' },
  { id: 'brief-08', section: 'Proposed Mission Statement & Commander\'s Intent' },
  { id: 'brief-09', section: 'Command Relationships Analysis & Options' },
  { id: 'brief-10', section: 'Conclusion (Resource Shortfalls)' },
  { id: 'brief-11', section: 'Mission Analysis Approval & COA Planning Guidance' },
] as const;

/** Fact categories */
export const FACT_CATEGORIES = [
  { key: 'friendly', label: 'Friendly', color: 'emerald' },
  { key: 'enemy', label: 'Enemy/Threat', color: 'red' },
  { key: 'terrain', label: 'Terrain/Weather', color: 'sky' },
  { key: 'civil', label: 'Civil Environment', color: 'amber' },
  { key: 'other', label: 'Other', color: 'slate' },
] as const;
