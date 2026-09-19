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

// =============================================================================
// Step 4: COA Analysis and Wargaming — Doctrinal Constants
// JP 5-0, Chapter IV, para 4.e "COA Analysis and Wargaming (Step 4)"
// (pp. IV-40 to IV-51)
// =============================================================================

/** Key Inputs to COA Analysis (JP 5-0, Figure IV-12) */
export const COA_ANALYSIS_KEY_INPUTS = [
  { id: 'ain-01', label: 'Revised staff estimates' },
  { id: 'ain-02', label: 'COA alternatives with concept narrative and sketch' },
  { id: 'ain-03', label: 'Synchronization matrices' },
  { id: 'ain-04', label: 'Risk assessment' },
  { id: 'ain-05', label: 'Risk identification' },
  { id: 'ain-06', label: 'COA evaluation criteria' },
  { id: 'ain-07', label: 'Network analysis' },
] as const;

/** Key Outputs of COA Analysis (JP 5-0, Figure IV-12) */
export const COA_ANALYSIS_KEY_OUTPUTS = [
  { id: 'aout-01', label: 'Potential decision points' },
  { id: 'aout-02', label: 'Potential branches and sequels' },
  { id: 'aout-03', label: 'Refined COAs' },
  { id: 'aout-04', label: 'Revised staff estimates' },
  { id: 'aout-05', label: 'Synchronization matrices' },
  { id: 'aout-06', label: 'Updated network engagement products' },
  { id: 'aout-07', label: 'Strengths and weaknesses of each COA' },
  { id: 'aout-08', label: 'Assessed risk for each COA' },
  { id: 'aout-09', label: "Refined CCIRs and decision points" },
  { id: 'aout-10', label: 'Common visualization of the operation' },
  { id: 'aout-11', label: 'Anticipated critical events' },
  { id: 'aout-12', label: 'Validated objectives and transitions' },
] as const;

/**
 * The three key decisions the staff makes BEFORE COA analysis begins.
 * JP 5-0, IV-46, para (h).
 */
export const WARGAME_KEY_DECISIONS = [
  {
    id: 'wkd-01',
    label: 'Decide what type of wargame to use',
    description: 'Stems from commander\'s guidance, time, resources available, staff expertise, and availability of simulation models.',
  },
  {
    id: 'wkd-02',
    label: 'Prioritize the enemy COAs or friendly partner capabilities to analyze',
    description: 'Given time constraints, at minimum the most likely and most dangerous enemy COAs are wargamed and role-played by the red cell.',
  },
  {
    id: 'wkd-03',
    label: 'Choose the criteria for assessing the COAs',
    description: 'Criteria are selected before the wargame. Precisely defining criteria reduces subjectivity and ensures consistent evaluation.',
  },
] as const;

/** Manual wargaming methods (JP 5-0, IV-46 to IV-47) */
export const WARGAME_METHODS = [
  {
    key: 'deliberate_timeline',
    label: 'Deliberate Timeline Analysis',
    description: 'Consider actions day-by-day or in other discrete blocks of time. The most thorough method for detailed analysis when time permits.',
  },
  {
    key: 'phasing',
    label: 'Phasing',
    description: 'Used as a framework for COA analysis. Identify significant actions and requirements by functional area or JTF component.',
  },
  {
    key: 'critical_events',
    label: 'Critical Events / Sequence of Essential Tasks',
    description: 'Highlights actions necessary to establish conditions for future operations. Enables planners to adapt if the enemy reacts in a way that requires reordering essential tasks, and to analyze essential tasks concurrently.',
  },
] as const;

/** Wargame execution format (JP 5-0, IV-46) */
export const WARGAME_FORMATS = [
  { key: 'manual', label: 'Manual' },
  { key: 'digital', label: 'Digital / Computer-Assisted' },
] as const;

