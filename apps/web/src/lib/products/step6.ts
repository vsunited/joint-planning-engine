import { PlanningProduct } from './types';
import { COMMANDER_DECISION_OPTIONS } from '@jpe/shared';
import { blocks, classified, kv, orNone, section, table } from './format';

export const STEP6_PRODUCTS: PlanningProduct[] = [
  {
    id: 'decision-brief',
    phaseId: 6,
    label: 'COA Decision Brief',
    doctrineRef: 'JP 5-0, Figure IV-16',
    build: ({ scenario, coaApproval: s }) =>
      classified(
        scenario,
        'COA DECISION BRIEFING',
        'JP 5-0, Figure IV-16',
        blocks(
          section(
            'Briefing Sections',
            table(
              ['Section', 'Prepared', 'Presenter', 'Notes'],
              s.briefSections.map(b => [b.section, b.prepared ? 'YES' : 'NO', b.presenter, b.notes])
            )
          ),
          section(
            'Attendance',
            table(
              ['Required Attendee', 'Present'],
              Object.entries(s.attendance).map(([k, v]) => [k, v ? 'YES' : 'NO'])
            )
          )
        )
      ),
  },
  {
    id: 'decision-statement',
    phaseId: 6,
    label: 'Decision Statement',
    doctrineRef: 'JP 5-0, IV-56',
    build: ({ scenario, coaApproval: s, coaDevelopment: d }) => {
      const selected = d.coas.filter(c => s.decision.selectedCoaIds.includes(c.id));
      const optLabel =
        COMMANDER_DECISION_OPTIONS.find(o => o.key === s.decision.type)?.label || 'Undecided';
      return classified(
        scenario,
        'COMMANDER’S DECISION STATEMENT',
        'JP 5-0, IV-56',
        blocks(
          kv('Decision', optLabel),
          kv('Selected COA(s)', selected.map(c => c.designator).join(', ')),
          kv('Decision DTG', s.decision.decidedDtg),
          s.decision.type === 'reject_all'
            ? kv('Planning restarts at', s.decision.restartAt.replace('_', ' ').toUpperCase())
            : '',
          s.decision.type === 'defer' ? kv('Consultation required', s.decision.deferConsultation) : '',
          s.decision.type === 'concur_with_mods'
            ? section('Directed Modifications', orNone(s.decision.modifications))
            : '',
          section('Rationale', orNone(s.decision.rationale)),
          section('Decision Statement', orNone(s.decisionStatement.statement)),
          section('Acceptable Risk', orNone(s.decisionStatement.acceptableRisk))
        )
      );
    },
  },
  {
    id: 'commanders-estimate',
    phaseId: 6,
    label: "Commander's Estimate",
    doctrineRef: 'JP 5-0, IV-57',
    build: ({ scenario, coaApproval: s }) =>
      classified(
        scenario,
        "COMMANDER’S ESTIMATE",
        'JP 5-0, IV-57 / CJCSM 3130.03',
        blocks(
          section('Narrative', orNone(s.estimate.narrative)),
          section("Refined Commander's Intent", orNone(s.estimate.refinedIntent)),
          kv(
            'Higher authority approval required',
            s.estimate.higherApprovalRequired
              ? `YES — ${s.estimate.higherApprovalAuthority || 'authority not named'}`
              : 'NO'
          ),
          section('Notes', orNone(s.estimate.notes))
        )
      ),
  },
];
