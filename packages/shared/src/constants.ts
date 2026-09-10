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

// =============================================================================
// Step 3: Course of Action (COA) Development — Doctrinal Constants
// JP 5-0, Chapter IV, para 4.d "COA Development (Step 3)" (pp. IV-27 to IV-40)
// =============================================================================

/** Key Inputs to COA Development (JP 5-0, Figure IV-9) */
export const COA_DEV_KEY_INPUTS = [
  { id: 'in-01', label: 'Staff estimates', source: 'All Directorates' },
  { id: 'in-02', label: 'Mission statement', source: 'J-5 (Step 2)' },
  { id: 'in-03', label: "Commander's refined operational approach (JFC intent statement)", source: 'CDR / J-5' },
  { id: 'in-04', label: "JFC's updated planning guidance", source: 'CDR' },
  { id: 'in-05', label: "Commander's critical information requirements (CCIRs)", source: 'J-2 / J-3' },
  { id: 'in-06', label: 'Assumptions', source: 'All Staff' },
  { id: 'in-07', label: 'Network analysis', source: 'J-2' },
  { id: 'in-08', label: 'Enemy most likely COA (MLCOA)', source: 'J-2 / JIPOE' },
  { id: 'in-09', label: 'Enemy most dangerous COA (MDCOA)', source: 'J-2 / JIPOE' },
] as const;

/** Key Outputs of COA Development (JP 5-0, Figure IV-9) */
export const COA_DEV_KEY_OUTPUTS = [
  { id: 'out-01', label: 'Revised staff estimates' },
  { id: 'out-02', label: 'COA alternatives with concept narrative and sketch' },
  { id: 'out-03', label: 'Synchronization matrices' },
  { id: 'out-04', label: 'Risk assessment' },
  { id: 'out-05', label: 'Risk identification' },
  { id: 'out-06', label: 'COA evaluation criteria' },
  { id: 'out-07', label: 'Updated network engagement products' },
] as const;

/**
 * The five COA validity criteria. Per JP 5-0, the staff should REJECT any COA
 * alternative that does not meet ALL five.
 */
export const COA_VALIDITY_CRITERIA = [
  {
    key: 'suitable',
    label: 'Suitable',
    definition: "Can accomplish the mission within the commander's guidance.",
    tests: [
      'Does it accomplish the mission?',
      "Does it meet the commander's intent?",
      'Does it accomplish all the essential tasks?',
      'Does it meet the conditions for the objective?',
      'Does it take into consideration the enemy and friendly COGs?',
      'Where appropriate, are security objectives influenced by demographics of the local population?',
    ],
  },
  {
    key: 'feasible',
    label: 'Feasible',
    definition: 'Can accomplish the mission within the established time, space, and resource limitations.',
    tests: [
      'Does the commander have the force structure, posture, transportation, and logistics (means) to execute it?',
      'Is it executable with the forces, support, and technology available within the constraints of the OE?',
      'Is it executable against expected enemy opposition?',
      'If resources are obviously insufficient, can shortfalls be filled by requesting support?',
    ],
  },
  {
    key: 'acceptable',
    label: 'Acceptable',
    definition: 'Balances cost and risk with the advantage gained.',
    tests: [
      'Does it contain unacceptable risks? Is it worth the possible cost?',
      'Do the estimated results justify the risks (losses in forces, time, position, and opportunity)?',
      'Does it consider constraints ("must do") and restraints ("cannot do")?',
      'Is it reconciled with US and international law, USG policy, ROE, and acceptable risk?',
    ],
  },
  {
    key: 'distinguishable',
    label: 'Distinguishable',
    definition: 'Sufficiently different from the other COAs under consideration.',
    tests: [
      'Is the focus or direction of main effort different?',
      'Is the scheme of maneuver different across the physical domains, information environment, and EMS?',
      'Is it sequential versus simultaneous where others are not?',
      'Is the primary mechanism for mission accomplishment different?',
      'Is the task organization different?',
      'Is the use of reserves different?',
    ],
  },
  {
    key: 'complete',
    label: 'Complete',
    definition: 'Answers who, what, where, when, how, and why.',
    tests: [
      'Does it incorporate objectives, desired effects to create, and tasks to perform?',
      'Does it identify major forces and capabilities required, including international partners?',
      'Does it include concepts for deployment, employment, and sustainment?',
      'Does it provide time estimates for achieving objectives?',
      'Does it define mission success criteria and how the commander will know success was achieved?',
    ],
  },
] as const;

