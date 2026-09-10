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
