import { JPP_PHASES, JOINT_FUNCTIONS, USER_ROLES, CLASSIFICATION_LEVELS } from './constants';

export type JppPhaseKey = typeof JPP_PHASES[number]['key'];
export type JointFunction = typeof JOINT_FUNCTIONS[number];
export type UserRole = typeof USER_ROLES[number];
export type ClassificationLevel = typeof CLASSIFICATION_LEVELS[number];

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  // DoD Identity attributes (populated via CAC/ICAM in production)
  edipi?: string;
  serviceBranch?: 'Joint' | 'USA' | 'USN' | 'USAF' | 'USMC' | 'USSF' | 'USCG' | 'Civilian' | 'Other';
  rank?: string;
  unit?: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JppPlan {
  id: string;
  title: string;
  operationName: string;
  authorId: string;
  classificationLevel: ClassificationLevel;
  currentPhase: JppPhaseKey;
  higherHqMission?: string;
  commanderIntent?: string;
  createdDate: string;
  updatedDate: string;
}

export interface DoctrinalReference {
  id: string;
  publication: string; // e.g. "JP 5-0"
  chapter: string;
  pageNumber?: number;
  title: string;
  content: string;
}
