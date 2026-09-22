import { COMBATANT_COMMANDS } from './constants';
import type { CombatantCommand, EchelonLevel, PlanningEchelon } from './types';
import { detectCombatantCommands } from './ccmd';

/**
 * Reading the header of a higher headquarters order.
 *
 * Who issued an order and who it was addressed to is what decides whether the
 * document tasks this staff or merely informs it, and a task is specified only
 * when the establishing authority stated it to this headquarters. Getting that
 * from the page rather than from the planner's memory is the whole point.
 *
 * Deliberately a pattern match rather than a model call. Order headers are
 * formulaic, the answer is two proper nouns, and a language model asked for
 * them will occasionally produce a plausible headquarters that is not written
 * anywhere in the document. This cannot.
 */

export interface OrderHeader {
  issuer: CombatantCommand | null;
  addressee: string | null;
  /** The line this was read from, shown to the planner as evidence. */
  evidence: string | null;
}

const TO_PATTERNS = [
  /\bTO\s*:?\s*(?:COMMANDER\s*,?\s*)?([A-Z0-9][A-Z0-9\-\s]{2,40}?)(?:\s*\n|\s*\/|$)/,
  /\bFOR\s*:?\s*(?:COMMANDER\s*,?\s*)?([A-Z0-9][A-Z0-9\-\s]{2,40}?)(?:\s*\n|\s*\/|$)/,
];

/**
 * Only the opening of a document is searched.
 *
 * An order names other commands throughout — adjacent units, supporting
 * commands, coordination instructions. The header is the part that says who
 * this one is from and to, so looking further would find the wrong answer with
 * the same confidence.
 */
const HEADER_CHARS = 600;

export function parseOrderHeader(text: string): OrderHeader {
  if (!text) return { issuer: null, addressee: null, evidence: null };

  const head = text.slice(0, HEADER_CHARS);
  const upper = head.toUpperCase();

  let addressee: string | null = null;
  let evidence: string | null = null;
  let toIndex = -1;

  for (const re of TO_PATTERNS) {
    const m = upper.match(re);
    if (m?.[1] && m.index !== undefined) {
      addressee = m[1].trim().replace(/\s+/g, ' ');
      toIndex = m.index;
      const lineStart = head.lastIndexOf('\n', m.index) + 1;
      const lineEnd = head.indexOf('\n', m.index);
      evidence = head.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
      break;
    }
  }

  /*
   * The issuer is the command named before the addressee. Taking the first
   * command in the document instead would pick the addressee's own higher
   * command out of a line like "USINDOPACOM TO COMMANDER, CJTF-SEA" only by
   * luck, and would pick wrongly whenever the header is laid out FROM/TO.
   */
  const searchRegion = toIndex > 0 ? upper.slice(0, toIndex) : upper;
  const before = detectCombatantCommands(searchRegion);
  const issuer = before.length ? before[before.length - 1] : detectCombatantCommands(upper)[0] ?? null;

  return { issuer, addressee, evidence };
}

/** What role a document plays for the staff reading it. */
export type DocumentRole = 'directive' | 'reference' | 'unknown';

/**
 * A headquarters designation, normalised for comparison.
 *
 * "CJTF-SEA", "CJTF SEA" and "cjtf-sea" are the same headquarters written
 * three ways, and a planner should not get a mismatch warning over a hyphen.
 */
export function normaliseDesignation(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function sameHeadquarters(a: string, b: string): boolean {
  return !!a && !!b && normaliseDesignation(a) === normaliseDesignation(b);
}

/**
 * The echelon a directive implies for the headquarters it is addressed to.
 *
 * A proposal, never an answer. The planner confirms it, which is why
 * `evidence` travels with it.
 */
export interface EchelonProposal {
  echelon: PlanningEchelon;
  evidence: string | null;
  /** True when both the issuer and the addressee were found. */
  confident: boolean;
}

export function proposeEchelon(header: OrderHeader): EchelonProposal | null {
  if (!header.addressee) return null;

  const designation = header.addressee;
  const asCommand = COMBATANT_COMMANDS.find(c => sameHeadquarters(c.key, designation));

  /*
   * The C in CJTF means combined, and a headquarters that writes itself that
   * way is telling us it is multinational. Anything else is left alone for the
   * planner to set, because absence of the letter proves nothing.
   */
  const multinational = /^C(?:JTF|TF)\b|^COMBINED/i.test(designation.trim());

  let level: EchelonLevel = 'jtf';
  if (asCommand) level = 'ccmd';
  else if (/\bCOMPONENT\b|^JF[ALMS]CC\b/i.test(designation)) level = 'component';

  return {
    echelon: {
      level,
      designation,
      establishedBy: (asCommand?.key ?? header.issuer ?? 'USINDOPACOM') as CombatantCommand,
      multinational,
    },
    evidence: header.evidence,
    confident: !!header.issuer && !!header.addressee,
  };
}
