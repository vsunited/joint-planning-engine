import { TrialArm, TrialPacket } from './types';

/**
 * Counterbalance assignment.
 *
 * Every participant does both conditions, which is the only design with any
 * power at n=5 — each planner is their own control, so individual differences
 * in experience and speed cancel instead of swamping the effect.
 *
 * Two orders have to be balanced, not one. If everyone did the baseline first,
 * the tool arm would inherit whatever the participant learned from the first
 * run and look faster for the wrong reason. If everyone saw packet A first,
 * any difference between the packets would load onto the arms. Rotating both
 * across four participants balances each, and the fifth repeats the first
 * pattern.
 *
 * Deriving this from the participant number rather than leaving it to the
 * observer removes the most likely clerical error in the whole trial.
 */

export interface ConditionAssignment {
  order: 1 | 2;
  arm: TrialArm;
  packet: TrialPacket;
}

const ROTATION: [ConditionAssignment, ConditionAssignment][] = [
  [
    { order: 1, arm: 'baseline', packet: 'A' },
    { order: 2, arm: 'tool', packet: 'B' },
  ],
  [
    { order: 1, arm: 'tool', packet: 'A' },
    { order: 2, arm: 'baseline', packet: 'B' },
  ],
  [
    { order: 1, arm: 'baseline', packet: 'B' },
    { order: 2, arm: 'tool', packet: 'A' },
  ],
  [
    { order: 1, arm: 'tool', packet: 'B' },
    { order: 2, arm: 'baseline', packet: 'A' },
  ],
];

/** Both conditions for a participant, in the order they should be run. */
export function assignmentFor(participantNumber: number): [ConditionAssignment, ConditionAssignment] {
  const index = (Math.max(1, participantNumber) - 1) % ROTATION.length;
  return ROTATION[index];
}

/** Pulls the number out of a code such as P03. Returns 0 when there isn't one. */
export function participantNumber(code: string): number {
  const digits = code.match(/\d+/);
  return digits ? parseInt(digits[0], 10) : 0;
}
