import { COMBATANT_COMMANDS } from './constants';
import type { CombatantCommand } from './types';

/**
 * Combatant command helpers.
 *
 * The list itself is doctrine; these are the operations the application needs
 * to perform against it — validating a stored value, and recognising a command
 * named inside an uploaded order.
 */

/**
 * Alternate spellings that appear in real orders.
 *
 * Orders routinely drop the US prefix, and USINDOPACOM was USPACOM until 2018,
 * so archived plans and reused templates still say PACOM. Recognising only the
 * canonical key would mean failing to notice a mismatch in exactly the
 * documents most likely to contain one.
 */
const ALIASES: Record<string, CombatantCommand> = {
  AFRICOM: 'USAFRICOM',
  CENTCOM: 'USCENTCOM',
  EUCOM: 'USEUCOM',
  INDOPACOM: 'USINDOPACOM',
  PACOM: 'USINDOPACOM',
  USPACOM: 'USINDOPACOM',
  NORTHCOM: 'USNORTHCOM',
  SOUTHCOM: 'USSOUTHCOM',
  CYBERCOM: 'USCYBERCOM',
  SOCOM: 'USSOCOM',
  SPACECOM: 'USSPACECOM',
  STRATCOM: 'USSTRATCOM',
  TRANSCOM: 'USTRANSCOM',
};

const KEYS = COMBATANT_COMMANDS.map(c => c.key) as readonly CombatantCommand[];

export function isCombatantCommand(value: unknown): value is CombatantCommand {
  return typeof value === 'string' && (KEYS as readonly string[]).includes(value);
}

export function combatantCommand(key: CombatantCommand) {
  return COMBATANT_COMMANDS.find(c => c.key === key);
}

export function combatantCommandLabel(key: CombatantCommand): string {
  return combatantCommand(key)?.label ?? key;
}

/**
 * Every combatant command named anywhere in a block of text.
 *
 * Used to check an uploaded order against the higher headquarters the planner
 * selected. Longest forms are tested first so that USAFRICOM is reported once
 * rather than also matching its own alias.
 */
export function detectCombatantCommands(text: string): CombatantCommand[] {
  if (!text) return [];
  const upper = text.toUpperCase();
  const found = new Set<CombatantCommand>();

  const terms: [string, CombatantCommand][] = [
    ...KEYS.map(k => [k, k] as [string, CombatantCommand]),
    ...Object.entries(ALIASES) as [string, CombatantCommand][],
  ];
  terms.sort((a, b) => b[0].length - a[0].length);

  terms.forEach(([term, key]) => {
    if (new RegExp(`\\b${term}\\b`).test(upper)) found.add(key);
  });

  return Array.from(found);
}

// ---------------------------------------------------------------- echelon ---

import { COMMAND_ECHELONS } from './constants';
import type { EchelonLevel, PlanningEchelon } from './types';

export function echelon(level: EchelonLevel) {
  return COMMAND_ECHELONS.find(e => e.key === level);
}

/**
 * The command chain as a sentence, for prompts and for the interface.
 *
 * One phrasing used everywhere, so what the planner reads on screen and what
 * the model is told cannot drift apart.
 */
export function describeChain(e: PlanningEchelon): string {
  const def = echelon(e.level);
  const kind = e.multinational && e.level !== 'ccmd' ? `combined ${def?.label.toLowerCase()}` : def?.label.toLowerCase();
  return e.level === 'ccmd'
    ? `${e.designation}, a ${def?.label.toLowerCase()}`
    : `${e.designation}, a ${kind} established by ${e.establishedBy}`;
}

/**
 * Headquarters an order is addressed to.
 *
 * Order headers are formulaic — "USINDOPACOM TO COMMANDER, CJTF-SEA" — so this
 * is a pattern match rather than a model call: faster, free, and it cannot
 * hallucinate a headquarters that is not written on the page.
 */
export function detectAddressee(text: string): string | null {
  if (!text) return null;
  const patterns = [
    /\bTO\s*:?\s*(?:COMMANDER\s*,?\s*)?([A-Z0-9][A-Z0-9\-\s]{2,40}?)(?:\n|\/|$)/,
    /\bFOR\s*:?\s*(?:COMMANDER\s*,?\s*)?([A-Z0-9][A-Z0-9\-\s]{2,40}?)(?:\n|\/|$)/,
  ];
  for (const re of patterns) {
    const m = text.toUpperCase().match(re);
    if (m?.[1]) {
      const hit = m[1].trim().replace(/\s+/g, ' ');
      if (hit.length >= 3) return hit;
    }
  }
  return null;
}