/** Methods to record and display wargaming results (JP 5-0, Figure IV-13) */
export const WARGAME_RECORD_METHODS = [
  { key: 'narrative', label: 'Narrative' },
  { key: 'sketch_note', label: 'Sketch and Note' },
  { key: 'worksheets', label: 'War Game Worksheets' },
  { key: 'sync_matrix', label: 'Synchronization Matrix' },
] as const;

/** Wargame cells (JP 5-0, IV-47 to IV-48) */
export const WARGAME_CELLS = [
  {
    key: 'blue',
    label: 'Blue Cell',
    color: 'sky',
    description: 'Represents friendly forces.',
    composition: 'Joint force staff and component representatives',
  },
  {
    key: 'red',
    label: 'Red Cell',
    color: 'red',
    description: "Role-plays and models the enemy and others in the OA. Develops critical decision points, projects enemy reactions to friendly actions, and estimates impacts on enemy forces and objectives. By trying to win the wargame, the red cell helps the staff identify weaknesses before a real enemy does.",
    composition: 'J-2 staff augmented by supporting CCMD J-2 personnel and other SMEs',
  },
  {
    key: 'white',
    label: 'White Cell',
    color: 'slate',
    description: 'A small cell of arbitrators providing overall oversight and any adjudication required between participants, so the wargame does not bog down in disagreement. May include the facilitator or highly qualified experts.',
    composition: 'Senior individuals familiar with the plan',
  },
  {
    key: 'green',
    label: 'Green Cell',
    color: 'emerald',
    description: 'Represents civilians, transnational groups, NGOs, and others in the OA.',
    composition: 'J-9 / civil-military and interorganizational representatives',
  },
] as const;

/** The three moves that make up each wargame turn (JP 5-0, IV-48) */
export const WARGAME_MOVE_TYPES = [
  { key: 'action', label: 'Action', owner: 'Blue Cell', description: 'The friendly force acts.' },
  { key: 'reaction', label: 'Reaction', owner: 'Red Cell', description: 'The enemy or other relevant actor reacts.' },
  { key: 'counteraction', label: 'Counteraction', owner: 'Blue Cell', description: 'The friendly force counters the reaction.' },
] as const;

/** Enemy COA priority for wargaming (JP 5-0, IV-44) */
export const ENEMY_COA_TYPES = [
  { key: 'mlcoa', label: 'Enemy Most Likely COA (MLCOA)' },
  { key: 'mdcoa', label: 'Enemy Most Dangerous COA (MDCOA)' },
] as const;

/**
 * Sources for developing COA evaluation criteria (JP 5-0, IV-45, para (g)1).
 * Criteria change from mission to mission and require clear definition.
 */
export const EVAL_CRITERIA_SOURCES = [
  { id: 'ecs-a', label: "Commander's guidance and commander's intent" },
  { id: 'ecs-b', label: 'Mission accomplishment at an acceptable cost, including impacts to other global requirements' },
  { id: 'ecs-c', label: 'The principles of joint operations' },
  { id: 'ecs-d', label: 'Doctrinal fundamentals for the type of operation conducted' },
  { id: 'ecs-e', label: 'The level of residual risk to mission and force in the COA' },
  { id: 'ecs-f', label: 'Implicit significant factors relating to the operation (e.g., need for speed, security)' },
  { id: 'ecs-g', label: 'Factors relating to specific staff functions' },
  { id: 'ecs-h', label: 'Elements of operational design' },
  { id: 'ecs-i', label: 'Other factors: diplomatic or political constraints, residual risks, protection and restoration of the civilian environment, financial costs, flexibility, simplicity, surprise, speed, mass, sustainability, C2, and capability and infrastructure survivability' },
] as const;

