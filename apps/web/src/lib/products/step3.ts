import { PlanningProduct } from './types';
import { blocks, bullets, classified, h3, kv, orNone, section, table } from './format';

export const STEP3_PRODUCTS: PlanningProduct[] = [
  {
    id: 'coa-statements',
    phaseId: 3,
    label: 'COA Statements & Sketches',
    doctrineRef: 'JP 5-0, IV-37',
    build: ({ scenario, coaDevelopment: s }) =>
      classified(
        scenario,
        'COURSE OF ACTION STATEMENTS',
        'JP 5-0, IV-37',
        s.coas.length
          ? s.coas
              .map(c =>
                blocks(
                  h3(`${c.designator}${c.name ? ` — ${c.name}` : ''}`),
                  kv('WHO', c.statement.who),
                  kv('WHAT', c.statement.what),
                  kv('WHERE', c.statement.where),
                  kv('WHEN', c.statement.when),
                  kv('Decision points', c.statement.decisionPoints),
                  kv('HOW (operational direction)', c.statement.how),
                  kv('WHY (purpose)', c.statement.why),
                  kv('Assessment of accomplishment', c.statement.assessment),
                  kv('Initial intelligence support concept', c.statement.intelConcept),
                  '',
                  kv('Concept narrative', c.narrative),
                  kv('Sketch notes', c.sketchNotes)
                )
              )
              .join('\n\n---\n\n')
          : ''
      ),
  },
  {
    id: 'coa-conops',
    phaseId: 3,
    label: 'Initial CONOPS (13 elements)',
    doctrineRef: 'JP 5-0, IV-30',
    build: ({ scenario, coaDevelopment: s }) =>
      classified(
        scenario,
        'INITIAL CONCEPT OF OPERATIONS',
        'JP 5-0, IV-30',
        s.coas.length
          ? s.coas
              .map(c =>
                blocks(
                  h3(`${c.designator}${c.name ? ` — ${c.name}` : ''}`),
                  kv('01 Operational area', c.conops.operationalArea),
                  kv('02 Objectives', c.conops.objectives),
                  kv('03 Essential tasks and purpose', c.conops.essentialTasks),
                  kv('04 Forces and capabilities required', c.conops.forcesCapabilities),
                  kv('05 Integrated timeline', c.conops.integratedTimeline),
                  kv('06 Task organization', c.conops.taskOrganization),
                  kv('07 Operational concept', c.conops.operationalConcept),
                  kv('08 Sustainment concept', c.conops.sustainmentConcept),
                  kv('09 Communication synchronization', c.conops.commSync),
                  kv('10 Risk', c.conops.risk),
                  kv('11 Required decisions and decision timeline', c.conops.requiredDecisions),
                  kv('12 Deployment concept', c.conops.deploymentConcept),
                  kv('13 Main and supporting efforts', c.conops.mainSupportingEfforts),
                  '',
                  table(
                    ['Command', 'Relationship', 'Forces', 'Phase'],
                    c.taskOrg.map(t => [t.component, t.commandRelationship, t.forcesAssigned, t.phase])
                  )
                )
              )
              .join('\n\n---\n\n')
          : ''
      ),
  },
  {
    id: 'coa-validity',
    phaseId: 3,
    label: 'COA Validity Test Results',
    doctrineRef: 'JP 5-0, IV-37 to IV-39',
    build: ({ scenario, coaDevelopment: s }) =>
      classified(
        scenario,
        'COA VALIDITY TEST',
        'JP 5-0, IV-37 to IV-39',
        blocks(
          'All COAs selected for analysis must be suitable, feasible, acceptable, distinguishable and complete. Reject any COA failing all five.',
          table(
            ['COA', 'Suitable', 'Feasible', 'Acceptable', 'Distinguishable', 'Complete', 'Disposition'],
            s.coas.map(c => [
              c.designator,
              c.validity.suitable.status,
              c.validity.feasible.status,
              c.validity.acceptable.status,
              c.validity.distinguishable.status,
              c.validity.complete.status,
              c.jfcDisposition,
            ])
          ),
          section(
            'Distinguishability',
            table(
              ['COA', 'Main effort', 'Scheme', 'Sequencing', 'Mechanism', 'Task org', 'Reserves'],
              s.coas.map(c => [
                c.designator,
                c.distinguishability.mainEffort,
                c.distinguishability.scheme,
                c.distinguishability.sequencing,
                c.distinguishability.mechanism,
                c.distinguishability.taskOrg,
                c.distinguishability.reserves,
              ])
            )
          )
        )
      ),
  },
  {
    id: 'coa-dev-brief',
    phaseId: 3,
    label: 'COA Development Brief',
    doctrineRef: 'JP 5-0, Figure IV-11',
    build: ({ scenario, coaDevelopment: s }) =>
      classified(
        scenario,
        'COA DEVELOPMENT BRIEFING',
        'JP 5-0, Figure IV-11',
        blocks(
          section(
            'Briefing Sections',
            table(
              ['Section', 'Owner', 'Prepared', 'Presenter'],
              s.briefSections.map(b => [b.section, b.owner, b.prepared ? 'YES' : 'NO', b.presenter])
            )
          ),
          section(
            'Centre of Gravity Analysis',
            blocks(
              kv('Enemy COG', s.cog.enemyCog),
              kv('Enemy critical capabilities', s.cog.enemyCriticalCapabilities),
              kv('Enemy critical requirements', s.cog.enemyCriticalRequirements),
              kv('Enemy critical vulnerabilities', s.cog.enemyCriticalVulnerabilities),
              kv('Friendly COG', s.cog.friendlyCog),
              kv('Friendly critical vulnerabilities', s.cog.friendlyCriticalVulnerabilities),
              kv('Protection priorities', s.cog.protectionPriorities),
              kv('Decisive points', s.cog.decisivePoints)
            )
          ),
          section(
            'Operation Milestones',
            blocks(
              kv('C-Day', s.milestones.cDay),
              kv('D-Day', s.milestones.dDay),
              kv('H-Hour', s.milestones.hHour),
              kv('L-Hour', s.milestones.lHour),
              kv('M-Day', s.milestones.mDay),
              kv('N-Day', s.milestones.nDay)
            )
          ),
          section(
            "JFC Guidance",
            blocks(
              kv('Development technique', s.technique),
              kv('Operational area', s.operationalArea),
              kv(
                'COAs approved for further analysis',
                s.coas
                  .filter(c => s.jfcGuidance.approvedCoaIds.includes(c.id))
                  .map(c => c.designator)
                  .join(', ')
              ),
              kv('Enemy COA priority for wargaming', s.jfcGuidance.wargamePriorityEnemyCoa),
              kv('Directed revisions', s.jfcGuidance.revisionDirection),
              kv('Additional guidance', s.jfcGuidance.additionalGuidance)
            )
          ),
          section(
            'Staff Supportability by COA',
            table(
              ['Directorate', ...s.coas.map(c => c.designator)],
              Array.from(new Set(s.supportability.map(x => x.directorate))).map(dir => [
                dir,
                ...s.coas.map(
                  c =>
                    s.supportability.find(x => x.directorate === dir && x.coaId === c.id)
                      ?.supportable || 'not_assessed'
                ),
              ])
            )
          )
        )
      ),
  },
];
