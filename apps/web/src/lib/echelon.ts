'use client';

import type { PlanningEchelon } from '@jpe/shared';

/**
 * The planning echelon, persisted per installation.
 *
 * A J5 cell belongs to one headquarters. It does not become a different one
 * between operations, so this is a machine setting alongside the assistant
 * configuration rather than part of any scenario. Set once, locked, and read
 * by every module.
 *
 * Kept out of planning state deliberately: were it per-scenario, two documents
 * open in one session could disagree about what level the staff is planning
 * at, and task classification would follow whichever was touched last.
 */

const STORAGE_KEY = 'jpe.echelon';

/**
 * What a fresh installation assumes until someone says otherwise.
 *
 * Unlocked, so the interface asks for confirmation rather than quietly
 * planning as a headquarters nobody chose.
 */
export const DEFAULT_ECHELON: PlanningEchelon = {
  level: 'jtf',
  designation: 'JTF-Horn of Africa',
  establishedBy: 'USAFRICOM',
  multinational: false,
};

export function loadEchelon(): PlanningEchelon {
  if (typeof window === 'undefined') return { ...DEFAULT_ECHELON };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ECHELON };
    return { ...DEFAULT_ECHELON, ...(JSON.parse(raw) as Partial<PlanningEchelon>) };
  } catch {
    return { ...DEFAULT_ECHELON };
  }
}

export function saveEchelon(value: PlanningEchelon): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* A browser refusing storage should not stop the staff planning. */
  }
}

export function isLocked(e: PlanningEchelon): boolean {
  return !!e.lockedAt;
}

/**
 * What changing the echelon invalidates.
 *
 * Presented before an unlock rather than after, because none of these are
 * cosmetic: a task is specified only relative to the headquarters it was
 * issued to, so re-levelling the staff silently re-classifies work already
 * accepted by a planner.
 */
export const RELEVEL_CONSEQUENCES = [
  'Specified and implied task classification, which is defined relative to this headquarters',
  'The restated mission, whose scope follows the echelon',
  'Who orders are addressed to, and who appears in command relationships',
  'Any staff product already exported, which carries the previous chain',
] as const;