/** Sample Wargaming Steps (JP 5-0, Figure IV-13) */
export const WARGAMING_STEPS = [
  {
    step: 1,
    label: 'Prepare for the Wargame',
    actions: [
      'Gather tools',
      'List and review friendly forces and capabilities',
      'List and review opposing forces and capabilities',
      'List known critical events',
      'Determine participants',
      'Determine opposing COA to wargame',
      'Select wargaming method (manual or computer-assisted)',
      'Select a method to record and display wargaming results (narrative, sketch and note, war game worksheets, synchronization matrix)',
    ],
  },
  {
    step: 2,
    label: 'Conduct Wargame and Assess Results',
    actions: [
      'Purpose of wargame (identify gaps, visualization)',
      'Basic methodology (e.g., action, reaction, counteraction)',
      'Record results',
    ],
  },
  {
    step: 3,
    label: 'Prepare Products',
    actions: [
      'Results of the wargame brief (potential decision points, evaluation criteria, potential branches and sequels)',
      'Revised staff estimates',
      'Refined COAs',
      'Time-phased force and deployment data refinement and transportation feasibility',
      'Feedback through the COA decision brief',
    ],
  },
] as const;

/**
 * What COA analysis helps the commander and staff do.
 * JP 5-0, IV-43 to IV-44, para (c)1 through 19.
 */
export const COA_ANALYSIS_PURPOSES = [
  { id: 'cap-01', label: 'Determine how to maximize combat power against the enemy while protecting friendly forces and minimizing collateral damage' },
  { id: 'cap-02', label: 'Have as near an identical visualization of the operation as possible' },
  { id: 'cap-03', label: 'Anticipate adversary, enemy, and other relevant actor actions/events and potential reaction options' },
  { id: 'cap-04', label: 'Determine conditions and resources required for success, while identifying gaps and seams' },
  { id: 'cap-05', label: "Determine when and where to apply the force's capabilities" },
  { id: 'cap-06', label: 'Plan for and coordinate authorities to integrate information activities early' },
  { id: 'cap-07', label: 'Focus intelligence and operation assessment requirements' },
  { id: 'cap-08', label: 'Determine the most flexible COA' },
  { id: 'cap-09', label: 'Identify potential decision points' },
  { id: 'cap-10', label: 'Determine task organization options' },
  { id: 'cap-11', label: 'Develop data for use in a synchronization matrix or related tool' },
  { id: 'cap-12', label: 'Identify potential plan branches and sequels' },
  { id: 'cap-13', label: 'Identify high-value targets' },
  { id: 'cap-14', label: 'Assess risk to friendly forces, HN partners and infrastructure, and the civilian environment' },
  { id: 'cap-15', label: 'Determine COA advantages and disadvantages' },
  { id: 'cap-16', label: 'Recommend CCIRs' },
  { id: 'cap-17', label: 'Validate objectives' },
  { id: 'cap-18', label: 'Identify contradictions between friendly COAs and expected enemy objectives' },
  { id: 'cap-19', label: 'Identify the potential impact to the civilian environment' },
] as const;

/**
 * Feasibility questions participants continually evaluate during the wargame.
 * JP 5-0, IV-49, para (c)3.
 */
export const WARGAME_FEASIBILITY_QUESTIONS = [
  'Is it supportable?',
  'Can it accomplish the objective?',
  'Will it achieve the desired results?',
  'How will adversaries, enemies, and other relevant actors react?',
  'Are more forces, resources, intelligence collection capabilities, or time needed?',
  'Are necessary logistics and communications available?',
  'Is the OA large enough?',
  'Has the threat successfully impacted key enablers, like logistics or communications, or countered a phase of a friendly COA?',
] as const;

/** Primary outputs of the COA wargame (JP 5-0, IV-50 to IV-51, para (d)2 a–j) */
export const WARGAME_PRIMARY_OUTPUTS = [
  { id: 'wpo-a', label: 'Wargamed COAs with graphic and narrative; branches and sequels identified' },
  { id: 'wpo-b', label: "Information on commander's evaluation criteria" },
  { id: 'wpo-c', label: 'Initial task organization' },
  { id: 'wpo-d', label: 'Critical events and decision points' },
  { id: 'wpo-e', label: 'Newly identified resource shortfalls' },
  { id: 'wpo-f', label: 'Refined/new CCIRs and event template/matrix' },
  { id: 'wpo-g', label: 'Initial DST/DSM' },
  { id: 'wpo-h', label: 'Refined synchronization matrix' },
  { id: 'wpo-i', label: 'Refined staff estimates' },
  { id: 'wpo-j', label: 'Assessment plan and criteria' },
] as const;

