'use client';

import type { ExtractedTask } from '@jpe/ai';
import type { MissionTask } from '@/types/planning';

/**
 * Comparing a fragmentary order against the plan it modifies.
 *
 * A directive does not arrive once. It arrives, a FRAGORD changes it, then
 * another does. Working out what actually changed is done by hand today —
 * two orders side by side, under time pressure, hoping nothing is missed.
 *
 * Extraction uses the assistant, which has proved reliable at pulling tasks
 * and coordinating instructions out of an order. The comparison itself is
 * deliberately deterministic: a planner asking "what changed?" needs an answer
 * that is the same every time and cannot invent a change that is not in the
 * document. A model asked to diff two orders will occasionally produce a
 * plausible difference that exists in neither.
 */

/*
 * Words carrying no distinguishing weight in a tasking. Removing them stops
 * two unrelated tasks scoring as similar merely because both are written in
 * military English.
 */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'at',
  'by', 'from', 'as', 'is', 'are', 'be', 'will', 'shall', 'must', 'that',
  'this', 'all', 'any', 'its', 'their', 'conduct', 'provide', 'ensure',
]);

function tokens(text: string): Set<string> {
  return new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
  );
}

/** Jaccard overlap of significant words, 0 to 1. */
export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  ta.forEach(t => {
    if (tb.has(t)) shared += 1;
  });
  return shared / (ta.size + tb.size - shared);
}

/**
 * Above this, two tasks are the same tasking.
 *
 * Orders restate tasks in slightly different words between editions, so an
 * exact match would report every carried-forward task as both removed and
 * added — which is the opposite of useful.
 *
 * Set high deliberately. A rewording that scores in the seventies is still a
 * rewording, and a changed verb can change what a tasking actually requires —
 * "neutralise" is not "destroy". Reporting those as reworded puts them in
 * front of the planner; calling them unchanged hides them.
 */
const SAME = 0.8;
/** Between this and SAME, the same tasking appears to have been reworded. */
const REWORDED = 0.45;

export type TaskChangeKind = 'added' | 'removed' | 'reworded' | 'unchanged';

export interface TaskChange {
  kind: TaskChangeKind;
  /** From the fragmentary order. */
  incoming?: ExtractedTask;
  /** Already in the plan. */
  existing?: MissionTask;
  similarity?: number;
}

export function diffTasks(existing: MissionTask[], incoming: ExtractedTask[]): TaskChange[] {
  const changes: TaskChange[] = [];
  const matched = new Set<string>();

  incoming.forEach(inc => {
    let bestTask: MissionTask | null = null;
    let bestScore = 0;
    for (const ex of existing) {
      if (matched.has(ex.id)) continue;
      const score = similarity(inc.description, ex.description);
      if (score > bestScore) {
        bestScore = score;
        bestTask = ex;
      }
    }

    if (bestTask && bestScore >= SAME) {
      matched.add(bestTask.id);
      changes.push({ kind: 'unchanged', incoming: inc, existing: bestTask, similarity: bestScore });
    } else if (bestTask && bestScore >= REWORDED) {
      matched.add(bestTask.id);
      changes.push({ kind: 'reworded', incoming: inc, existing: bestTask, similarity: bestScore });
    } else {
      changes.push({ kind: 'added', incoming: inc });
    }
  });

  /*
   * A task in the plan that the new order does not mention is reported, not
   * deleted. A fragmentary order often restates only what it is changing, so
   * absence is a question for the planner rather than an instruction to the
   * application.
   */
  existing.forEach(ex => {
    if (!matched.has(ex.id)) changes.push({ kind: 'removed', existing: ex });
  });

  return changes;
}

export interface ListChange {
  added: string[];
  removed: string[];
  kept: string[];
}

export function diffList(before: string[], after: string[]): ListChange {
  const used = new Set<number>();
  const kept: string[] = [];
  const added: string[] = [];

  after.forEach(a => {
    const idx = before.findIndex((b, i) => !used.has(i) && similarity(a, b) >= SAME);
    if (idx >= 0) {
      used.add(idx);
      kept.push(a);
    } else {
      added.push(a);
    }
  });

  return { added, removed: before.filter((_, i) => !used.has(i)), kept };
}

export interface DateChange {
  label: string;
  before: string | null;
  after: string | null;
}

/**
 * Named planning dates, read from the order's own wording.
 *
 * Deliberately narrow: the named days a plan hangs on, plus explicit NLT
 * statements. Pulling every date-like string out of an order would bury the
 * two that moved.
 */
export function extractKeyDates(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!text) return out;

  const named = /\b([MCDLS]\s?-\s?Day)\b\s*(?:is|:)?\s*([0-9]{1,2}\s+[A-Z]{3}\s+[0-9]{2,4}|[0-9]{6}Z\s+[A-Z]{3}\s+[0-9]{2})/gi;
  let m: RegExpExecArray | null;
  while ((m = named.exec(text)) !== null) {
    out[m[1].toUpperCase().replace(/\s/g, '')] = m[2].trim();
  }

  /*
   * NLT dates are deliberately not compared.
   *
   * An order carries several — a mission completion date, a constraint's start
   * date, a reporting deadline — and nothing in the text identifies which is
   * which. Matching "the first NLT in each document" compared a mission date
   * in one order against a constraint in another and reported a change that
   * had not happened. A false change is worse than a missed one: it sends a
   * planner to re-check a timeline that never moved, and it costs them trust
   * in every other line on this screen.
   *
   * Named days carry their own identity and are compared instead.
   */

  return out;
}

export function diffDates(beforeText: string, afterText: string): DateChange[] {
  const before = extractKeyDates(beforeText);
  const after = extractKeyDates(afterText);
  const labels = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return labels
    .map(label => ({ label, before: before[label] ?? null, after: after[label] ?? null }))
    .filter(d => d.after !== null && d.before !== d.after);
}

export interface FragordDiff {
  tasks: TaskChange[];
  constraints: ListChange;
  restraints: ListChange;
  dates: DateChange[];
  impacts: string[];
}

/**
 * What the change means for work already done.
 *
 * The counts tell a planner what moved; these say why it matters. Both are
 * derived from the comparison rather than asked of a model, so they cannot
 * assert an effect the diff does not support.
 */
export function deriveImpacts(
  diff: Omit<FragordDiff, 'impacts'>,
  missionStatement: string
): string[] {
  const impacts: string[] = [];

  const removedEssential = diff.tasks.filter(t => t.kind === 'removed' && t.existing?.isEssential);
  if (removedEssential.length) {
    impacts.push(
      `${removedEssential.length} essential task${removedEssential.length > 1 ? 's are' : ' is'} ` +
        'not restated in this order. An essential task drives the mission statement — confirm it ' +
        'still applies before relying on the restated mission.'
    );
  }

  const addedEssential = diff.tasks.filter(t => t.kind === 'added' && t.incoming?.isEssential);
  if (addedEssential.length && missionStatement.trim()) {
    impacts.push(
      `${addedEssential.length} new essential task${addedEssential.length > 1 ? 's' : ''} ` +
        'arrived after the mission was restated. The restated mission may no longer cover the ' +
        'whole task.'
    );
  }

  if (diff.dates.length) {
    impacts.push(
      `${diff.dates.length} key date${diff.dates.length > 1 ? 's have' : ' has'} moved. Time ` +
        'allocation and any milestone built on them need rechecking.'
    );
  }

  if (diff.restraints.added.length) {
    impacts.push(
      `${diff.restraints.added.length} new restraint${diff.restraints.added.length > 1 ? 's' : ''} ` +
        'may invalidate a course of action that was previously acceptable.'
    );
  }

  return impacts;
}
