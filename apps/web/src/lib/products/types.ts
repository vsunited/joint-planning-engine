import { PlanningState } from '@/context/PlanningContext';

/**
 * A doctrinal staff product, expressed as a pure function from planning state
 * to text. Keeping these pure means they can be previewed, copied, downloaded
 * or concatenated without touching component state.
 */
export interface PlanningProduct {
  id: string;
  phaseId: number;
  label: string;
  doctrineRef: string;
  build: (state: PlanningState) => string;
}
