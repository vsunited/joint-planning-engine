import type { FieldSpec } from '@jpe/ai';
import type { PlanningState } from '@/context/PlanningContext';

/**
 * What the assistant is asked to draft, and where each answer goes.
 *
 * Small groups rather than one request per step. `llama3.1:8b` is reliable
 * over four or five described fields and degrades quickly beyond that — it
 * starts echoing the schema back, or answering the label instead of the
 * question. Chunking also means a failure costs one group rather than a whole
 * worksheet.
 *
 * Nothing here writes to state directly. `apply` returns a patch that the
 * review panel uses only for fields the planner has accepted.
 */

export type FieldValues = Record<string, string | string[]>;

export interface PopulationChunk {
  id: string;
  stepId: number;
  label: string;
  doctrineRef: string;
  fields: FieldSpec[];
  apply: (state: PlanningState, values: FieldValues) => Partial<PlanningState>;
  /** Which of this chunk's fields already hold planner work. */
  occupied: (state: PlanningState) => string[];
}

const text = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v.join('\n') : (v ?? '');
const list = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

let seq = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

export const POPULATION_CHUNKS: PopulationChunk[] = [
  {
    id: 'step1-guidance',
    stepId: 1,
    label: "Commander's initial planning guidance",
    doctrineRef: 'JP 5-0, Ch IV — Planning Initiation',
    fields: [
      {
        key: 'problemFraming',
        label: 'Problem framing',
        kind: 'text',
        guidance:
          'What is going on, why it is a problem, and what the core problem to be solved is. Two or three sentences.',
      },
      {
        key: 'operationalApproach',
        label: 'Operational approach',
        kind: 'text',
        guidance:
          'The broad idea of how this headquarters gets from the current state to the desired end state.',
      },
      {
        key: 'constraints',
        label: 'Constraints',
        kind: 'list',
        guidance:
          'Things this headquarters MUST do, stated in the order. Each one a single sentence.',
      },
      {
        key: 'restraints',
        label: 'Restraints',
        kind: 'list',
        guidance:
          'Things this headquarters MUST NOT do, stated in the order. Each one a single sentence.',
      },
    ],
    occupied: s => {
      const g = s.planningInit.commanderGuidance;
      return [
        g.problemFraming && 'problemFraming',
        g.operationalApproach && 'operationalApproach',
        g.constraints.length && 'constraints',
        g.restraints.length && 'restraints',
      ].filter(Boolean) as string[];
    },
    apply: (s, v) => ({
      planningInit: {
        ...s.planningInit,
        commanderGuidance: {
          ...s.planningInit.commanderGuidance,
          ...('problemFraming' in v ? { problemFraming: text(v.problemFraming) } : {}),
          ...('operationalApproach' in v
            ? { operationalApproach: text(v.operationalApproach) }
            : {}),
          ...('constraints' in v ? { constraints: list(v.constraints) } : {}),
          ...('restraints' in v ? { restraints: list(v.restraints) } : {}),
        },
      },
    }),
  },
  {
    id: 'step1-warnord',
    stepId: 1,
    label: 'Warning order sections',
    doctrineRef: 'JP 5-0, Ch IV — Planning Initiation',
    fields: [
      {
        key: 'situation',
        label: 'Situation',
        kind: 'text',
        guidance: 'The threat, its effect on the operation, and friendly disposition.',
      },
      {
        key: 'commandRelationships',
        label: 'Command relationships',
        kind: 'text',
        guidance:
          'Who is supported, who is supporting, and the coordinating authority. State them for this headquarters.',
      },
      {
        key: 'forcesAllocated',
        label: 'Forces allocated',
        kind: 'text',
        guidance: 'The force elements named in the source, with what each is for.',
      },
    ],
    occupied: s => {
      const w = s.planningInit.warnord;
      return [
        w.situation && 'situation',
        w.commandRelationships && 'commandRelationships',
        w.forcesAllocated && 'forcesAllocated',
      ].filter(Boolean) as string[];
    },
    apply: (s, v) => ({
      planningInit: {
        ...s.planningInit,
        warnord: {
          ...s.planningInit.warnord,
          ...('situation' in v ? { situation: text(v.situation) } : {}),
          ...('commandRelationships' in v
            ? { commandRelationships: text(v.commandRelationships) }
            : {}),
          ...('forcesAllocated' in v ? { forcesAllocated: text(v.forcesAllocated) } : {}),
        },
      },
    }),
  },
  {
    id: 'step2-facts',
    stepId: 2,
    label: 'Facts and assumptions',
    doctrineRef: 'JP 5-0, Ch IV — Mission Analysis',
    fields: [
      {
        key: 'facts',
        label: 'Facts',
        kind: 'list',
        guidance:
          'Statements known to be true, drawn from the source. Not opinions, not assumptions.',
      },
      {
        key: 'assumptions',
        label: 'Assumptions',
        kind: 'list',
        guidance:
          'Suppositions the plan requires but which are not known to be true. Each must be logical, realistic, and necessary for planning to continue.',
      },
    ],
    occupied: s =>
      [
        s.missionAnalysis.facts.length && 'facts',
        s.missionAnalysis.assumptions.length && 'assumptions',
      ].filter(Boolean) as string[],
    apply: (s, v) => ({
      missionAnalysis: {
        ...s.missionAnalysis,
        ...('facts' in v
          ? {
              facts: list(v.facts).map(d => ({
                id: id('fact'),
                description: d,
                source: 'Drafted from the source document',
                category: 'other' as const,
              })),
            }
          : {}),
        ...('assumptions' in v
          ? {
              assumptions: list(v.assumptions).map(d => ({
                id: id('asm'),
                description: d,
                isLogical: false,
                isRealistic: false,
                isEssential: false,
                linkedCcir: '',
                validatedAsFact: false,
              })),
            }
          : {}),
      },
    }),
  },
  {
    id: 'step2-mission',
    stepId: 2,
    label: 'Restated mission',
    doctrineRef: 'JP 5-0, Ch IV — Mission Analysis',
    fields: [
      {
        key: 'what',
        label: 'What (the task)',
        kind: 'text',
        guidance: 'The essential task, as a verb phrase. No unit designation, no purpose.',
      },
      { key: 'when', label: 'When', kind: 'text', guidance: 'The time or trigger for execution.' },
      { key: 'where', label: 'Where', kind: 'text', guidance: 'The operational area.' },
      {
        key: 'why',
        label: 'Why (the purpose)',
        kind: 'text',
        guidance: 'The purpose, usually beginning "in order to".',
      },
    ],
    occupied: s => {
      const m = s.missionAnalysis.restatedMission;
      return [m.what && 'what', m.when && 'when', m.where && 'where', m.why && 'why'].filter(
        Boolean
      ) as string[];
    },
    /*
     * `who` is never asked of the model. It is this headquarters by definition,
     * and the locked echelon already knows it — asking would invite the model
     * to answer with whichever command the source document was written for.
     */
    apply: (s, v) => {
      const m = {
        ...s.missionAnalysis.restatedMission,
        who: s.echelon.designation,
        ...('what' in v ? { what: text(v.what) } : {}),
        ...('when' in v ? { when: text(v.when) } : {}),
        ...('where' in v ? { where: text(v.where) } : {}),
        ...('why' in v ? { why: text(v.why) } : {}),
      };
      return {
        missionAnalysis: {
          ...s.missionAnalysis,
          restatedMission: {
            ...m,
            fullStatement: [m.who, m.what, m.when, m.where, m.why]
              .map(p => (p || '').trim())
              .filter(Boolean)
              .join(' '),
          },
        },
      };
    },
  },
];
