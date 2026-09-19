import { PlanningProduct } from './types';
import { blocks, bullets, classified, kv, orNone, section, table } from './format';

export const STEP2_PRODUCTS: PlanningProduct[] = [
  {
    id: 'restated-mission',
    phaseId: 2,
    label: 'Restated Mission Statement',
    doctrineRef: 'JP 5-0, Ch IV — ma-07',
    build: ({ scenario, missionAnalysis: s }) => {
      const m = s.restatedMission;
      return classified(
        scenario,
        'RESTATED MISSION STATEMENT',
        'JP 5-0, Ch IV — ma-07',
        blocks(
          section('Mission Statement', orNone(m.fullStatement)),
          section(
            'Components',
            blocks(
              kv('WHO', m.who),
              kv('WHAT', m.what),
              kv('WHEN', m.when),
              kv('WHERE', m.where),
              kv('WHY', m.why)
            )
          ),
          section("Commander's Intent", orNone(s.commanderIntent)),
          section("Updated Commander's Guidance", orNone(s.commanderGuidanceUpdate))
        )
      );
    },
  },
  {
    id: 'task-analysis',
    phaseId: 2,
    label: 'Task Analysis',
    doctrineRef: 'JP 5-0, Ch IV — ma-06',
    build: ({ scenario, missionAnalysis: s }) =>
      classified(
        scenario,
        'TASK ANALYSIS',
        'JP 5-0, Ch IV — ma-06',
        blocks(
          section(
            'Specified, Implied and Essential Tasks',
            table(
              ['Task', 'Classification', 'Essential', 'Source', 'Assigned To'],
              s.tasks.map(t => [
                t.description,
                t.classification,
                t.isEssential ? 'YES' : '',
                t.source,
                t.assignedTo,
              ])
            )
          ),
          section(
            'Operational Objectives',
            table(
              ['Objective', 'Desired Effect', 'Undesired Effect'],
              s.objectives.map(o => [o.description, o.desiredEffect, o.undesiredEffect])
            )
          )
        )
      ),
  },
  {
    id: 'facts-assumptions',
    phaseId: 2,
    label: 'Facts & Assumptions',
    doctrineRef: 'JP 5-0, Ch IV — ma-04',
    build: ({ scenario, missionAnalysis: s }) =>
      classified(
        scenario,
        'FACTS AND ASSUMPTIONS',
        'JP 5-0, Ch IV — ma-04',
        blocks(
          section(
            'Known Facts',
            table(
              ['Fact', 'Category', 'Source'],
              s.facts.map(f => [f.description, f.category, f.source])
            )
          ),
          section(
            'Planning Assumptions',
            table(
              ['Assumption', 'Logical', 'Realistic', 'Essential', 'Validated as fact'],
              s.assumptions.map(a => [
                a.description,
                a.isLogical ? 'Y' : 'N',
                a.isRealistic ? 'Y' : 'N',
                a.isEssential ? 'Y' : 'N',
                a.validatedAsFact ? 'Y' : 'N',
              ])
            )
          ),
          section(
            'Risk Assessment',
            table(
              ['Type', 'Hazard', 'Probability', 'Consequence', 'Mitigation', 'Residual'],
              s.risks.map(r => [
                r.type,
                r.hazard,
                r.probability,
                r.consequence,
                r.mitigation,
                r.residualRisk,
              ])
            )
          )
        )
      ),
  },
  {
    id: 'ccirs',
    phaseId: 2,
    label: 'CCIRs & EEFIs',
    doctrineRef: 'JP 5-0, Ch IV — ma-12',
    build: ({ scenario, missionAnalysis: s }) =>
      classified(
        scenario,
        "COMMANDER'S CRITICAL INFORMATION REQUIREMENTS",
        'JP 5-0, Ch IV — ma-12',
        blocks(
          section(
            'CCIRs',
            table(
              ['Type', 'Pri', 'Question', 'Indicator', 'Collection Asset', 'LTIOV', 'Status'],
              s.ccirs.map(c => [
                c.type,
                String(c.priority),
                c.question,
                c.indicator,
                c.collectionAsset,
                c.ltiov,
                c.status,
              ])
            )
          ),
          section(
            'EEFIs',
            table(
              ['Element', 'Protection Measure', 'Status'],
              s.eefis.map(e => [e.description, e.protectionMeasure, e.status])
            )
          )
        )
      ),
  },
  {
    id: 'ma-brief',
    phaseId: 2,
    label: 'Mission Analysis Brief',
    doctrineRef: 'JP 5-0, Figure IV-8',
    build: ({ scenario, missionAnalysis: s }) =>
      classified(
        scenario,
        'MISSION ANALYSIS BRIEFING',
        'JP 5-0, Figure IV-8',
        blocks(
          section(
            'Briefing Sections',
            table(
              ['Section', 'Prepared', 'Presenter'],
              s.briefingSections.map(b => [b.section, b.prepared ? 'YES' : 'NO', b.presenter])
            )
          ),
          section('Restated Mission', orNone(s.restatedMission.fullStatement)),
          section("Commander's Intent", orNone(s.commanderIntent)),
          section(
            'JIPOE Summary',
            blocks(
              kv('Enemy COG', s.jipoe.enemyCOG),
              kv('Friendly COG', s.jipoe.friendlyCOG),
              kv('Enemy MLCOA', s.jipoe.mlcoa),
              kv('Enemy MDCOA', s.jipoe.mdcoa)
            )
          ),
          section(
            'COA Evaluation Criteria (established to prevent post-wargaming bias)',
            bullets(s.coaEvalCriteria.map(c => `${c.name} — ${c.description}`))
          )
        )
      ),
  },
  {
    id: 'staff-estimates',
    phaseId: 2,
    label: 'Staff Estimates & JIPOE',
    doctrineRef: 'JP 5-0, Ch IV — ma-13',
    build: ({ scenario, missionAnalysis: s }) =>
      classified(
        scenario,
        'STAFF ESTIMATES AND JIPOE',
        'JP 5-0, Ch IV — ma-13',
        blocks(
          section(
            'Running Staff Estimates',
            table(
              ['Directorate', 'Status', 'Key Findings', 'Shortfalls', 'Recommendation'],
              s.staffEstimates.map(e => [
                e.directorate,
                e.status,
                e.keyFindings,
                e.shortfalls,
                e.recommendation,
              ])
            )
          ),
          section(
            'JIPOE Progress',
            blocks(
              kv('Step 1 — Define the OE', s.jipoe.step1_defineOE),
              kv('Step 2 — Describe impact', s.jipoe.step2_describeImpact),
              kv('Step 3 — Evaluate the threat', s.jipoe.step3_evaluateThreat),
              kv('Step 4 — Determine threat COAs', s.jipoe.step4_determineThreatCOAs)
            )
          )
        )
      ),
  },
];
