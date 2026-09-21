'use client';

import {
  OpenAiCompatibleAssistant,
  AssistantConfig,
  DEFAULT_ASSISTANT_CONFIG,
} from '@jpe/ai';
import { timed } from '@/lib/telemetry/probe';

/**
 * Assistant singleton and its persisted configuration.
 *
 * Inference is local by design — planning data is CUI and cannot leave the
 * network. Endpoint and model are per-machine settings, so they live in
 * localStorage rather than planning state.
 */

const STORAGE_KEY = 'jpe.assistant.config';

/**
 * Recommended model, chosen from measured behaviour rather than size alone.
 *
 * Two things ruled out the obvious cheaper choices on an M1:
 *
 *  - Reasoning models (qwen3 and similar) emit long hidden chains before
 *    answering — 800+ tokens and ~51s for a trivial reply.
 *  - 3B-class models are unstable on extraction. Three identical runs of the
 *    same order with llama3.2:3b returned 4, 8 and 1 tasks, once including a
 *    situation statement as a task. llama3.1:8b returned 6, 5, 5 across the
 *    same three runs, at 30-43s each.
 *
 * Stability matters more than latency here: a planner cannot trust a task list
 * that changes every time it is generated.
 */
export const RECOMMENDED_MODEL = 'llama3.1:8b';

export function loadAssistantConfig(): AssistantConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_ASSISTANT_CONFIG };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ASSISTANT_CONFIG };
    return { ...DEFAULT_ASSISTANT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ASSISTANT_CONFIG };
  }
}

export function saveAssistantConfig(config: AssistantConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // A browser refusing storage is not worth failing the operation over.
  }
  assistant.setConfig(config);
}

/**
 * The assistant, with its capability calls timed.
 *
 * Inference latency is the tool arm's main cost in a measured trial, and it
 * has to be reported next to any time saved — a result that quietly omits a
 * ninety-second wait is not a result worth submitting. Outside a trial the
 * wrapper is a straight pass-through.
 */
function instrument(inner: OpenAiCompatibleAssistant): OpenAiCompatibleAssistant {
  const capabilities = ['extractTasks', 'draftCoa', 'critiqueCoa', 'transcribeImages'] as const;

  capabilities.forEach(name => {
    const original = inner[name].bind(inner) as (...args: unknown[]) => Promise<unknown>;
    (inner as unknown as Record<string, unknown>)[name] = (...args: unknown[]) =>
      timed(name, () => original(...args));
  });

  return inner;
}

export const assistant = instrument(
  new OpenAiCompatibleAssistant(typeof window === 'undefined' ? {} : loadAssistantConfig())
);