/** Branch vs sequel (JP 5-0, IV-44) */
export const BRANCH_SEQUEL_TYPES = [
  { key: 'branch', label: 'Branch', description: 'A contingency option built into the plan for changing the mission, disposition, orientation, or direction of movement.' },
  { key: 'sequel', label: 'Sequel', description: 'A subsequent operation based on the possible outcomes of the current operation — victory, defeat, or stalemate.' },
] as const;

// =============================================================================
// Step 5: COA Comparison — Doctrinal Constants
// JP 5-0, Chapter IV, para 4.f "COA Comparison (Step 5)" (pp. IV-51 to IV-53)
// and Appendix E, "Course of Action Comparison" (pp. E-1 to E-5)
// =============================================================================

/** Key Inputs to COA Comparison (JP 5-0, Figure IV-14) */
export const COA_COMPARISON_KEY_INPUTS = [
  { id: 'cin-01', label: 'Evaluation criteria', source: 'Step 2 / refined here' },
  { id: 'cin-02', label: 'Wargaming results', source: 'Step 4' },
  { id: 'cin-03', label: 'Advantages and disadvantages', source: 'Step 4' },
  { id: 'cin-04', label: 'Revised staff estimates', source: 'All Directorates' },
  { id: 'cin-05', label: 'Network analysis', source: 'J-2' },
] as const;

/** Key Outputs of COA Comparison (JP 5-0, Figure IV-14) */
export const COA_COMPARISON_KEY_OUTPUTS = [
  { id: 'cout-01', label: 'Evaluated COAs' },
  { id: 'cout-02', label: 'Recommended COA' },
  { id: 'cout-03', label: 'COA selection rationale' },
  { id: 'cout-04', label: 'Revised staff estimates' },
  { id: 'cout-05', label: "Refined commander's critical information requirements" },
  { id: 'cout-06', label: 'Updated synchronization matrices' },
  { id: 'cout-07', label: 'Updated network engagement products' },
] as const;

/**
 * COA comparison techniques (JP 5-0, Appendix E).
 * These are aids to selection, not decision procedures — "Commanders apply
 * logic, reason, their knowledge of the mission and the OE, and operational art
 * to determine the best COA for the mission."
 */
export const COA_COMPARISON_TECHNIQUES = [
  {
    key: 'weighted',
    label: 'Weighted Numerical Comparison',
    ref: 'Appendix E, §2',
    description:
      'The most common technique. Each criterion carries a weight reflecting its relative preference; score × weight yields the value for that criterion, and values are totalled per COA.',
    caveat:
      'Use numerical methods with caution given the inherently subjective values and weighting assigned. Do not portray the total as the result of rigorous mathematical analysis.',
  },
  {
    key: 'non_weighted',
    label: 'Non-Weighted Numerical Comparison',
    ref: 'Appendix E, §3',
    description:
      'The same as the weighted technique but without weights — raw numerical values are added for each COA. The highest number is best for each criterion.',
    caveat: 'Treats every criterion as equally important, which is rarely true of a real operation.',
  },
  {
    key: 'descriptive',
    label: 'Narrative / Bulletized Descriptive Comparison',
    ref: 'Appendix E, §4',
    description:
      'Summarize the comparison of all COAs by analyzing strengths and weaknesses, or advantages and disadvantages, for each criterion.',
    caveat: 'Carries no false precision, but makes differentiating closely matched COAs harder.',
  },
  {
    key: 'plus_minus_neutral',
    label: 'Plus / Minus / Neutral Comparison',
    ref: 'Appendix E, §5',
    description:
      'Based on the broad degree to which each criterion is supported or reflected in the COA: (+) positive influence, (0) neutral, (−) negative.',
    caveat: 'Coarse by design — good for a fast read, weak for close calls.',
  },
] as const;

