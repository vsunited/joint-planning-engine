// =============================================================================
// Step 1: Planning Initiation — Type Definitions
// JP 5-0, Chapter IV — Joint Planning Process
// =============================================================================

/** Planning trigger type — what initiated the planning process */
export interface PlanningTrigger {
  type: 'WARNORD' | 'PLANORD' | 'ALERTORD' | 'CCDR_INITIATIVE';
  source: string;
  dtg: string;
  classification: string;
  summary: string;
}

/** Commander's Initial Planning Guidance (CIPG) */
export interface CommanderGuidance {
  operationalApproach: string;
  problemFraming: string;
  constraints: string[];
  restraints: string[];
  coordinationRequirements: string[];
  timelineGuidance: string;
}

/** Planning Organization member */
export interface PlanningOrgMember {
  directorate: string;
  name: string;
  role: string;
  status: 'assigned' | 'pending' | 'unavailable';
}

/** Planning Organization (JPG/OPT/OPG) */
export interface PlanningOrganization {
  type: 'JPG' | 'OPT' | 'OPG';
  lead: 'J-5' | 'J-3';
  planningContext: 'deliberate' | 'crisis';
  members: PlanningOrgMember[];
}

/** WARNORD structured content — 8 doctrinal sections */
export interface WarnordContent {
  situation: string;
  commandRelationships: string;
  mission: string;
  constraints: string[];
  restraints: string[];
  forcesAllocated: string;
  anticipatedTimeline: {
    mDay: string;
    cDay: string;
    dDay: string;
  };
  assumptions: string[];
  secDefApprovalRequired: boolean;
}

/** Planning milestone for timeline tracking */
export interface PlanningMilestone {
  id: string;
  name: string;
  targetDtg: string;
  status: 'pending' | 'in_progress' | 'complete';
}

/** 1/3–2/3 time allocation */
export interface TimeAllocation {
  totalHoursToExecution: number;
  staffAllocation: number;
  subordinateAllocation: number;
  planningMilestones: PlanningMilestone[];
}

/** Staff action checklist item */
export interface StaffAction {
  id: string;
  label: string;
  description: string;
  responsible: string;
  completed: boolean;
  completedAt?: string;
}

/** Top-level Step 1 state */
export interface PlanningInitiationState {
  trigger: PlanningTrigger;
  commanderGuidance: CommanderGuidance;
  planningOrg: PlanningOrganization;
  warnord: WarnordContent;
  timeAllocation: TimeAllocation;
  staffActions: StaffAction[];
  existingPlansReviewed: string[];
  notes: string;
}

// =============================================================================
// Step 2: Mission Analysis — Type Definitions
// JP 5-0, Chapter IV — 16 Sub-Tasks
// =============================================================================

/** Task classification per JP 5-0 */
export type TaskClassification = 'specified' | 'implied' | 'essential';

/** A single task identified during mission analysis */
export interface MissionTask {
  id: string;
  description: string;
  classification: TaskClassification;
  source: string;
  assignedTo: string;
  isEssential: boolean;
  notes: string;
}

/** A fact — verifiable evidence */
export interface FactItem {
  id: string;
  description: string;
  source: string;
  category: 'friendly' | 'enemy' | 'terrain' | 'civil' | 'other';
}

/** An assumption — must be logical, realistic, essential */
export interface AssumptionItem {
  id: string;
  description: string;
  isLogical: boolean;
  isRealistic: boolean;
  isEssential: boolean;
  linkedCcir: string;
  validatedAsFact: boolean;
}

/** CCIR types */
export type CcirType = 'PIR' | 'FFIR';

/** Commander's Critical Information Requirement */
export interface CcirItem {
  id: string;
  type: CcirType;
  priority: number;
  question: string;
  indicator: string;
  collectionAsset: string;
  ltiov: string;
  status: 'active' | 'answered' | 'superseded';
}

/** Essential Element of Friendly Information */
export interface EefiItem {
  id: string;
  description: string;
  protectionMeasure: string;
  status: 'active' | 'mitigated';
}

/** Restated Mission — WHO/WHAT/WHEN/WHERE/WHY */
export interface RestatedMission {
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
  fullStatement: string;
}