/** The six factors that make COAs distinguishable (JP 5-0, IV-38) */
export const COA_DISTINGUISHABILITY_FACTORS = [
  { key: 'main_effort', label: 'Focus / direction of main effort' },
  { key: 'scheme', label: 'Scheme of maneuver (domains, information environment, EMS)' },
  { key: 'sequencing', label: 'Sequential versus simultaneous maneuvers' },
  { key: 'mechanism', label: 'Primary mechanism for mission accomplishment' },
  { key: 'task_org', label: 'Task organization' },
  { key: 'reserves', label: 'Use of reserves' },
] as const;

/** The nine questions each COA sketch and statement must answer (JP 5-0, IV-37) */
export const COA_STATEMENT_QUESTIONS = [
  { id: 'q-01', key: 'who', question: 'Who (type of forces) will execute the tasks?' },
  { id: 'q-02', key: 'what', question: 'What are the tasks?' },
  { id: 'q-03', key: 'where', question: 'Where will the tasks occur? (graphic control measures)' },
  { id: 'q-04', key: 'when', question: 'When will the tasks begin?' },
  { id: 'q-05', key: 'decisionPoints', question: 'What are key/critical decision points?' },
  { id: 'q-06', key: 'how', question: 'How should the commander provide operational direction so components can accomplish tactical actions?' },
  { id: 'q-07', key: 'why', question: 'Why (for what purpose) will each force conduct its part of the operation?' },
  { id: 'q-08', key: 'assessment', question: 'How will the commander assess mission accomplishment?' },
  { id: 'q-09', key: 'intelConcept', question: 'What is the initial intelligence support concept?' },
] as const;

/** The 13 elements of the initial CONOPS associated with each COA (JP 5-0, IV-30) */
export const CONOPS_ELEMENTS = [
  { id: 'con-01', key: 'operationalArea', label: 'Operational Area (OA)' },
  { id: 'con-02', key: 'objectives', label: 'Objectives' },
  { id: 'con-03', key: 'essentialTasks', label: 'Essential tasks and purpose' },
  { id: 'con-04', key: 'forcesCapabilities', label: 'Forces and capabilities required (incl. commercial, interagency)' },
  { id: 'con-05', key: 'integratedTimeline', label: 'Integrated timeline' },
  { id: 'con-06', key: 'taskOrganization', label: 'Task organization' },
  { id: 'con-07', key: 'operationalConcept', label: 'Operational concept' },
  { id: 'con-08', key: 'sustainmentConcept', label: 'Sustainment concept' },
  { id: 'con-09', key: 'commSync', label: 'Communication synchronization' },
  { id: 'con-10', key: 'risk', label: 'Risk' },
  { id: 'con-11', key: 'requiredDecisions', label: 'Required decisions and decision timeline (e.g., mobilization, DEPORD)' },
  { id: 'con-12', key: 'deploymentConcept', label: 'Deployment concept' },
  { id: 'con-13', key: 'mainSupportingEfforts', label: 'Main and supporting efforts' },
] as const;