/** Plus/minus/neutral values (JP 5-0, Figure E-5) */
export const PLUS_MINUS_NEUTRAL_VALUES = [
  { key: 'plus', symbol: '+', label: 'Positive influence', color: 'emerald' },
  { key: 'neutral', symbol: '0', label: 'Neutral influence', color: 'slate' },
  { key: 'minus', symbol: '−', label: 'Negative influence', color: 'red' },
] as const;

/** Questions COA comparison helps the commander answer (JP 5-0, IV-51) */
export const COMPARISON_COMMANDER_QUESTIONS = [
  { id: 'ccq-01', question: 'What are the differences between each COA?' },
  { id: 'ccq-02', question: 'What are the advantages and disadvantages?' },
  { id: 'ccq-03', question: 'What are the risks?' },
] as const;

/**
 * Preparing for COA comparison — defining criteria and their standards.
 * JP 5-0, IV-53, para (d)1–2.
 */
export const CRITERIA_DEFINITION_STEPS = [
  { id: 'cds-01', label: "Review commander's guidance for relevant criteria", phase: 'identify' },
  { id: 'cds-02', label: 'Identify implicit significant factors relating to the operation', phase: 'identify' },
  { id: 'cds-03', label: 'Identify criteria relating to that staff function', phase: 'identify' },
  { id: 'cds-04', label: 'Establish standard definitions for each evaluation criterion', phase: 'define' },
  { id: 'cds-05', label: 'Establish definitions before commencing comparison, to avoid compromising the outcome', phase: 'define' },
  { id: 'cds-06', label: 'Apply the standard for each criterion to each COA', phase: 'define' },
] as const;

// =============================================================================
// Step 6: COA Approval — Doctrinal Constants
// JP 5-0, Chapter IV, para 4.g "COA Approval (Step 6)" (pp. IV-54 to IV-57),
// Figure IV-15 and Figure IV-16
// =============================================================================

/** Key Inputs to COA Approval (JP 5-0, Figure IV-15) */
export const COA_APPROVAL_KEY_INPUTS = [
  { id: 'apin-01', label: 'Refined COAs', source: 'Step 4' },
  { id: 'apin-02', label: 'Staff recommendation', source: 'Step 5' },
  { id: 'apin-03', label: "Joint force commander's personal analysis (experience and judgment)", source: 'JFC' },
] as const;

/** Key Outputs of COA Approval (JP 5-0, Figure IV-15) */
export const COA_APPROVAL_KEY_OUTPUTS = [
  { id: 'apout-01', label: 'COA modifications' },
  { id: 'apout-02', label: "JFC's COA selection" },
  { id: 'apout-03', label: "Commander's estimate (if required)" },
  { id: 'apout-04', label: "Refined commander's intent" },
] as const;

/**
 * Sample COA Decision Briefing Guide (JP 5-0, Figure IV-16).
 * `sourceStep` names where the application can prefill the section from, so the
 * brief is assembled from prior steps rather than re-entered.
 */