/** Operational objective */
export interface OperationalObjective {
  id: string;
  description: string;
  desiredEffect: string;
  undesiredEffect: string;
  linkedTask: string;
}

/** Risk assessment entry */
export interface RiskEntry {
  id: string;
  type: 'mission' | 'force';
  hazard: string;
  probability: 'low' | 'medium' | 'high';
  consequence: 'low' | 'medium' | 'high';
  mitigation: string;
  residualRisk: 'low' | 'medium' | 'high';
}

/** COA evaluation criterion — established during mission analysis to prevent bias */
export interface CoaEvalCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

/** Running staff estimate per directorate */
export interface StaffEstimateEntry {
  directorate: string;
  status: 'not_started' | 'in_progress' | 'complete';
  keyFindings: string;
  shortfalls: string;
  recommendation: string;
}

/** JIPOE progress tracker */
export interface JipoeProgress {
  step1_defineOE: 'not_started' | 'in_progress' | 'complete';
  step2_describeImpact: 'not_started' | 'in_progress' | 'complete';
  step3_evaluateThreat: 'not_started' | 'in_progress' | 'complete';
  step4_determineThreatCOAs: 'not_started' | 'in_progress' | 'complete';
  enemyCOG: string;
  friendlyCOG: string;
  mlcoa: string;
  mdcoa: string;
}

/** Mission Analysis Briefing checklist item */
export interface BriefingSection {
  id: string;
  section: string;
  prepared: boolean;
  presenter: string;
}

/** Top-level Step 2 state */
export interface MissionAnalysisState {
  tasks: MissionTask[];
  facts: FactItem[];
  assumptions: AssumptionItem[];
  ccirs: CcirItem[];
  eefis: EefiItem[];
  restatedMission: RestatedMission;
  objectives: OperationalObjective[];
  risks: RiskEntry[];
  coaEvalCriteria: CoaEvalCriterion[];
  staffEstimates: StaffEstimateEntry[];
  jipoe: JipoeProgress;
  briefingSections: BriefingSection[];
  commanderIntent: string;
  commanderGuidanceUpdate: string;
  subTaskCompletion: Record<string, boolean>;
}

// =============================================================================
// Step 3: Course of Action (COA) Development — Type Definitions
// JP 5-0, Chapter IV, para 4.d — COA Development (Step 3)
// =============================================================================

/** The five doctrinal COA validity criteria */
export type CoaValidityKey =
  | 'suitable'
  | 'feasible'
  | 'acceptable'
  | 'distinguishable'
  | 'complete';

/** Validity test result for one criterion on one COA */
export interface CoaValidityCheck {
  status: 'untested' | 'pass' | 'fail';
  rationale: string;
}

/** COA statement — the nine questions each COA must answer (JP 5-0, IV-37) */
export interface CoaStatement {
  who: string;
  what: string;
  where: string;
  when: string;
  decisionPoints: string;
  how: string;
  why: string;
  assessment: string;
  intelConcept: string;
}

/** Initial CONOPS — the 13 elements associated with each COA (JP 5-0, IV-30) */
export interface CoaConops {
  operationalArea: string;
  objectives: string;
  essentialTasks: string;
  forcesCapabilities: string;
  integratedTimeline: string;
  taskOrganization: string;
  operationalConcept: string;
  sustainmentConcept: string;
  commSync: string;
  risk: string;
  requiredDecisions: string;
  deploymentConcept: string;
  mainSupportingEfforts: string;
}

/** How a COA distinguishes itself from the others (JP 5-0, IV-38) */
export interface CoaDistinguishability {
  mainEffort: string;
  scheme: string;
  sequencing: 'simultaneous' | 'sequential' | 'combination';
  mechanism: string;
  taskOrg: string;
  reserves: string;
}

/** Effort assignment within a phase */
export interface CoaEffort {
  id: string;
  phase: string;
  type: 'main' | 'supporting';
  component: string;
  purpose: string;
  supportedBy: string;
}

/** Component-level mission/task framed by joint function (JP 5-0, IV-33) */
export interface ComponentTask {
  id: string;
  component: string;
  jointFunction: string;
  task: string;
  location: string;
  purpose: string;
  lineOfEffort: string;
}