/** Step-by-Step (backward/reverse planning) Approach to COA Development (Figure IV-10) */
export const COA_STEP_BY_STEP_APPROACH = [
  { step: 1, action: 'Within the limits of available forces, determine how much force will be needed in theater at the end of the operation or campaign, what those forces will be doing, and how they will be postured geographically. Use troop-to-task analysis. Sketch the forces and their locations.' },
  { step: 2, action: 'Looking at the sketch and working backwards, determine the best way to get the forces postured in Step 1 from their ultimate positions at the end of the operation back to a base in friendly territory. This helps formulate the desired basing plan.' },
  { step: 3, action: 'Using the mission statement as a guide, determine the tasks the force must accomplish in the physical domains, information environment (including cyberspace), and EMS to achieve the desired objective. Sketch the maneuver plan and confirm all SecDef-directed specified tasks are covered.' },
  { step: 4, action: 'Determine the basing required to posture the force in friendly territory, and the tasks the force must accomplish to get to those bases. Sketch this as part of the deployment plan.' },
  { step: 5, action: 'Determine if the planned force is enough for the JFC to accomplish the outcomes of the strategic guidance.' },
  { step: 6, action: 'Given the required tasks, determine the order the forces should deploy into theater — including forces necessary for mobilization, deployment, force protection, and JRSOI.' },
  { step: 7, action: 'The information developed should now allow determination of force employment, major tasks and their sequencing, sustainment, and command relationships.' },
] as const;

/** COA development technique: simultaneous vs sequential (JP 5-0, IV-31) */
export const COA_DEV_TECHNIQUES = [
  {
    key: 'simultaneous',
    label: 'Simultaneous Development',
    advantage: 'Potential time savings — separate groups work different COAs in parallel.',
    disadvantage: 'Disrupts constructive JPG collaboration by breaking up the team; manpower-intensive; requires component and directorate representation in each group; increased likelihood COAs lack distinctiveness.',
  },
  {
    key: 'sequential',
    label: 'Sequential Development',
    advantage: 'Preserves the whole planning team on each COA, protecting collaboration and distinctiveness.',
    disadvantage: 'Consumes more of the available planning time; fewer COAs produced in the same window.',
  },
] as const;

/** Action sequencing options for arranging COA actions (JP 5-0, IV-33) */
export const COA_SEQUENCING_OPTIONS = [
  { key: 'simultaneous', label: 'Simultaneous' },
  { key: 'sequential', label: 'Sequential' },
  { key: 'combination', label: 'Combination' },
] as const;

/** Operation milestones (JP 5-0, IV-33 sidebar) */
export const OPERATION_MILESTONES = [
  { key: 'cDay', label: 'C-Day', definition: 'The day deployment begins.' },
  { key: 'dDay', label: 'D-Day', definition: 'The day operations began or are scheduled to begin.' },
  { key: 'hHour', label: 'H-Hour', definition: 'The time (on D-Day) the operation is scheduled to begin.' },
  { key: 'lHour', label: 'L-Hour', definition: 'The time (on C-Day) deployment operations begin.' },
  { key: 'mDay', label: 'M-Day', definition: 'The day mobilization (partial or full) begins.' },
  { key: 'nDay', label: 'N-Day', definition: 'The day an active duty unit is notified for deployment or redeployment.' },
] as const;

/**
 * COA Development techniques and procedures — the staff sub-tasks of Step 3.
 * Derived from JP 5-0, Chapter IV, para 4.d(3)(a)–(u).
 */
