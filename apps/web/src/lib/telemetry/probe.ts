/**
 * The emit sink.
 *
 * Instrumented code across the app — the planning context, the assistant,
 * document ingestion, product export — calls `emit`. Nothing here knows about
 * React, so any module can import it without a dependency cycle.
 *
 * The sink is null unless a trial session is running, which makes `emit` a
 * no-op in ordinary use. Nobody is recorded without having been enrolled.
 */

import { TrialEventKind } from './types';

export type TrialSink = (
  kind: TrialEventKind,
  detail?: Record<string, string | number | boolean>
) => void;

let sink: TrialSink | null = null;

export function setTrialSink(fn: TrialSink | null): void {
  sink = fn;
}

export function isRecording(): boolean {
  return sink !== null;
}

export function emit(
  kind: TrialEventKind,
  detail?: Record<string, string | number | boolean>
): void {
  sink?.(kind, detail);
}

/**
 * Times an assistant call and records how long the planner waited.
 *
 * Inference latency is the tool arm's main cost and has to be reported
 * alongside any time saved — a result that hides a 90-second wait is not a
 * result anyone should act on.
 */
export async function timed<T>(capability: string, run: () => Promise<T>): Promise<T> {
  if (!isRecording()) return run();
  const started = Date.now();
  emit('ai.request', { capability });
  try {
    const out = await run();
    emit('ai.result', { capability, ms: Date.now() - started, ok: true });
    return out;
  } catch (err) {
    emit('ai.result', {
      capability,
      ms: Date.now() - started,
      ok: false,
      error: (err as Error)?.message?.slice(0, 120) ?? 'unknown',
    });
    throw err;
  }
}