/** Decision point tied to a CCIR (JP 5-0, IV-33) */
export interface CoaDecisionPoint {
  id: string;
  name: string;
  description: string;
  linkedCcirId: string;
  latestDecisionDtg: string;
  decisionAuthority: 'JFC' | 'CCDR' | 'SecDef' | 'President' | 'Other';
  triggerCriteria: string;
}

/** Task organization entry with command relationship */
export interface TaskOrgEntry {
  id: string;
  component: string;
  forcesAssigned: string;
  commandRelationship: 'COCOM' | 'OPCON' | 'TACON' | 'ADCON' | 'Supported' | 'Supporting' | 'Direct Support';
  phase: string;
}

/** COA-specific risk entry */
export interface CoaRisk {
  id: string;
  type: 'mission' | 'force';
  description: string;
  probability: 'low' | 'medium' | 'high';
  consequence: 'low' | 'medium' | 'high';
  mitigation: string;
}

/** A single course of action */
export interface CourseOfAction {
  id: string;
  designator: string;
  name: string;
  narrative: string;
  sketchNotes: string;
  statement: CoaStatement;
  conops: CoaConops;
  distinguishability: CoaDistinguishability;
  efforts: CoaEffort[];
  componentTasks: ComponentTask[];
  decisionPoints: CoaDecisionPoint[];
  taskOrg: TaskOrgEntry[];
  risks: CoaRisk[];
  validity: Record<CoaValidityKey, CoaValidityCheck>;
  jfcDisposition: 'pending' | 'approved_for_analysis' | 'revise' | 'rejected';
  wargamePriority: number;
}

/** Operation milestones fixed during COA development (JP 5-0, IV-33) */
export interface OperationMilestones {
  cDay: string;
  dDay: string;
  hHour: string;
  lHour: string;
  mDay: string;
  nDay: string;
}

/** Refined COG analysis carried forward from mission analysis (JP 5-0, IV-33) */
export interface CogRefinement {
  enemyCog: string;
  enemyCriticalCapabilities: string;
  enemyCriticalRequirements: string;
  enemyCriticalVulnerabilities: string;
  friendlyCog: string;
  friendlyCriticalVulnerabilities: string;
  protectionPriorities: string;
  decisivePoints: string;
}

/** Per-COA staff supportability estimate (JP 5-0, IV-39, sub-task (t)) */
export interface CoaSupportabilityEntry {
  directorate: string;
  coaId: string;
  supportable: 'yes' | 'no' | 'with_mitigation' | 'not_assessed';
  shortfalls: string;
}

/** COA Development Briefing checklist item (JP 5-0, Figure IV-11) */
export interface CoaBriefSection {
  id: string;
  owner: string;
  section: string;
  prepared: boolean;
  presenter: string;
}

/** Commander's guidance issued at the close of Step 3 (JP 5-0, IV-39) */
export interface JfcCoaGuidance {
  approvedCoaIds: string[];
  revisionDirection: string;
  wargamePriorityEnemyCoa: 'mlcoa' | 'mdcoa' | 'both';
  additionalGuidance: string;
  briefDtg: string;
}

/** Top-level Step 3 state */
export interface CoaDevelopmentState {
  technique: 'simultaneous' | 'sequential';
  operationalArea: string;
  milestones: OperationMilestones;
  cog: CogRefinement;
  coas: CourseOfAction[];
  supportability: CoaSupportabilityEntry[];
  briefSections: CoaBriefSection[];
  jfcGuidance: JfcCoaGuidance;
  subTaskCompletion: Record<string, boolean>;
  notes: string;
}

// =============================================================================
// Step 4: COA Analysis and Wargaming — Type Definitions
// JP 5-0, Chapter IV, para 4.e — COA Analysis and Wargaming (Step 4)
// =============================================================================

/** Which enemy COA a friendly COA is wargamed against */
export type EnemyCoaType = 'mlcoa' | 'mdcoa';

/** Manual wargaming method (JP 5-0, IV-46) */
export type WargameMethod = 'deliberate_timeline' | 'phasing' | 'critical_events';