export const COA_DEV_SUBTASKS = [
  { id: 'coa-01', ref: '(a)', label: "Review mission analysis, operational approach, planning guidance, and intent", responsible: 'All Staff', description: "Ensure all staff members understand the mission and the tasks to accomplish within the commander's intent." },
  { id: 'coa-02', ref: '(b)', label: 'Determine the COA development technique (simultaneous vs sequential)', responsible: 'J-5 / JPG Lead', description: 'The first decision in COA development. Weigh time savings against loss of team collaboration and COA distinctiveness.' },
  { id: 'coa-03', ref: '(c)', label: 'Review objectives and tasks; develop ways to accomplish tasks', responsible: 'J-5 / J-3', description: "Refine objectives from the operational approach. Prioritize tasks considering the enemy's objectives and the need to gain advantage. Review all essential tasks from mission analysis." },
  { id: 'coa-04', ref: '(d)', label: 'Determine timing and arrange actions across the joint functions', responsible: 'J-3 / J-5', description: 'Estimate when key tasks must occur; use phasing; integrate requirements using C2, intelligence, fires, movement and maneuver, protection, sustainment, and information.' },
  { id: 'coa-05', ref: '(e)', label: 'Focus COAs on COGs and decisive points', responsible: 'J-2 / J-5', description: 'Review and refine enemy and friendly COG analysis based on updated intelligence, JIPOE products, and initial staff estimates. Prioritize protection of critical friendly vulnerabilities.' },
  { id: 'coa-06', ref: '(f)', label: 'Identify sequencing of actions for each COA', responsible: 'J-3 / J-5', description: 'Simultaneous, sequential, or a combination. Understand which resources become available and when — resource availability significantly affects sequencing.' },
  { id: 'coa-07', ref: '(g)', label: 'Identify main and supporting efforts by phase', responsible: 'J-3', description: 'Define the purposes of these efforts and the key supported/supporting relationships within each phase.' },
  { id: 'coa-08', ref: '(h)', label: 'Identify decision points with associated CCIRs', responsible: 'J-3 / J-2', description: 'Integrate decision points and assessment criteria into the COA, anticipating decisions required from outside the command (SecDef, the President, or another command).' },
  { id: 'coa-09', ref: '(i)', label: 'Identify component-level missions and tasks (who, what, where)', responsible: 'J-3 / Components', description: 'Component tasks framed in terms of the joint functions, displayed with graphic control measures. A designated LOO or LOE helps identify these tasks.' },
  { id: 'coa-10', ref: '(j)', label: 'Develop outline task organization and command relationships', responsible: 'J-3 / J-1', description: 'Determine subordinate command types (Service components, functional components, subordinate joint commands) and the degree of authority delegated. Major changes normally occur at phase changes.' },
  { id: 'coa-11', ref: '(k)', label: 'Develop the sustainment concept', responsible: 'J-4', description: 'No COA is complete without a proper sustainment plan — all classes of supply, services, distribution, transportation, OCS, disposition, and positioning of joint medical capabilities.' },
  { id: 'coa-12', ref: '(l)', label: 'Develop the deployment concept', responsible: 'J-4 / J-3', description: 'Describe the general flow of organic and nonorganic forces into theater, force buildup, sustainment requirements, military-political considerations, and response to a contested environment.' },
  { id: 'coa-13', ref: '(m)', label: 'Conduct nuclear planning, as required', responsible: 'J-5 / USSTRATCOM', description: 'Assess conventional-nuclear integration. Only the President has the authority to direct the planning and employment of nuclear weapons. See JP 3-72.' },
  { id: 'coa-14', ref: '(n)', label: 'Define the Operational Area (OA)', responsible: 'J-3 / J-5', description: 'Establish geographic boundaries that facilitate coordination, integration, and deconfliction. OA size and force types depend on the scope and nature of the crisis.' },
  { id: 'coa-15', ref: '(o)', label: 'Integrate and synchronize all-domain capabilities and effects', responsible: 'All Staff', description: 'Incorporate allied and partner operations, special access program capabilities, and asymmetric advantages matched to main or supporting efforts. Avoid siloed planning.' },
  { id: 'coa-16', ref: '(p)', label: 'Develop initial COA sketches and statements', responsible: 'J-5', description: 'Each COA answers the nine questions: who, what, where, when, decision points, how, why, assessment, and initial intelligence support concept.' },
  { id: 'coa-17', ref: '(q)', label: 'Test the validity of each COA', responsible: 'J-5 / Red Team', description: 'Reject any COA that fails to meet all five criteria: suitable, feasible, acceptable, distinguishable, and complete.' },
  { id: 'coa-18', ref: '(r)', label: 'Conduct COA development brief to the commander', responsible: 'J-3 / J-5', description: 'Suggested sequence and content per JP 5-0, Figure IV-11.' },
  { id: 'coa-19', ref: '(s)', label: "Obtain JFC guidance on COAs", responsible: 'CDR', description: 'Commander approves COA(s) for further analysis, directs revisions or combinations, and directs which enemy COA (MLCOA/MDCOA) to prioritize during wargaming.' },
  { id: 'coa-20', ref: '(t)', label: 'Continue the staff estimate process', responsible: 'All Staff', description: 'The staff continues to conduct staff estimates of supportability for each COA.' },
  { id: 'coa-21', ref: '(u)', label: 'Conduct vertical and horizontal concurrent planning', responsible: 'J-5 / LNOs', description: 'Coordinate with staff counterparts across functional areas, higher, adjacent, and subordinate echelons; allow lower echelons to begin planning and generate RFIs.' },
] as const;

