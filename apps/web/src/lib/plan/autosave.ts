'use client';

import type { PlanningState } from '@/context/PlanningContext';
import { PlanFile, toPlanFile } from './serialize';

/**
 * Keeps the current plan recoverable across a reload.
 *
 * Distinct from saving a plan file, which is deliberate and portable. This is
 * a safety net: a refresh, a crashed tab or a closed laptop should not cost a
 * staff its morning. It writes to the planner's own browser and never leaves
 * the machine.
 */

const KEY = 'jpe.plan.autosave';

/** Written this long after the planner stops changing anything. */
const DEBOUNCE_MS = 1500;

let timer: number | null = null;

/**
 * Writes the plan, shedding weight if the browser refuses it.
 *
 * Extracted order text is the bulk of a large plan and can exceed the storage
 * quota on its own. Dropping it keeps the staff's actual work recoverable —
 * tasks, mission, COAs — at the cost of needing the source documents
 * re-uploaded. Losing the analysis to save the source material would be the
 * wrong way round.
 */
function write(state: PlanningState): 'full' | 'trimmed' | 'failed' {
  if (typeof window === 'undefined') return 'failed';
  const file = toPlanFile(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(file));
    return 'full';
  } catch {
    try {
      const trimmed: PlanFile = {
        ...file,
        state: {
          ...file.state,
          scenario: {
            ...file.state.scenario,
            uploadedDocuments: file.state.scenario.uploadedDocuments.map(d => ({
              ...d,
              text: '',
              detail: 'Text was too large to keep in recovery storage. Re-upload to use it again.',
            })),
          },
        },
      };
      window.localStorage.setItem(KEY, JSON.stringify(trimmed));
      return 'trimmed';
    } catch {
      /* Storage is full or blocked. Planning continues; recovery does not. */
      return 'failed';
    }
  }
}

export function scheduleAutosave(state: PlanningState): void {
  if (typeof window === 'undefined') return;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    write(state);
  }, DEBOUNCE_MS);
}

/** Writes immediately — used when the tab is closing. */
export function flushAutosave(state: PlanningState): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  write(state);
}

export function loadAutosave(): PlanFile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlanFile) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Nothing useful to do. */
  }
}
