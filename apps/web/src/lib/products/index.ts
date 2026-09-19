import { PlanningProduct } from './types';
import { STEP1_PRODUCTS } from './step1';
import { STEP2_PRODUCTS } from './step2';
import { STEP3_PRODUCTS } from './step3';
import { STEP4_PRODUCTS } from './step4';
import { STEP5_PRODUCTS } from './step5';
import { STEP6_PRODUCTS } from './step6';
import { STEP7_PRODUCTS } from './step7';

export type { PlanningProduct } from './types';

/** Every doctrinal staff product the application can generate. */
export const PRODUCTS: PlanningProduct[] = [
  ...STEP1_PRODUCTS,
  ...STEP2_PRODUCTS,
  ...STEP3_PRODUCTS,
  ...STEP4_PRODUCTS,
  ...STEP5_PRODUCTS,
  ...STEP6_PRODUCTS,
  ...STEP7_PRODUCTS,
];

export function productsForPhase(phaseId: number): PlanningProduct[] {
  return PRODUCTS.filter(p => p.phaseId === phaseId);
}
