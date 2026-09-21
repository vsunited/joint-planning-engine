import { PlanningProduct } from './types';
import { blocks, classified, h3, kv, orNone, section, table } from './format';

export const STEP5_PRODUCTS: PlanningProduct[] = [
  {
    id: 'comparison-matrix',
    phaseId: 5,
    label: 'COA Comparison Matrix',
    doctrineRef: 'JP 5-0, Appendix E',
    build: ({ scenario, coaComparison: s, coaDevelopment: d, coaAnalysis: a }) => {
      const discarded = new Set(
        a.results.filter(r => r.recommendation === 'discard').map(r => r.coaId)
      );
      const coas = d.coas.filter(c => !discarded.has(c.id));
      const criteria = s.criteria.filter(c => c.active);
      const weighted = s.technique === 'weighted';
      const pmn = s.technique === 'plus_minus_neutral';

      const rows = criteria.map(crit => [
        crit.name,
        ...(weighted ? [String(crit.weight)] : []),
        ...coas.map(coa => {
          const sc = s.scores.find(x => x.criterionId === crit.id && x.coaId === coa.id);
          if (pmn) {
            return sc?.pmn === 'plus' ? '+' : sc?.pmn === 'minus' ? '-' : sc?.pmn === 'neutral' ? '0' : '';
          }
          if (sc?.score == null) return '';
          return weighted ? `${sc.score} (${sc.score * crit.weight})` : String(sc.score);
        }),
      ]);

      const totals = coas.map(coa =>
        String(
          criteria.reduce((sum, crit) => {
            const sc = s.scores.find(x => x.criterionId === crit.id && x.coaId === coa.id);
            if (sc?.score == null) return sum;
            return sum + sc.score * (weighted ? crit.weight : 1);
          }, 0)
        )
      );

      return classified(
        scenario,
        'COA COMPARISON MATRIX',
        'JP 5-0, Appendix E',
        blocks(
          kv('Technique', s.technique.replace(/_/g, ' ')),
          section(
            'Criteria and Standards',
            table(
              ['Criterion', 'Weight', 'Standard'],
              criteria.map(c => [c.name, String(c.weight), c.standard])
            )
          ),
          section(
            'Comparison',
            table(
              ['Criterion', ...(weighted ? ['Weight'] : []), ...coas.map(c => c.designator)],
              pmn ? rows : [...rows, ['**TOTAL**', ...(weighted ? [''] : []), ...totals]]
            )
          ),
          'Comparison is subjective and is not a strictly mathematical process. Comparing COAs by criterion is more accurate than comparing total values (JP 5-0, App E §2b).',
          section(
            'Strengths and Weaknesses by Criterion',
            s.narratives.length
              ? coas
                  .map(coa =>
                    blocks(
                      h3(coa.designator),
                      table(
                        ['Criterion', 'Strengths', 'Weaknesses', 'Advantages', 'Disadvantages'],
                        criteria
                          .map(crit => {
                            const n = s.narratives.find(
                              x => x.coaId === coa.id && x.criterionId === crit.id
                            );
                            return [
                              crit.name,
                              n?.strengths || '',
                              n?.weaknesses || '',
                              n?.advantages || '',
                              n?.disadvantages || '',
                            ];
                          })
                          .filter(r => r.slice(1).some(Boolean))
                      )
                    )
                  )
                  .join('\n\n')
              : ''
          )
        )
      );
    },
  },
  {
    id: 'recommendation',
    phaseId: 5,
    label: 'Staff Recommendation',
    doctrineRef: 'JP 5-0, IV-51',
    build: ({ scenario, coaComparison: s, coaDevelopment: d }) => {
      const rec = d.coas.find(c => c.id === s.recommendation.recommendedCoaId);
      return classified(
        scenario,
        'STAFF RECOMMENDATION',
        'JP 5-0, IV-51',
        blocks(
          kv(
            'Recommended COA',
            rec ? `${rec.designator}${rec.name ? ` — ${rec.name}` : ''}` : ''
          ),
          section('Selection Rationale', orNone(s.recommendation.rationale)),
          section('Differences Between COAs', orNone(s.recommendation.differences)),
          section('Advantages and Disadvantages', orNone(s.recommendation.advantagesSummary)),
          section('Risks', orNone(s.recommendation.riskSummary)),
          section('Dissenting Views', orNone(s.recommendation.dissentingViews)),
          kv('Briefed', s.recommendation.briefedDtg),
          '',
          'Decision matrices alone cannot provide decision solutions. They are analytical tools the staff uses to prepare recommendations; the commander provides the solution by applying judgment and deciding (JP 5-0, IV-52).'
        )
      );
    },
  },
];