/** A critical event — an essential task or series of tasks requiring detailed analysis */
export interface CriticalEvent {
  id: string;
  name: string;
  description: string;
  phase: string;
  timeframe: string;
  linkedEssentialTask: string;
  linkedDecisionPointId: string;
}

/** Wargame cell staffing assignment */
export interface WargameCellAssignment {
  cell: 'blue' | 'red' | 'white' | 'green';
  lead: string;
  members: string;
  notes: string;
}

/**
 * One wargame turn: action, reaction, counteraction.
 * JP 5-0, IV-48 — each turn consists of three total moves.
 */
export interface WargameTurn {
  id: string;
  coaId: string;
  enemyCoaType: EnemyCoaType;
  criticalEventId: string;
  turnNumber: number;
  action: string;
  reaction: string;
  counteraction: string;
  adjudication: string;
  insights: string;
  identifiedGaps: string;
}

/** A cell in the synchronization matrix: one joint function across one critical event */
export interface SyncMatrixEntry {
  id: string;
  coaId: string;
  jointFunction: string;
  criticalEventId: string;
  content: string;
}

/** Decision Support Template / Matrix entry (JP 5-0, IV-50) */
export interface DecisionSupportEntry {
  id: string;
  coaId: string;
  decisionPoint: string;
  criticalEvent: string;
  latestTimeToDecide: string;
  linkedCcir: string;
  namedAreaOfInterest: string;
  friendlyAction: string;
}

/** A branch or sequel identified during wargaming */
export interface BranchSequel {
  id: string;
  coaId: string;
  type: 'branch' | 'sequel';
  name: string;
  trigger: string;
  description: string;
}

/** High-value target identified during wargaming */
export interface HighValueTarget {
  id: string;
  coaId: string;
  target: string;
  jointFunction: string;
  whyCritical: string;
  linkedCog: string;
}

/** Newly identified resource shortfall */
export interface ResourceShortfall {
  id: string;
  coaId: string;
  description: string;
  directorate: string;
  impact: 'low' | 'medium' | 'high';
  sourcingAction: string;
}

/** Per-COA wargame assessment result */
export interface CoaWargameResult {
  coaId: string;
  strengths: string;
  weaknesses: string;
  advantages: string;
  disadvantages: string;
  assessedRisk: 'low' | 'medium' | 'high' | 'not_assessed';
  riskRationale: string;
  feasibilityConfirmed: boolean;
  recommendation: 'retain' | 'modify' | 'discard' | 'pending';
}

/** Refined CCIR recommendation coming out of the wargame */
export interface RefinedCcir {
  id: string;
  coaId: string;
  type: CcirType;
  question: string;
  linkedDecisionPoint: string;
  namedAreaOfInterest: string;
  isNew: boolean;
}

/** Wargame setup configuration */
export interface WargameSetup {
  format: 'manual' | 'digital';
  method: WargameMethod;
  recordMethods: string[];
  enemyCoasToWargame: EnemyCoaType[];
  turnsPlanned: number;
  levelOfDetail: string;
  facilitator: string;
  startEvent: string;
  startLocation: string;
  startTime: string;
  commanderWargameGuidance: string;
  keyDecisionsComplete: Record<string, boolean>;
}

/** Top-level Step 4 state */
export interface CoaAnalysisState {
  setup: WargameSetup;
  cells: WargameCellAssignment[];
  criticalEvents: CriticalEvent[];
  turns: WargameTurn[];
  syncMatrix: SyncMatrixEntry[];
  decisionSupport: DecisionSupportEntry[];
  branchesSequels: BranchSequel[];
  highValueTargets: HighValueTarget[];
  shortfalls: ResourceShortfall[];
  results: CoaWargameResult[];
  refinedCcirs: RefinedCcir[];
  purposeCompletion: Record<string, boolean>;
  outputCompletion: Record<string, boolean>;
  assessmentPlan: string;
  notes: string;
}

// =============================================================================
// Step 5: COA Comparison — Type Definitions
// JP 5-0, Chapter IV, para 4.f and Appendix E
// =============================================================================

/** Comparison technique (JP 5-0, Appendix E) */
export type ComparisonTechnique =
  | 'weighted'
  | 'non_weighted'
  | 'descriptive'
  | 'plus_minus_neutral';

