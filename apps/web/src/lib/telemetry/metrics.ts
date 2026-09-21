'use client';

import { IDLE_THRESHOLD_MS, TrialEvent, TrialMetrics, TrialSession } from './types';

/**
 * Derived measures.
 *
 * Everything is computed from the raw event log rather than accumulated as the
 * session runs, so the published raw data and the published numbers cannot
 * disagree. Anyone re-running this file over the exported JSON gets the same
 * figures.
 */

export function metricsFor(session: TrialSession): TrialMetrics {
  const events = session.events;
  const last = events.length ? events[events.length - 1].t : 0;

  const idleMs = idleTime(events);
  const fields = new Set<string>();
  let editCount = 0;
  let aiInvocations = 0;
  let aiWaitMs = 0;

  events.forEach(e => {
    if (e.kind === 'field.edit') {
      editCount += 1;
      if (typeof e.detail?.path === 'string') fields.add(e.detail.path);
    }
    if (e.kind === 'ai.request') aiInvocations += 1;
    if (e.kind === 'ai.result' && typeof e.detail?.ms === 'number') {
      aiWaitMs += e.detail.ms;
    }
  });

  return {
    wallMs: last,
    activeMs: Math.max(0, last - idleMs),
    idleMs,
    timeToWarnordMs: milestoneAt(events, 'warnord.complete'),
    timeToFirstEditMs: firstOf(events, 'field.edit'),
    editCount,
    distinctFields: fields.size,
    aiInvocations,
    aiWaitMs,
    stepDwellMs: stepDwell(events, last),
  };
}

/** Sum of gaps longer than the idle threshold. */
function idleTime(events: TrialEvent[]): number {
  let idle = 0;
  for (let i = 1; i < events.length; i++) {
    const gap = events[i].t - events[i - 1].t;
    if (gap > IDLE_THRESHOLD_MS) idle += gap;
  }
  return idle;
}

export function milestoneAt(events: TrialEvent[], id: string): number | null {
  const hit = events.find(e => e.kind === 'milestone' && e.detail?.id === id);
  return hit ? hit.t : null;
}

function firstOf(events: TrialEvent[], kind: TrialEvent['kind']): number | null {
  const hit = events.find(e => e.kind === kind);
  return hit ? hit.t : null;
}

/**
 * Time spent with each step open.
 *
 * Only meaningful in the tool arm; the baseline console has no steps. It shows
 * where the time actually went, which matters more than the headline number
 * when deciding what to build next.
 */
function stepDwell(events: TrialEvent[], end: number): Record<number, number> {
  const dwell: Record<number, number> = {};
  let current: number | null = null;
  let since = 0;

  events.forEach(e => {
    if (e.kind !== 'step.enter') return;
    if (current !== null) dwell[current] = (dwell[current] ?? 0) + (e.t - since);
    current = typeof e.detail?.step === 'number' ? e.detail.step : null;
    since = e.t;
  });
  if (current !== null) dwell[current] = (dwell[current] ?? 0) + (end - since);

  return dwell;
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