export const COA_DECISION_BRIEF_GUIDE = [
  {
    id: 'db-01',
    section: 'Purpose of the briefing',
    sourceStep: null,
    items: [],
  },
  {
    id: 'db-02',
    section: 'Opposing situation',
    sourceStep: 'Step 2 — JIPOE',
    items: [
      'Strength — opposing forces, both committed and available for reinforcement',
      'Composition — order of battle, major weapons systems, and operational characteristics (air, ground, space, electromagnetic warfare, cyberspace)',
      'Location and disposition — ground combat and fire support; air, naval, and missile forces; logistics forces and nodes; C2 facilities; forces contesting blue deployments',
      'Reinforcements — land, air, naval, missile, CBRN, other advanced weapons systems; capacity for movement',
      'Logistics — ability of opposing forces to support combat operations',
      'Time and space factors — capacity to move and reinforce positions',
      'Combat efficiency — training, readiness, battle experience, physical condition, morale, leadership, motivation, tactical doctrine, discipline, strengths and weaknesses',
    ],
  },
  {
    id: 'db-03',
    section: 'Nonmilitary threat networks',
    sourceStep: 'Step 2 — JIPOE',
    items: ['Flexible format depending on situation and mission'],
  },
  {
    id: 'db-04',
    section: 'Friendly situation',
    sourceStep: 'Step 2 — Staff Estimates',
    items: ['Similar elements as the opposing situation'],
  },
  {
    id: 'db-05',
    section: 'Nonmilitary neutral networks',
    sourceStep: 'Step 2 — JIPOE',
    items: ['Flexible format depending on situation and mission'],
  },
  {
    id: 'db-06',
    section: "Commander's intent statement",
    sourceStep: 'Step 2 — Commander’s Intent',
    items: [],
  },
  {
    id: 'db-07',
    section: 'Changes since the mission analysis briefing',
    sourceStep: 'Step 2 / Step 3',
    items: [
      'Assumptions',
      'Limitations',
      'Adversary and friendly centers of gravity',
      'Phasing of the operation (if phased)',
    ],
  },
  {
    id: 'db-08',
    section: 'Present COAs',
    sourceStep: 'Step 3 — COA Development',
    items: [
      'COA number and short name',
      'COA statement (brief concept of operations)',
      'COA sketch',
      'COA architecture — task organization, command relationships, organization of the operational area',
      'Major differences between each COA',
      'Summaries of COAs',
    ],
  },
  {
    id: 'db-09',
    section: 'COA analysis',
    sourceStep: 'Step 4 — Wargaming',
    items: [
      "Review of the joint planning group's wargaming efforts",
      'Considerations added from own experience',
    ],
  },
  {
    id: 'db-10',
    section: 'COA comparisons',
    sourceStep: 'Step 5 — Comparison',
    items: [
      'Description of comparison criteria and comparison methodology',
      'Strengths and weaknesses weighed with respect to the comparison criteria',
    ],
  },
  {
    id: 'db-11',
    section: 'COA recommendations',
    sourceStep: 'Step 5 — Recommendation',
    items: ['Staff recommendation', 'Component recommendations'],
  },
] as const;

/** Who should attend the decision briefing (JP 5-0, IV-55) */
export const DECISION_BRIEF_ATTENDEES = [
  'All principal staff directors',
  'Component commanders',
] as const;

/** What the commander should do before deciding (JP 5-0, IV-55 to IV-56) */
export const COMMANDER_REVIEW_ACTIONS = [
  { id: 'cra-01', label: 'Review staff recommendations' },
  { id: 'cra-02', label: 'Apply results of own COA analysis and comparison' },
  { id: 'cra-03', label: 'Consider any separate recommendations from supporting and subordinate commanders' },
  { id: 'cra-04', label: 'Review guidance from higher headquarters / strategic guidance' },
] as const;

/** The six decisions available to the commander (JP 5-0, IV-56) */
export const COMMANDER_DECISION_OPTIONS = [
  {
    key: 'concur',
    label: 'Concur as presented',
    description: 'Concur with staff and component recommendations as briefed.',
    consequence: 'The recommended COA proceeds to plan or order development unchanged.',
    tone: 'approve',
  },
  {
    key: 'concur_with_mods',
    label: 'Concur with modifications',
    description: 'Concur with the recommended COA, but direct changes.',
    consequence: 'The COA proceeds once the staff incorporates the directed modifications.',
    tone: 'approve',
  },
  {
    key: 'select_different',
    label: 'Select a different COA',
    description: 'Choose a COA other than the one the staff recommended.',
    consequence: 'The selected COA proceeds; record why the recommendation was not adopted.',
    tone: 'neutral',
  },
  {
    key: 'combine',
    label: 'Combine COAs',
    description: 'Combine elements of two or more COAs to create a new one.',
    consequence: 'The staff builds the combined COA before plan development begins.',
    tone: 'neutral',
  },
  {
    key: 'reject_all',
    label: 'Reject all and start over',
    description: 'Reject every COA and restart at COA development or mission analysis.',
    consequence: 'Planning returns to Step 3 or Step 2. Nothing proceeds from this step.',
    tone: 'reject',
  },
  {
    key: 'defer',
    label: 'Defer the decision',
    description: 'Consult selected staff and commanders before deciding.',
    consequence: 'No COA is approved yet; record who will be consulted and by when.',
    tone: 'defer',
  },
] as const;

