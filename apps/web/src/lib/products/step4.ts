import { PlanningProduct } from './types';
import { blocks, bullets, classified, h3, kv, orNone, section, table } from './format';

const coaName = (coas: { id: string; designator: string }[], id: string) =>
  coas.find(c => c.id === id)?.designator || id;

export const STEP4_PRODUCTS: PlanningProduct[] = [
  {
    id: 'wargame-record',
    phaseId: 4,
    label: 'Wargame Record',
    doctrineRef: 'JP 5-0, IV-48',
    build: ({ scenario, echelon, coaAnalysis: s, coaDevelopment: d }) =>
      classified(
        scenario,
        echelon,
        'WARGAME RECORD',
        'JP 5-0, IV-48',
        blocks(
          section(
            'Setup',
            blocks(
              kv('Format', s.setup.format),
              kv('Method', s.setup.method.replace(/_/g, ' ')),
              kv('Enemy COAs wargamed', s.setup.enemyCoasToWargame.join(', ').toUpperCase()),
              kv('Turns planned', String(s.setup.turnsPlanned)),
              kv('Level of detail', s.setup.levelOfDetail),
              kv('Facilitator', s.setup.facilitator),
              kv('Opening event', s.setup.startEvent),
              kv('Where', s.setup.startLocation),
              kv('When', s.setup.startTime),
              kv("Commander's wargame guidance", s.setup.commanderWargameGuidance)
            )
          ),
          section(
            'Cells',
            table(
              ['Cell', 'Lead', 'Members'],
              s.cells.map(c => [c.cell.toUpperCase(), c.lead, c.members])
            )
          ),
          section(
            'Critical Events',
            table(
              ['Event', 'Phase', 'Timeframe', 'Linked essential task'],
              s.criticalEvents.map(e => [e.name, e.phase, e.timeframe, e.linkedEssentialTask])
            )
          ),
          section(
            'Turns — Action, Reaction, Counteraction',
            s.turns.length
              ? s.turns
                  .map(t =>
                    blocks(
                      h3(
                        `${coaName(d.coas, t.coaId)} vs ${t.enemyCoaType.toUpperCase()} — Turn ${t.turnNumber}`
                      ),
                      kv(
                        'Critical event',
                        s.criticalEvents.find(e => e.id === t.criticalEventId)?.name
                      ),
                      kv('Action (blue)', t.action),
                      kv('Reaction (red)', t.reaction),
                      kv('Counteraction (blue)', t.counteraction),
                      kv('Adjudication', t.adjudication),
                      kv('Insights', t.insights),
                      kv('Gaps identified', t.identifiedGaps)
                    )
                  )
                  .join('\n\n')
              : ''
          )
        )
      ),
  },
  {
    id: 'sync-matrix',
    phaseId: 4,
    label: 'Synchronization Matrix',
    doctrineRef: 'JP 5-0, IV-49',
    build: ({ scenario, echelon, coaAnalysis: s, coaDevelopment: d }) => {
      const functions = Array.from(new Set(s.syncMatrix.map(m => m.jointFunction)));
      const body = d.coas
        .map(coa => {
          const rows = functions.map(fn => [
            fn,
            ...s.criticalEvents.map(
              ce =>
                s.syncMatrix.find(
                  m => m.coaId === coa.id && m.jointFunction === fn && m.criticalEventId === ce.id
                )?.content || ''
            ),
          ]);
          return blocks(
            h3(`${coa.designator}${coa.name ? ` — ${coa.name}` : ''}`),
            table(
              ['Joint Function', ...s.criticalEvents.map(e => e.name || 'Event')],
              rows.filter(r => r.slice(1).some(Boolean))
            )
          );
        })
        .join('\n\n');
      return classified(
        scenario,
        echelon,
        'SYNCHRONIZATION MATRIX',
        'JP 5-0, IV-49',
        body
      );
    },
  },
  {
    id: 'dst',
    phaseId: 4,
    label: 'Decision Support Template',
    doctrineRef: 'JP 5-0, IV-50',
    build: ({ scenario, echelon, coaAnalysis: s, coaDevelopment: d }) =>
      classified(
        scenario,
        echelon,
        'DECISION SUPPORT TEMPLATE / MATRIX',
        'JP 5-0, IV-50',
        blocks(
          section(
            'Decision Points',
            table(
              ['COA', 'Decision Point', 'Critical Event', 'Latest Time', 'CCIR', 'NAI', 'Friendly Action'],
              s.decisionSupport.map(x => [
                coaName(d.coas, x.coaId),
                x.decisionPoint,
                x.criticalEvent,
                x.latestTimeToDecide,
                x.linkedCcir,
                x.namedAreaOfInterest,
                x.friendlyAction,
              ])
            )
          ),
          section(
            'Refined / New CCIRs',
            table(
              ['COA', 'Type', 'Requirement', 'Decision Point', 'NAI'],
              s.refinedCcirs.map(c => [
                coaName(d.coas, c.coaId),
                c.type,
                c.question,
                c.linkedDecisionPoint,
                c.namedAreaOfInterest,
              ])
            )
          ),
          section(
            'High-Value Targets',
            table(
              ['COA', 'Target', 'Joint Function', 'Why Critical'],
              s.highValueTargets.map(h => [
                coaName(d.coas, h.coaId),
                h.target,
                h.jointFunction,
                h.whyCritical,
              ])
            )
          )
        )
      ),
  },
  {
    id: 'branches-sequels',
    phaseId: 4,
    label: 'Branches & Sequels',
    doctrineRef: 'JP 5-0, IV-44',
    build: ({ scenario, echelon, coaAnalysis: s, coaDevelopment: d }) =>
      classified(
        scenario,
        echelon,
        'BRANCHES AND SEQUELS',
        'JP 5-0, IV-44',
        table(
          ['COA', 'Type', 'Name', 'Trigger', 'Description'],
          s.branchesSequels.map(b => [
            coaName(d.coas, b.coaId),
            b.type.toUpperCase(),
            b.name,
            b.trigger,
            b.description,
          ])
        )
      ),
  },
  {
    id: 'wargame-results',
    phaseId: 4,
    label: 'Strengths, Weaknesses & Risk',
    doctrineRef: 'JP 5-0, IV-50 to IV-51',
    build: ({ scenario, echelon, coaAnalysis: s, coaDevelopment: d }) =>
      classified(
        scenario,
        echelon,
        'WARGAME RESULTS BY COA',
        'JP 5-0, IV-50 to IV-51',
        blocks(
          s.results.length
            ? s.results
                .map(r =>
                  blocks(
                    h3(coaName(d.coas, r.coaId)),
                    kv('Strengths', r.strengths),
                    kv('Weaknesses', r.weaknesses),
                    kv('Advantages', r.advantages),
                    kv('Disadvantages', r.disadvantages),
                    kv('Assessed risk', r.assessedRisk),
                    kv('Risk rationale', r.riskRationale),
                    kv('Recommendation', r.recommendation.toUpperCase())
                  )
                )
                .join('\n\n')
            : '',
          section(
            'Newly Identified Resource Shortfalls',
            table(
              ['COA', 'Directorate', 'Shortfall', 'Impact', 'Sourcing Action'],
              s.shortfalls.map(x => [
                coaName(d.coas, x.coaId),
                x.directorate,
                x.description,
                x.impact,
                x.sourcingAction,
              ])
            )
          ),
          section('Assessment Plan and Criteria', orNone(s.assessmentPlan))
        )
      ),
  },
];
