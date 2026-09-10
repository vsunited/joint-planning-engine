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
