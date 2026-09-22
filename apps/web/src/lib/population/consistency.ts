import { detectCombatantCommands, sameHeadquarters } from '@jpe/shared';
import type { PlanningEchelon } from '@jpe/shared';
import type { PlanningState } from '@/context/PlanningContext';

/**
 * Checks that what was drafted is written for the headquarters planning it.
 *
 * Run after population rather than during it. A model given an order written
 * for a command one level up will drift into that command's voice — describing
 * what the theatre will do rather than what this staff will do — and the
 * result reads perfectly well until someone notices the wrong headquarters is
 * executing it.
 *
 * This flags; it does not block. A planner has legitimate reasons to keep a
 * line that mentions another command, and a tool that refuses to accept work
 * is one people stop using.
 */

export interface ConsistencyFlag {
  field: string;
  label: string;
  detail: string;
}

/** Fields whose text should describe this headquarters acting. */
function actorFields(state: PlanningState): { key: string; label: string; value: string }[] {
  const g = state.planningInit.commanderGuidance;
  const w = state.planningInit.warnord;
  const m = state.missionAnalysis.restatedMission;
  return [
    { key: 'problemFraming', label: 'Problem framing', value: g.problemFraming },
    { key: 'operationalApproach', label: 'Operational approach', value: g.operationalApproach },
    { key: 'situation', label: 'WARNORD situation', value: w.situation },
    { key: 'commandRelationships', label: 'Command relationships', value: w.commandRelationships },
    { key: 'restatedMission', label: 'Restated mission', value: m.fullStatement },
  ];
}

export function checkLevelConsistency(
  state: PlanningState,
  echelon: PlanningEchelon
): ConsistencyFlag[] {
  const flags: ConsistencyFlag[] = [];

  const mission = state.missionAnalysis.restatedMission;
  if (mission.who && !sameHeadquarters(mission.who, echelon.designation)) {
    flags.push({
      field: 'restatedMission.who',
      label: 'Restated mission',
      detail: `The mission is written for ${mission.who}, but this staff plans as ${echelon.designation}.`,
    });
  }

  /*
   * Naming the establishing command is normal and expected — it is who tasked
   * us. Naming a *third* command in a field that should describe our own
   * action is the signal worth raising.
   */
  actorFields(state).forEach(f => {
    if (!f.value) return;
    const others = detectCombatantCommands(f.value).filter(c => c !== echelon.establishedBy);
    if (others.length) {
      flags.push({
        field: f.key,
        label: f.label,
        detail: `Mentions ${others.join(' and ')}. Check this describes what ${echelon.designation} does, not what another command does.`,
      });
    }
  });

  const specifiedFromNoDirective =
    state.missionAnalysis.tasks.some(t => t.classification === 'specified') &&
    !state.scenario.uploadedDocuments.some(d => d.role === 'directive');
  if (specifiedFromNoDirective) {
    flags.push({
      field: 'tasks',
      label: 'Task classification',
      detail:
        'Tasks are marked specified, but no uploaded document is set as the directive. A task ' +
        'is specified only when the establishing authority stated it to this headquarters.',
    });
  }

  return flags;
}
