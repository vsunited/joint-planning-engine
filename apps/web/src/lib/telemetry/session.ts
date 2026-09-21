'use client';

import { TrialArm, TrialPacket, TrialSession } from './types';

/**
 * Session persistence.
 *
 * localStorage, because a trial run must survive an accidental reload or a
 * browser crash mid-session. Losing a participant's run means losing a
 * participant — there are only five of them.
 *
 * Completed sessions move to an archive key so several runs accumulate on one
 * machine and export together.
 */

const LIVE_KEY = 'jpe.trial.live';
const ARCHIVE_KEY = 'jpe.trial.archive';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* A full or blocked store must not take the trial down mid-run. */
  }
}

export function loadLiveSession(): TrialSession | null {
  return read<TrialSession | null>(LIVE_KEY, null);
}

export function saveLiveSession(session: TrialSession | null): void {
  if (!session) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(LIVE_KEY);
    return;
  }
  write(LIVE_KEY, session);
}

export function loadArchive(): TrialSession[] {
  return read<TrialSession[]>(ARCHIVE_KEY, []);
}

export function archiveSession(session: TrialSession): void {
  const all = loadArchive();
  write(ARCHIVE_KEY, [...all.filter(s => s.id !== session.id), session]);
}

export function clearArchive(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(ARCHIVE_KEY);
}

export function createSession(input: {
  participant: string;
  arm: TrialArm;
  packet: TrialPacket;
  order: 1 | 2;
  model?: string;
  visionModel?: string;
}): TrialSession {
  return {
    id: `${input.participant}-${input.arm}-${Date.now().toString(36)}`,
    participant: input.participant.trim().toUpperCase(),
    arm: input.arm,
    packet: input.packet,
    order: input.order,
    startedAt: new Date().toISOString(),
    events: [{ t: 0, kind: 'session.start', detail: { arm: input.arm, packet: input.packet } }],
    meta: {
      model: input.model,
      visionModel: input.visionModel,
      userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
    },
  };
}
