import {
  COA_VALIDITY_CRITERIA,
  COA_STATEMENT_QUESTIONS,
  CONOPS_ELEMENTS,
  COA_DISTINGUISHABILITY_FACTORS,
  JOINT_FUNCTIONS,
  combatantCommandLabel,
} from '@jpe/shared';
import { AssistantContext } from './types';

/**
 * Prompt grounding built from the application's encoded doctrine.
 *
 * Nothing here is hand-copied prose. Every rule the model is held to is derived
 * from the same `@jpe/shared` constants that drive the UI's gates, so the
 * model's standard and the tool's standard cannot drift apart. Change the
 * doctrine constant and both the interface and the assistant change with it.
 */

/** The five validity criteria and all of their doctrinal sub-tests. */
export function validityRubric(): string {
  return COA_VALIDITY_CRITERIA.map(c => {
    const tests = c.tests.map((t, i) => `     ${String.fromCharCode(97 + i)}. ${t}`).join('\n');
    return `  ${c.label.toUpperCase()} — ${c.definition}\n${tests}`;
  }).join('\n\n');
}

/** The nine questions every COA statement must answer. */
export function statementQuestions(): string {
  // Keys are presented bare. Numbering them invites the model to copy the
  // numbering into the JSON key itself, e.g. "01. who" instead of "who".
  return COA_STATEMENT_QUESTIONS.map(q => `  "${q.key}" — ${q.question}`).join('\n');
}

/** The thirteen elements of an initial CONOPS. */
export function conopsElements(): string {
  return CONOPS_ELEMENTS.map(e => `  "${e.key}" — ${e.label}`).join('\n');
}

/** The six factors that make COAs distinguishable from one another. */
export function distinguishabilityFactors(): string {
  return COA_DISTINGUISHABILITY_FACTORS.map(f => `  - ${f.label}`).join('\n');
}

/** Task classification rules, per JP 5-0 mission analysis. */
export const TASK_RULES = `  SPECIFIED  — explicitly assigned in the order. Quote or closely paraphrase the tasking language.
  IMPLIED    — not stated, but must be done to accomplish a specified task. Exclude routine or
               inherent military activity; an implied task is one a competent staff would have to
               add to the plan.
  ESSENTIAL  — a specified or implied task the mission cannot succeed without. Essential tasks
               belong in the mission statement. Mark sparingly; most tasks are not essential.`;

/** The seven joint functions, used to frame component tasking. */
export function jointFunctions(): string {
  return JOINT_FUNCTIONS.map(f => `  - ${f}`).join('\n');
}

/**
 * Operational context block. Included in every request so output is situated in
 * the actual operation rather than generic.
 */
export function contextBlock(ctx: AssistantContext): string {
  const lines: string[] = [
    `  Classification of this planning effort: ${ctx.classification}`,
    `  Joint task force: ${ctx.jtfName}`,
    `  Operation: ${ctx.operationName}`,
    `  Higher headquarters: ${ctx.higherHq} (${combatantCommandLabel(ctx.higherHq)})`,
    `  Operational area: ${ctx.aorRegion}`,
  ];
  /*
   * Uploaded orders are reused across commands, and a template that still says
   * USCENTCOM will otherwise lead the model to attribute tasks to whichever
   * command the document names. The established higher headquarters is the one
   * above, not whatever appears in the source text.
   */
  lines.push(
    `  The higher headquarters above is established. If a source document names a` +
      ` different combatant command, keep ${ctx.higherHq} and do not substitute it.`
  );
  if (ctx.missionStatement) lines.push(`  Restated mission: ${ctx.missionStatement}`);
  if (ctx.commandersIntent) lines.push(`  Commander's intent: ${ctx.commandersIntent}`);
  if (ctx.enemyCog) lines.push(`  Enemy centre of gravity: ${ctx.enemyCog}`);
  if (ctx.enemyMlcoa) lines.push(`  Enemy most likely COA: ${ctx.enemyMlcoa}`);
  if (ctx.enemyMdcoa) lines.push(`  Enemy most dangerous COA: ${ctx.enemyMdcoa}`);
  if (ctx.essentialTasks?.length) {
    lines.push(`  Essential tasks (common to all COAs):`);
    ctx.essentialTasks.forEach(t => lines.push(`    - ${t}`));
  }
  if (ctx.existingCoaSummaries?.length) {
    lines.push(`  COAs already developed (a new COA must be distinguishable from these):`);
    ctx.existingCoaSummaries.forEach(c => lines.push(`    - ${c}`));
  }
  return lines.join('\n');
}

/**
 * Shared behavioural rules. The assistant drafts and critiques; it never
 * decides. Staff recommend, commanders decide.
 */
export const ROLE_PREAMBLE = `You are assisting a joint staff planner executing the Joint Planning Process.

Hard rules:
  - You produce staff work for a human planner to review. You never decide.
  - Do not invent unit designations, dates or capabilities that are not given
    to you. Where something is genuinely unknown, say so in that field.
  - Respond with a single JSON object and nothing else. No prose before or
    after, no markdown code fences.`;
