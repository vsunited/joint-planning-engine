'use client';

import { downloadText } from '@/lib/download';
import { metricsFor } from './metrics';
import { TrialSession } from './types';

/**
 * Export.
 *
 * Two files, because they answer to different readers. The JSON is the raw
 * event log, published alongside any claim so the numbers can be recomputed
 * from source. The CSV is one row per session for the analysis script and for
 * anyone who wants to look at the data in a spreadsheet.
 */

export function exportSessionsJson(sessions: TrialSession[]): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    schema: 'jpe.trial.v1',
    note:
      'Field content is never recorded. field.edit carries the field path and ' +
      'resulting length only.',
    sessions,
  };
  downloadText(
    `jpe-trial-raw-${stamp()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json'
  );
}

const COLUMNS = [
  'participant',
  'arm',
  'packet',
  'order',
  'started_at',
  'wall_s',
  'active_s',
  'idle_s',
  'time_to_warnord_s',
  'time_to_first_edit_s',
  'edit_count',
  'distinct_fields',
  'ai_invocations',
  'ai_wait_s',
  'observer_notes',
] as const;

export function exportSessionsCsv(sessions: TrialSession[]): void {
  const rows = sessions.map(s => {
    const m = metricsFor(s);
    return [
      s.participant,
      s.arm,
      s.packet,
      s.order,
      s.startedAt,
      secs(m.wallMs),
      secs(m.activeMs),
      secs(m.idleMs),
      m.timeToWarnordMs === null ? '' : secs(m.timeToWarnordMs),
      m.timeToFirstEditMs === null ? '' : secs(m.timeToFirstEditMs),
      m.editCount,
      m.distinctFields,
      m.aiInvocations,
      secs(m.aiWaitMs),
      s.observerNotes ?? '',
    ];
  });

  const csv = [COLUMNS.join(','), ...rows.map(r => r.map(cell).join(','))].join('\n');
  downloadText(`jpe-trial-sessions-${stamp()}.csv`, csv, 'text/csv');
}

function secs(ms: number): number {
  return Math.round(ms / 100) / 10;
}

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function stamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}