/** Plus/minus/neutral rating (JP 5-0, Figure E-5) */
export type PlusMinusNeutral = 'plus' | 'neutral' | 'minus' | 'unrated';

/**
 * An evaluation criterion as used for comparison. Extends the Step 2
 * CoaEvalCriterion shape with the precise `standard` doctrine requires to be
 * established before comparison begins (JP 5-0, IV-53).
 */
export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  /** Precise definition of how this criterion is judged, set before scoring. */
  standard: string;
  weight: number;
  source: string;
  active: boolean;
}

/** One COA's score against one criterion */
export interface CriterionScore {
  id: string;
  criterionId: string;
  coaId: string;
  /** Numerical rating — higher is better (JP 5-0, Appendix E §2(3)) */
  score: number | null;
  /** Plus/minus/neutral rating, used by that technique */
  pmn: PlusMinusNeutral;
  rationale: string;
}

/** Per-COA, per-criterion narrative comparison (JP 5-0, Figures E-3 and E-4) */
export interface CoaCriterionNarrative {
  id: string;
  coaId: string;
  criterionId: string;
  strengths: string;
  weaknesses: string;
  advantages: string;
  disadvantages: string;
}

/** The staff's recommendation to the commander */
export interface ComparisonRecommendation {
  recommendedCoaId: string;
  rationale: string;
  differences: string;
  advantagesSummary: string;
  riskSummary: string;
  dissentingViews: string;
  briefedDtg: string;
}

/** Top-level Step 5 state */
export interface CoaComparisonState {
  technique: ComparisonTechnique;
  criteria: ComparisonCriterion[];
  scores: CriterionScore[];
  narratives: CoaCriterionNarrative[];
  recommendation: ComparisonRecommendation;
  definitionCompletion: Record<string, boolean>;
  outputCompletion: Record<string, boolean>;
  notes: string;
}

// =============================================================================
// Step 6: COA Approval — Type Definitions
// JP 5-0, Chapter IV, para 4.g, Figures IV-15 and IV-16
// =============================================================================

/** The six decisions available to the commander (JP 5-0, IV-56) */
export type CommanderDecisionType =
  | 'concur'
  | 'concur_with_mods'
  | 'select_different'
  | 'combine'
  | 'reject_all'
  | 'defer'
  | 'undecided';

/** Wizard stage */
export type ApprovalStage = 1 | 2 | 3 | 4;

/** One section of the COA decision briefing (JP 5-0, Figure IV-16) */
export interface DecisionBriefSection {
  id: string;
  section: string;
  prepared: boolean;
  presenter: string;
  notes: string;
}

/**
 * The commander's decision.
 *
 * `selectedCoaIds` is an array because the JFC may present two or more valid
 * COAs to higher authority where the objective cannot be determined until the
 * crisis occurs (JP 5-0, IV-54), and because "combine" spans multiple COAs.
 */
export interface CommanderDecision {
  type: CommanderDecisionType;
  selectedCoaIds: string[];
  modifications: string;
  rationale: string;
  decidedDtg: string;
  /** Who will be consulted, when 'defer' is chosen */
  deferConsultation: string;
  /** Where planning restarts, when 'reject_all' is chosen */
  restartAt: 'step_2' | 'step_3';
  reviewCompletion: Record<string, boolean>;
}

/** The refined decision statement (JP 5-0, IV-56 to IV-57) */
export interface DecisionStatement {
  statement: string;
  acceptableRisk: string;
  acceptabilityCheck: Record<string, boolean>;
}

/** The commander's estimate (JP 5-0, IV-57) */
export interface CommandersEstimate {
  narrative: string;
  refinedIntent: string;
  higherApprovalRequired: boolean;
  higherApprovalAuthority: string;
  notes: string;
}

/** Top-level Step 6 state */
export interface CoaApprovalState {
  stage: ApprovalStage;
  briefSections: DecisionBriefSection[];
  attendance: Record<string, boolean>;
  decision: CommanderDecision;
  decisionStatement: DecisionStatement;
  estimate: CommandersEstimate;
  outputCompletion: Record<string, boolean>;
}
