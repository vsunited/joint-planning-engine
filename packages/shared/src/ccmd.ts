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
