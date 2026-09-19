import { PlanningProduct } from './types';
import { blocks, bullets, classified, kv, orNone, section, table, progress } from './format';

export const STEP1_PRODUCTS: PlanningProduct[] = [
  {
    id: 'warnord',
    phaseId: 1,
    label: 'Warning Order (WARNORD)',
    doctrineRef: 'JP 5-0, Ch IV — Planning Initiation',
    build: ({ scenario, planningInit: s }) => {
      const w = s.warnord;
      return classified(
        scenario,
        'WARNING ORDER',
        'JP 5-0, Ch IV — Planning Initiation',
        blocks(
          section('1. Situation', orNone(w.situation)),
          section('2. Command Relationships', orNone(w.commandRelationships)),
          section('3. Mission', orNone(w.mission)),
          section(
            '4. Operational Limitations',
            blocks(
              '**Constraints (must do)**',
              bullets(w.constraints),
              '**Restraints (cannot do)**',
              bullets(w.restraints)
            )
          ),
          section('5. Forces Allocated', orNone(w.forcesAllocated)),
          section(
            '6. Anticipated Timeline',
            blocks(
              kv('M-Day (mobilization)', w.anticipatedTimeline.mDay),
              kv('C-Day (deployment begins)', w.anticipatedTimeline.cDay),
              kv('D-Day (operations begin)', w.anticipatedTimeline.dDay)
            )
          ),
          section('7. Assumptions', bullets(w.assumptions)),
          section(
            '8. Directed COA Assessment',
            kv(
              'SecDef approval required',
              w.secDefApprovalRequired ? 'YES' : 'NO'
            )
          )
        )
      );
    },
  },
  {
    id: 'planning-guidance',
    phaseId: 1,
    label: "Commander's Initial Planning Guidance",
    doctrineRef: 'JP 5-0, Ch IV',
    build: ({ scenario, planningInit: s }) => {
      const g = s.commanderGuidance;
      return classified(
        scenario,
        "COMMANDER'S INITIAL PLANNING GUIDANCE",
        'JP 5-0, Ch IV',
        blocks(
          section('Problem Framing', orNone(g.problemFraming)),
          section('Operational Approach', orNone(g.operationalApproach)),
          section('Constraints (must do)', bullets(g.constraints)),
          section('Restraints (cannot do)', bullets(g.restraints)),
          section('Coordination Requirements', bullets(g.coordinationRequirements)),
          section('Timeline Guidance', orNone(g.timelineGuidance))
        )
      );
    },
  },
  {
    id: 'planning-org',
    phaseId: 1,
    label: 'Planning Organization & Staff Actions',
    doctrineRef: 'JP 5-0, Ch IV',
    build: ({ scenario, planningInit: s }) => {
      const done = s.staffActions.filter(a => a.completed).length;
      return classified(
        scenario,
        'PLANNING ORGANIZATION AND INITIAL STAFF ACTIONS',
        'JP 5-0, Ch IV',
        blocks(
          section(
            'Planning Organization',
            blocks(
              kv('Type', s.planningOrg.type),
              kv('Lead', s.planningOrg.lead),
              kv('Planning context', s.planningOrg.planningContext),
              table(
                ['Directorate', 'Name', 'Role', 'Status'],
                s.planningOrg.members.map(m => [m.directorate, m.name, m.role, m.status])
              )
            )
          ),
          section(
            `Initial Staff Actions (${progress(done, s.staffActions.length)})`,
            table(
              ['Action', 'Responsible', 'Status'],
              s.staffActions.map(a => [a.label, a.responsible, a.completed ? 'COMPLETE' : 'OPEN'])
            )
          ),
          section('Existing Plans Reviewed', bullets(s.existingPlansReviewed)),
          section('Trigger', blocks(
            kv('Type', s.trigger.type),
            kv('Source', s.trigger.source),
            kv('DTG', s.trigger.dtg),
            kv('Summary', s.trigger.summary)
          ))
        )
      );
    },
  },
  {
    id: 'time-allocation',
    phaseId: 1,
    label: '1/3–2/3 Time Allocation',
    doctrineRef: 'JP 5-0, Ch IV',
    build: ({ scenario, planningInit: s }) => {
      const t = s.timeAllocation;
      return classified(
        scenario,
        'PLANNING TIME ALLOCATION',
        'JP 5-0, Ch IV',
        blocks(
          section(
            'Allocation',
            blocks(
              kv('Total hours to execution', String(t.totalHoursToExecution)),
              kv('Staff allocation (1/3)', String(t.staffAllocation)),
              kv('Subordinate allocation (2/3)', String(t.subordinateAllocation))
            )
          ),
          section(
            'Planning Milestones',
            table(
              ['Milestone', 'Target DTG', 'Status'],
              t.planningMilestones.map(m => [m.name, m.targetDtg, m.status])
            )
          )
        )
      );
    },
  },
];
