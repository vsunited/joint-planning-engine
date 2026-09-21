'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { setTrialSink, TrialSink } from '@/lib/telemetry/probe';
import {
  archiveSession,
  createSession,
  loadArchive,
  loadLiveSession,
  saveLiveSession,
} from '@/lib/telemetry/session';
import { metricsFor } from '@/lib/telemetry/metrics';
import {
  TrialArm,
  TrialEvent,
  TrialMetrics,
  TrialPacket,
  TrialSession,
} from '@/lib/telemetry/types';

/**
 * Trial session state.
 *
 * The event stream is held in a ref rather than React state. A planner typing
 * into the WARNORD produces an edit every few hundred milliseconds, and
 * re-rendering the whole workspace on each one would slow the tool arm and
 * corrupt the very measurement being taken. Re-renders happen only when
 * something structural changes — a session starting or ending, or a milestone
 * being marked.
 */

interface TrialContextValue {
  session: TrialSession | null;
  archive: TrialSession[];
  metrics: TrialMetrics | null;
  start: (input: {
    participant: string;
    arm: TrialArm;
    packet: TrialPacket;
    order: 1 | 2;
    model?: string;
    visionModel?: string;
  }) => void;
  markMilestone: (id: string) => void;
  hasMilestone: (id: string) => boolean;
  end: (observerNotes: string) => void;
  discard: () => void;
  refreshArchive: () => void;
}

const TrialContext = createContext<TrialContextValue | null>(null);

/** Edits to one field within this window collapse into a single event. */
const EDIT_COALESCE_MS = 1500;
/**
 * How long after the last event the session is written to storage.
 *
 * Trailing rather than periodic: a fixed interval leaves whatever arrived
 * since the last tick sitting only in memory, so a crash mid-run loses it.
 * Debouncing means the log is on disk a second after the planner stops typing,
 * while a burst of keystrokes still costs one write.
 */
const PERSIST_DEBOUNCE_MS = 1000;