/** Rules for the decision statement (JP 5-0, IV-56) */
export const DECISION_STATEMENT_RULES = [
  { id: 'dsr-01', label: 'Clear and concise, setting forth the COA selected — there is no defined format' },
  { id: 'dsr-02', label: 'Describe what the force is to do, with as much of when, where, and how as is appropriate' },
  { id: 'dsr-03', label: 'Express the decision in terms of what to accomplish, if possible' },
  { id: 'dsr-04', label: 'Use simple language so the meaning is unmistakable' },
  { id: 'dsr-05', label: 'Include a statement of what is acceptable risk' },
  { id: 'dsr-06', label: 'Recognize that many simulations cannot capture qualitative data within the information environment' },
] as const;

/** Final acceptability check applied to the selected COA (JP 5-0, IV-57) */
export const ACCEPTABILITY_CHECK_ITEMS = [
  { id: 'aci-01', label: 'Apply experience and an understanding of the situation' },
  { id: 'aci-02', label: "Weigh acceptable risk against desired objectives, consistent with the higher commander's intent and concept — determine if gains are worth expenditures" },
] as const;

// =============================================================================
// Step 7: Plan or Order Development — Doctrinal Constants
// JP 5-0, Chapter IV, para 4.h "Plan or Order Development (Step 7)"
// (pp. IV-58 to IV-60) and Figure IV-17
// =============================================================================

/**
 * What the CONOPS does. The CONOPS is the centerpiece of the plan or OPORD —
 * plan development expands the approved COA by refining it.
 * JP 5-0, IV-58, para (1)(a).
 */
export const CONOPS_REQUIREMENTS = [
  { id: 'cr-01', key: 'commandersIntent', label: "States the commander's intent" },
  { id: 'cr-02', key: 'centralApproach', label: 'Describes the central approach the JFC intends to take to accomplish the mission' },
  { id: 'cr-03', key: 'schemeOfManeuver', label: 'Describes a scheme of maneuver articulating the application, arranging, sequencing, and integration of forces and capabilities in time and space' },
  { id: 'cr-04', key: 'conditions', label: 'Describes when, where, and under what conditions the commander intends to conduct operations, and give or refuse battle if required' },
  { id: 'cr-05', key: 'cogFocus', label: 'Focuses on friendly, allied, partner, and enemy COGs and their associated critical vulnerabilities' },
  { id: 'cr-06', key: 'tempo', label: 'Provides for controlling the tempo of the operation' },
  { id: 'cr-07', key: 'campaignVisualization', label: 'Visualizes the campaign in terms of the forces and functions involved' },
  { id: 'cr-08', key: 'objectiveLinkage', label: "Relates the joint force's objectives and desired effects to those of the next higher command, enabling assignment of tasks to subordinate and supporting commanders" },
] as const;

/**
 * Plan development activities (JP 5-0, Figure IV-17).
 * These "typically occur in a concurrent, collaborative, and iterative fashion
 * rather than sequentially, depending largely on the planning time available."
 */
