/**
 * Trial telemetry — types.
 *
 * Instrumentation for a measured trial: how long a planner takes to produce a
 * releasable initial WARNORD with the tool versus without it. These numbers
 * are the only original performance data the product has, so the collection
 * has to survive an evaluator reading it closely.
 *
 * Two constraints shape everything in this module:
 *
 *   - Nothing leaves the machine. There is no analytics endpoint and no
 *     network call anywhere here. Sessions live in localStorage and are
 *     exported to a file by hand.
 *   - No field content is ever recorded. An edit logs the field's *path* and
 *     the resulting *length* — never what was typed. Planning data is CUI, so
 *     a log that captured content would itself be CUI, which would make the
 *     trial data unreleasable and the whole exercise pointless.
 */

export type TrialArm = 'baseline' | 'tool';
export type TrialPacket = 'A' | 'B';

export type TrialEventKind =
  | 'session.start'
  | 'session.end'
  | 'milestone'
  | 'step.enter'
  | 'field.edit'
  | 'ai.request'
  | 'ai.result'
  | 'doc.ingest'
  | 'product.export'
  | 'packet.view'
  | 'note';

export interface TrialEvent {
  /** Milliseconds since session start. */
  t: number;
  kind: TrialEventKind;
  detail?: Record<string, string | number | boolean>;
}

/**
 * The milestones that bound the primary measure.
 *
 * Both arms use the same three, pressed by the same person under the same
 * instruction. The tool arm could stop itself automatically once all eight
 * WARNORD sections hold text, but the baseline arm has no equivalent signal —
 * an automatic stop on one side and a button on the other would measure the
 * difference between a clock and a human, not between the two methods.
 */
export const TRIAL_MILESTONES = [
  {
    id: 'packet.opened',
    label: 'Packet opened',
    hint: 'Participant begins reading the directive. Starts the clock.',
  },
  {
    id: 'drafting.started',
    label: 'Drafting started',
    hint: 'First words committed to the product, in either method.',
  },
  {
    id: 'warnord.complete',
    label: 'WARNORD complete',
    hint: 'Participant judges the order releasable. Primary stop event.',
  },
] as const;

export type TrialMilestoneId = (typeof TRIAL_MILESTONES)[number]['id'];

export interface TrialSession {
  id: string;
  /** Participant code such as P03. Never a name — see the protocol on PII. */
  participant: string;
  arm: TrialArm;
  packet: TrialPacket;
  /** 1 if this was the participant's first condition, 2 if the second. */
  order: 1 | 2;
  startedAt: string;
  endedAt?: string;
  events: TrialEvent[];
  /** Observer notes, entered when the session is closed out. */
  observerNotes?: string;
  meta: {
    model?: string;
    visionModel?: string;
    userAgent: string;
  };
}

/** Derived numbers. Computed from the event log on demand, never stored. */
export interface TrialMetrics {
  wallMs: number;
  activeMs: number;
  idleMs: number;
  timeToWarnordMs: number | null;
  timeToFirstEditMs: number | null;
  editCount: number;
  distinctFields: number;
  aiInvocations: number;
  aiWaitMs: number;
  stepDwellMs: Record<number, number>;
}

/**
 * A pause longer than this counts as the planner being away rather than
 * working. Staff work is interrupted constantly, and wall time alone would
 * measure the interruptions rather than the method. Both arms get the same
 * threshold, and both wall and active time are reported so the choice is
 * visible rather than buried.
 */
export const IDLE_THRESHOLD_MS = 120_000;