export const TrialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionRef = useRef<TrialSession | null>(null);
  const [version, setVersion] = useState(0);
  const [archive, setArchive] = useState<TrialSession[]>([]);

  /** Open edit bursts, keyed by field path. */
  const pending = useRef<Map<string, { firstT: number; len: number; timer: number }>>(new Map());
  const persistTimer = useRef<number | null>(null);

  const bump = useCallback(() => setVersion(v => v + 1), []);

  const now = useCallback((): number => {
    const s = sessionRef.current;
    if (!s) return 0;
    return Date.now() - new Date(s.startedAt).getTime();
  }, []);

  const persistSoon = useCallback(() => {
    if (persistTimer.current !== null) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      persistTimer.current = null;
      if (sessionRef.current) saveLiveSession(sessionRef.current);
    }, PERSIST_DEBOUNCE_MS);
  }, []);

  const append = useCallback(
    (event: TrialEvent, persistNow = false) => {
      const s = sessionRef.current;
      if (!s) return;
      s.events.push(event);
      if (persistNow) {
        if (persistTimer.current !== null) window.clearTimeout(persistTimer.current);
        persistTimer.current = null;
        saveLiveSession(s);
        return;
      }
      persistSoon();
    },
    [persistSoon]
  );

  /** Closes an open edit burst and records it as one event. */
  const flushField = useCallback(
    (path: string) => {
      const entry = pending.current.get(path);
      if (!entry) return;
      window.clearTimeout(entry.timer);
      pending.current.delete(path);
      append({ t: entry.firstT, kind: 'field.edit', detail: { path, len: entry.len } });
    },
    [append]
  );

  const flushAll = useCallback(() => {
    Array.from(pending.current.keys()).forEach(flushField);
  }, [flushField]);

  /* The sink every instrumented module writes into. */
  const sink = useCallback<TrialSink>(
    (kind, detail) => {
      if (!sessionRef.current) return;

      if (kind === 'field.edit' && typeof detail?.path === 'string') {
        const path = detail.path;
        const len = typeof detail.len === 'number' ? detail.len : 0;
        const open = pending.current.get(path);
        if (open) {
          window.clearTimeout(open.timer);
          open.len = len;
          open.timer = window.setTimeout(() => flushField(path), EDIT_COALESCE_MS);
          return;
        }
        pending.current.set(path, {
          firstT: now(),
          len,
          timer: window.setTimeout(() => flushField(path), EDIT_COALESCE_MS),
        });
        return;
      }

      /*
       * Step entries are emitted from a mount effect, and React re-invokes
       * mount effects in development. Collapsing a repeat of the step already
       * open keeps the dwell breakdown honest whichever build the trial is run
       * against, rather than relying on nobody ever pointing it at a dev
       * server.
       */
      if (kind === 'step.enter') {
        const prior = [...sessionRef.current.events]
          .reverse()
          .find(e => e.kind === 'step.enter');
        if (prior && prior.detail?.step === detail?.step) return;
      }

      append({ t: now(), kind, detail });
    },
    [append, flushField, now]
  );

  /*
   * The sink is attached and detached at the moment a session starts and ends,
   * rather than from an effect keyed on a render counter.
   *
   * React runs a child's effects before its parent's. With the sink attached
   * from an effect here, anything a descendant emitted from its own mount
   * effect — the step a planner is starting from, for one — fired while the
   * sink was still null and was lost. Attaching imperatively means the sink is
   * live before the render that reveals the session ever commits.
   *
   * `sink` is a stable callback, so re-registering it is cheap and idempotent.
   */
  const sinkRef = useRef(sink);
  sinkRef.current = sink;

  const attach = useCallback(() => setTrialSink((...a) => sinkRef.current(...a)), []);
  const detach = useCallback(() => setTrialSink(null), []);

  /* Restore an interrupted run. */
  useEffect(() => {
    const live = loadLiveSession();
    if (live && !live.endedAt) {
      sessionRef.current = live;
      attach();
      bump();
    }
    setArchive(loadArchive());
    return () => setTrialSink(null);
  }, [attach, bump]);

  /* A run that ends with the tab closing still keeps everything up to that point. */
  useEffect(() => {
    const save = () => {
      if (sessionRef.current) saveLiveSession(sessionRef.current);
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, []);

  const start = useCallback<TrialContextValue['start']>(
    input => {
      const s = createSession(input);
      sessionRef.current = s;
      saveLiveSession(s);
      attach();
      bump();
    },
    [attach, bump]
  );

  const markMilestone = useCallback(
    (id: string) => {
      if (!sessionRef.current) return;
      flushAll();
      append({ t: now(), kind: 'milestone', detail: { id } }, true);
      bump();
    },
    [append, bump, flushAll, now]
  );

  const hasMilestone = useCallback(
    (id: string) =>
      !!sessionRef.current?.events.some(e => e.kind === 'milestone' && e.detail?.id === id),
    // version is the render trigger; the read itself is from the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const end = useCallback(
    (observerNotes: string) => {
      const s = sessionRef.current;
      if (!s) return;
      flushAll();
      s.events.push({ t: now(), kind: 'session.end' });
      s.endedAt = new Date().toISOString();
      s.observerNotes = observerNotes.trim() || undefined;
      archiveSession(s);
      saveLiveSession(null);
      sessionRef.current = null;
      detach();
      setArchive(loadArchive());
      bump();
    },
    [bump, detach, flushAll, now]
  );

  const discard = useCallback(() => {
    flushAll();
    saveLiveSession(null);
    sessionRef.current = null;
    detach();
    bump();
  }, [bump, detach, flushAll]);

  const refreshArchive = useCallback(() => setArchive(loadArchive()), []);

  const value = useMemo<TrialContextValue>(
    () => ({
      session: sessionRef.current,
      archive,
      metrics: sessionRef.current ? metricsFor(sessionRef.current) : null,
      start,
      markMilestone,
      hasMilestone,
      end,
      discard,
      refreshArchive,
    }),
    // version tracks mutations made through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, archive, start, markMilestone, hasMilestone, end, discard, refreshArchive]
  );

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
};

export function useTrial(): TrialContextValue {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial must be used inside a TrialProvider.');
  return ctx;
}