export const PLAN_DEVELOPMENT_ACTIVITIES = [
  { id: 'pda-01', label: 'Force planning', description: 'Sequencing forces into the operational area, maintaining unit integrity, force mobility, and force visibility.' },
  { id: 'pda-02', label: 'Support planning', description: 'Sustainment, engineering, medical, and other supporting concepts required to execute the CONOPS.' },
  { id: 'pda-03', label: 'Deployment and redeployment planning', description: 'Flow of forces into and out of theater, captured in the TPFDD as required delivery dates.' },
  { id: 'pda-04', label: 'Shortfall identification', description: 'Discover and eliminate shortfalls and conflicts within the command and with other CCMDs.' },
  { id: 'pda-05', label: 'Feasibility analysis', description: 'Confirm the plan is executable with the forces, support, and time available.' },
  { id: 'pda-06', label: 'Refinement', description: 'Iterative improvement of the CONOPS and supporting concepts as detail emerges.' },
  { id: 'pda-07', label: 'Documentation', description: 'Producing the plan in the format of an order per CJCSM 3130.03.' },
  { id: 'pda-08', label: 'Plan review and approval', description: 'CJCS review for adequacy, feasibility, acceptability, completeness, and compliance with policy and joint doctrine.' },
  { id: 'pda-09', label: 'Supporting plan development', description: 'Subordinate and supporting commands develop plans that support the approved CONOPS.' },
] as const;

/**
 * Criteria the CJCS applies when reviewing the supported commander's plan.
 * JP 5-0, IV-59, para (2)(a).
 */
export const PLAN_REVIEW_CRITERIA = [
  { id: 'prc-01', label: 'Adequacy' },
  { id: 'prc-02', label: 'Feasibility' },
  { id: 'prc-03', label: 'Acceptability' },
  { id: 'prc-04', label: 'Completeness' },
  { id: 'prc-05', label: 'Compliance with policy and joint doctrine' },
] as const;

/**
 * What an in-progress review with SecDef confirms (JP 5-0, IV-59).
 * The result should be an endorsement of planning to date, or acknowledgement
 * of friction points and guidance to shape continued planning.
 */
export const IPR_CONFIRMATION_ITEMS = [
  { id: 'ipr-01', label: 'Strategic guidance' },
  { id: 'ipr-02', label: 'Assumptions, including timing and national-level decisions required' },
  { id: 'ipr-03', label: 'Limitations — restrictions and constraints' },
  { id: 'ipr-04', label: 'Mission statement' },
  { id: 'ipr-05', label: 'Operational approach' },
  { id: 'ipr-06', label: 'Key capability shortfalls' },
  { id: 'ipr-07', label: 'Areas of risk and acceptable levels of risk' },
  { id: 'ipr-08', label: 'Further guidance required for plan refinement' },
] as const;

/** IPR outcome (JP 5-0, IV-60) */
export const IPR_OUTCOMES = [
  { key: 'endorsed', label: 'Endorsement of planning to date' },
  { key: 'friction', label: 'Acknowledgement of friction points, with guidance to shape continued planning' },
  { key: 'not_held', label: 'Not yet held' },
] as const;

/** Order products produced during this step */
export const ORDER_PRODUCT_TYPES = [
  { key: 'OPLAN', label: 'Operation Plan (OPLAN)', description: 'A complete and detailed plan for the conduct of joint operations.' },
  { key: 'CONPLAN', label: 'Concept Plan (CONPLAN)', description: 'An operation plan in an abbreviated format, may require expansion into an OPLAN.' },
  { key: 'OPORD', label: 'Operation Order (OPORD)', description: 'A directive issued to subordinate commanders to effect the coordinated execution of an operation.' },
  { key: 'WARNORD', label: 'Warning Order (WARNORD)', description: 'Initiates or updates subordinate planning; does not authorize execution.' },
  { key: 'PLANORD', label: 'Planning Order (PLANORD)', description: 'Directs plan development and coordinates the activities of commands and agencies involved.' },
  { key: 'FRAGORD', label: 'Fragmentary Order (FRAGORD)', description: 'Issues changes to an existing order without restating the whole order.' },
] as const;

/** TPFDD entry force categories, linking the CONOPS to force planning (IV-59) */
export const TPFDD_FORCE_CATEGORIES = [
  'Combat',
  'Combat Support',
  'Combat Service Support',
  'Enabling / Early Entry',
  'Sustainment',
] as const;
