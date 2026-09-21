import { PlanningProduct } from './types';
import { CONOPS_REQUIREMENTS, PLAN_DEVELOPMENT_ACTIVITIES, PLAN_REVIEW_CRITERIA, IPR_CONFIRMATION_ITEMS } from '@jpe/shared';
import { blocks, classified, kv, orNone, section, table } from './format';
import { RefinedConops } from '@/types/planning';

export const STEP7_PRODUCTS: PlanningProduct[] = [
  {
    id: 'conops',
    phaseId: 7,
    label: 'Refined CONOPS',
    doctrineRef: 'JP 5-0, IV-58',
    build: ({ scenario, planOrderDevelopment: s, coaApproval: a, coaDevelopment: d }) => {
      const approved = d.coas.filter(c => a.decision.selectedCoaIds.includes(c.id));
      return classified(
        scenario,
        'CONCEPT OF OPERATIONS',
        'JP 5-0, IV-58',
        blocks(
          kv('Expands approved COA', approved.map(c => c.designator).join(', ')),
          kv('Outlined as a campaign', s.conops.isCampaign ? 'YES' : 'NO'),
          '',
          'The CONOPS is the centerpiece of the plan or OPORD.',
          ...CONOPS_REQUIREMENTS.map((r, i) =>
            section(
              `${String(i + 1).padStart(2, '0')}. ${r.label}`,
              orNone(s.conops[r.key as keyof RefinedConops] as string)
            )
          )
        )
      );
    },
  },
  {
    id: 'tpfdd',
    phaseId: 7,
    label: 'Time-Phased Force and Deployment Data',
    doctrineRef: 'JP 5-0, IV-59',
    build: ({ scenario, planOrderDevelopment: s }) =>
      classified(
        scenario,
        'TIME-PHASED FORCE AND DEPLOYMENT DATA',
        'JP 5-0, IV-59',
        blocks(
          'The TPFDD is the link between the CONOPS and force planning. Sequencing is captured as the commander’s required delivery dates.',
          table(
            ['Unit / Force Element', 'Category', 'Origin', 'Destination', 'Required Delivery Date'],
            s.tpfdd.map(t => [t.unit, t.category, t.origin, t.destination, t.requiredDeliveryDate])
          )
        )
      ),
  },
  {
    id: 'shortfalls-support',
    phaseId: 7,
    label: 'Shortfall Register & Supporting Plans',
    doctrineRef: 'JP 5-0, Figure IV-17',
    build: ({ scenario, planOrderDevelopment: s }) =>
      classified(
        scenario,
        'SHORTFALLS AND SUPPORTING PLANS',
        'JP 5-0, Figure IV-17',
        blocks(
          section(
            'Plan Development Activities',
            table(
              ['Activity', 'Lead', 'Status', 'Notes'],
              PLAN_DEVELOPMENT_ACTIVITIES.map(def => {
                const a = s.activities.find(x => x.id === def.id);
                return [def.label, a?.lead || '', a?.status || 'not_started', a?.notes || ''];
              })
            )
          ),
          section(
            'Shortfall Register',
            table(
              ['Shortfall', 'Activity', 'Severity', 'Resolution', 'Resolved'],
              s.shortfalls.map(x => [
                x.description,
                PLAN_DEVELOPMENT_ACTIVITIES.find(a => a.id === x.activityId)?.label || '',
                x.severity,
                x.resolution,
                x.resolved ? 'YES' : 'NO',
              ])
            )
          ),
          section(
            'Supporting Plans',
            table(
              ['Command', 'Plan', 'Status', 'Due'],
              s.supportingPlans.map(p => [p.command, p.planName, p.status, p.dueDtg])
            )
          )
        )
      ),
  },
  {
    id: 'order-document',
    phaseId: 7,
    label: 'Order Document & Review Status',
    doctrineRef: 'JP 5-0, IV-58 / CJCSM 3130.03',
    build: ({ scenario, planOrderDevelopment: s }) =>
      classified(
        scenario,
        `${s.order.type} — ${s.order.title}`,
        'JP 5-0, IV-58 / CJCSM 3130.03',
        blocks(
          section(
            'Order',
            blocks(
              kv('Product type', s.order.type),
              kv('Number', s.order.number),
              kv('Title', s.order.title),
              kv('Effective DTG', s.order.effectiveDtg),
              kv('Documentation notes', s.order.documentationNotes)
            )
          ),
          section(
            'CJCS Plan Review',
            table(
              ['Criterion', 'Met'],
              PLAN_REVIEW_CRITERIA.map(c => [c.label, s.order.reviewCriteria[c.id] ? 'YES' : 'NO'])
            )
          ),
          section(
            'In-Progress Review',
            blocks(
              kv('Outcome', s.ipr.outcome.replace(/_/g, ' ')),
              kv('Held', s.ipr.heldDtg),
              table(
                ['Confirmed', 'Status'],
                IPR_CONFIRMATION_ITEMS.map(i => [i.label, s.ipr.confirmationItems[i.id] ? 'YES' : 'NO'])
              ),
              s.ipr.frictionPoints ? kv('Friction points', s.ipr.frictionPoints) : '',
              s.ipr.guidanceForRefinement ? kv('Guidance for refinement', s.ipr.guidanceForRefinement) : ''
            )
          )
        )
      ),
  },
];