/** COA Development Briefing sections (JP 5-0, Figure IV-11) */
export const COA_DEV_BRIEF_SECTIONS = [
  { id: 'cbrief-01', owner: 'J-3 / J-5', section: 'Context / background (road to war)' },
  { id: 'cbrief-02', owner: 'J-3 / J-5', section: 'Initiation — review guidance for initiation' },
  { id: 'cbrief-03', owner: 'J-3 / J-5', section: 'Strategic guidance — planning tasks, apportioned forces/resources, CPG/JSCP, defense agreements, theater campaign plans' },
  { id: 'cbrief-04', owner: 'J-3 / J-5', section: 'Forces allocated / assigned' },
  { id: 'cbrief-05', owner: 'J-3 / J-5', section: 'Reliance on commercial support' },
  { id: 'cbrief-06', owner: 'J-2', section: 'Joint intelligence preparation of the operational environment (JIPOE)' },
  { id: 'cbrief-07', owner: 'J-2', section: 'Enemy objectives' },
  { id: 'cbrief-08', owner: 'J-2', section: 'Enemy COAs — most dangerous, most likely; strengths and weaknesses' },
  { id: 'cbrief-09', owner: 'J-2', section: 'Nonmilitary threat networks effect on possible COAs' },
  { id: 'cbrief-10', owner: 'J-3 / J-5 / J-9', section: 'Update facts and assumptions' },
  { id: 'cbrief-11', owner: 'J-3 / J-5 / J-9', section: 'Mission statement' },
  { id: 'cbrief-12', owner: 'J-3 / J-5 / J-9', section: "Commander's intent (purpose, method, objective)" },
  { id: 'cbrief-13', owner: 'J-3 / J-5 / J-9', section: 'Objective political / military transition criteria' },
  { id: 'cbrief-14', owner: 'J-3 / J-5 / J-9', section: 'Center of gravity analysis results: critical factors; strategic/operational' },
  { id: 'cbrief-15', owner: 'J-3 / J-5 / J-9', section: 'Joint operations area / theater of operations / communications zone sketch' },
  { id: 'cbrief-16', owner: 'J-3 / J-5 / J-9', section: 'Shaping activities recommended (for current theater campaign plan)' },
  { id: 'cbrief-17', owner: 'J-3 / J-5 / J-9', section: 'Flexible deterrent options with desired effect' },
  { id: 'cbrief-18', owner: 'J-3 / J-5 / J-9', section: 'For each COA — sketch and statement by phase (task org, component tasking, timeline, C2 by phase, LOO/LOE, logistics feasibility, COA risks, sync matrices)' },
  { id: 'cbrief-19', owner: 'J-3 / J-5 / J-9', section: 'COA summarized distinctions' },
  { id: 'cbrief-20', owner: 'J-3 / J-5 / J-9', section: 'COA priority for analysis' },
  { id: 'cbrief-21', owner: 'J-3 / J-5 / J-9', section: 'Operations in the information environment' },
  { id: 'cbrief-22', owner: 'J-3 / J-5 / J-9', section: 'COA risks and opportunities from friendly nonmilitary networks and friendly military forces' },
  { id: 'cbrief-23', owner: 'J-3 / J-5 / J-9', section: 'COA risks and opportunities from neutral networks' },
  { id: 'cbrief-24', owner: 'J-2', section: 'Red objectives (COA development briefing update)' },
  { id: 'cbrief-25', owner: 'CDR', section: "Commander's guidance" },
] as const;

/** JFC guidance decisions at the close of Step 3 (JP 5-0, IV-39) */
export const JFC_COA_GUIDANCE_OPTIONS = [
  { key: 'approve', label: 'Review and approve COA(s) for further analysis' },
  { key: 'revise', label: 'Direct revisions to a COA, combinations of COAs, or development of an additional COA' },
  { key: 'wargame_priority', label: 'Direct priority for which enemy COA (most dangerous / most likely) to use during wargaming' },
] as const;
