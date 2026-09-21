'use client';

import React, { useMemo, useState } from 'react';
import {
  COA_COMPARISON_KEY_INPUTS,
  COA_COMPARISON_KEY_OUTPUTS,
  COA_COMPARISON_TECHNIQUES,
  PLUS_MINUS_NEUTRAL_VALUES,
  COMPARISON_COMMANDER_QUESTIONS,
  CRITERIA_DEFINITION_STEPS,
  EVAL_CRITERIA_SOURCES,
} from '@jpe/shared';
import {
  FileCheck,
  Scale,
  SlidersHorizontal,
  Table2,
  ListChecks,
  Award,
  Presentation,
  Plus,
  X,
  Check,
  Info,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import {
  CoaComparisonState,
  CoaDevelopmentState,
  CoaAnalysisState,
  MissionAnalysisState,
  ComparisonCriterion,
  ComparisonTechnique,
  CriterionScore,
  PlusMinusNeutral,
  CoaCriterionNarrative,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

/**
 * Seeds comparison criteria from the criteria established during mission
 * analysis (JP 5-0 ma-10 — established early "to prevent post-bias"), which
 * until now were carried in state but never surfaced in any UI.
 */
export function createDefaultCoaComparisonState(
  _scenario: OperationalScenario,
  missionAnalysisState: MissionAnalysisState
): CoaComparisonState {
  return {
    technique: 'weighted',
    criteria: missionAnalysisState.coaEvalCriteria.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      standard: '',
      weight: c.weight || 1,
      source: 'Mission Analysis (Step 2)',
      active: true,
    })),
    scores: [],
    narratives: [],
    recommendation: {
      recommendedCoaId: '',
      rationale: '',
      differences: '',
      advantagesSummary: '',
      riskSummary: '',
      dissentingViews: '',
      briefedDtg: '',
    },
    definitionCompletion: CRITERIA_DEFINITION_STEPS.reduce((acc, s) => {
      acc[s.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    outputCompletion: COA_COMPARISON_KEY_OUTPUTS.reduce((acc, o) => {
      acc[o.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    notes: '',
  };
}

// =============================================================================
// Props
// =============================================================================

interface CoaComparisonProps {
  onOpenExportModal: () => void;
}

type TabId = 'criteria' | 'technique' | 'scoring' | 'narrative' | 'recommendation';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'criteria', label: 'Criteria', icon: SlidersHorizontal },
  { id: 'technique', label: 'Technique', icon: Scale },
  { id: 'scoring', label: 'Scoring Matrix', icon: Table2 },
  { id: 'narrative', label: 'Strengths & Advantages', icon: ListChecks },
  { id: 'recommendation', label: 'Recommendation', icon: Award },
];

// =============================================================================
// Shared Components
// =============================================================================

const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  doctrineRef?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, doctrineRef, children, className = '' }) => (
  <div className={`bg-slate-950/60 border border-slate-800 rounded-lg p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <h4 className="text-xs font-mono font-bold text-joint-300 uppercase tracking-wide">
        {title}
      </h4>
      {doctrineRef && (
        <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
          {doctrineRef}
        </span>
      )}
    </div>
    {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    <div className="mt-3">{children}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div>
    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
    />
  </div>
);

const LineInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-joint-500 ${className}`}
  />
);

const AddRowButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-joint-400 hover:bg-slate-900/50 hover:border-joint-700 transition flex justify-center items-center gap-1.5"
  >
    <Plus className="w-3 h-3" /> {label}
  </button>
);

const NoCoasNotice: React.FC = () => (
  <div className="p-8 text-center">
    <ShieldAlert className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
    <h4 className="text-sm font-bold text-slate-200">No COAs available to compare</h4>
    <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
      Comparison evaluates the COAs developed in Step 3 and wargamed in Step 4. Develop at least one
      COA in <span className="text-joint-300">Step 3</span>, then return here.
    </p>
  </div>
);

// =============================================================================
// Shared selectors / helpers
// =============================================================================

/**
 * JP 5-0, IV-52: "The staff evaluates feasible COAs." COAs the staff marked
 * `discard` during Step 4 analysis are not carried into comparison.
 */
function useComparableCoas(
  coaDevState: CoaDevelopmentState,
  coaAnalysisState: CoaAnalysisState
) {
  return useMemo(() => {
    const discarded = new Set(
      coaAnalysisState.results.filter(r => r.recommendation === 'discard').map(r => r.coaId)
    );
    return {
      comparable: coaDevState.coas.filter(c => !discarded.has(c.id)),
      discarded,
    };
  }, [coaDevState.coas, coaAnalysisState.results]);
}

// =============================================================================
// Tab 1: Criteria
// =============================================================================

const CriteriaTab: React.FC<{
  state: CoaComparisonState;
  onChange: (state: CoaComparisonState) => void;
}> = ({ state, onChange }) => {
  const [showSources, setShowSources] = useState(false);

  const updateCriterion = (id: string, updates: Partial<ComparisonCriterion>) =>
    onChange({
      ...state,
      criteria: state.criteria.map(c => (c.id === id ? { ...c, ...updates } : c)),
    });

  const addCriterion = () =>
    onChange({
      ...state,
      criteria: [
        ...state.criteria,
        {
          id: `crit-${Date.now()}`,
          name: '',
          description: '',
          standard: '',
          weight: 1,
          source: 'COA Comparison (Step 5)',
          active: true,
        },
      ],
    });

  const removeCriterion = (id: string) =>
    onChange({
      ...state,
      criteria: state.criteria.filter(c => c.id !== id),
      scores: state.scores.filter(s => s.criterionId !== id),
      narratives: state.narratives.filter(n => n.criterionId !== id),
    });

  const activeCount = state.criteria.filter(c => c.active).length;
  const missingStandards = state.criteria.filter(c => c.active && !c.standard.trim()).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Key Inputs"
          subtitle="What comparison consumes."
          doctrineRef="JP 5-0, Fig IV-14"
        >
          <div className="space-y-1.5">
            {COA_COMPARISON_KEY_INPUTS.map(i => (
              <div
                key={i.id}
                className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
              >
                <span className="text-slate-200">{i.label}</span>
                <span className="text-[9px] font-mono text-joint-400 whitespace-nowrap ml-2">
                  {i.source}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Key Outputs"
          subtitle="What Step 5 must deliver into COA Approval (Step 6)."
          doctrineRef="JP 5-0, Fig IV-14"
        >
          <div className="space-y-1.5">
            {COA_COMPARISON_KEY_OUTPUTS.map(o => (
              <div
                key={o.id}
                className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                {o.label}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          There is no standard list of criteria. The commander may prescribe several core criteria
          for all staff directors; individual staff sections select the remainder based on their
          estimate process. The number varies, but there should be enough to differentiate the COAs.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-52 / IV-53</span>
        </p>
      </div>

      <SectionCard
        title="Evaluation Criteria"
        subtitle={`${activeCount} active. Criteria seeded from mission analysis; refine, weight, and define the standard for each.`}
        doctrineRef="JP 5-0, IV-53"
      >
        {missingStandards > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-950/25 border border-amber-900/50 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-200/85 leading-relaxed">
              {missingStandards} active {missingStandards === 1 ? 'criterion' : 'criteria'} without a
              defined standard. Establish definitions <strong>before</strong> commencing comparison,
              to avoid compromising the outcome.
              <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-53(d)2b</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          {state.criteria.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded-lg border space-y-2 ${
                c.active
                  ? 'bg-slate-900/60 border-slate-700/60'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={(e) => updateCriterion(c.id, { active: e.target.checked })}
                  className="rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
                  title="Include in comparison"
                />
                <LineInput
                  value={c.name}
                  onChange={(v) => updateCriterion(c.id, { name: v })}
                  placeholder="Criterion name"
                  className="flex-1 min-w-[160px]"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">WEIGHT</span>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={c.weight}
                    onChange={(e) =>
                      updateCriterion(c.id, { weight: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-joint-300 font-mono focus:outline-none focus:border-joint-500"
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-600 whitespace-nowrap">
                  {c.source}
                </span>
                <button
                  onClick={() => removeCriterion(c.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <LineInput
                value={c.standard}
                onChange={(v) => updateCriterion(c.id, { standard: v })}
                placeholder="Standard — how this criterion is judged, in precise terms"
                className={`w-full ${
                  c.active && !c.standard.trim() ? 'border-amber-900/60' : ''
                }`}
              />
            </div>
          ))}
          <AddRowButton onClick={addCriterion} label="Add Criterion" />
        </div>
      </SectionCard>

      <SectionCard
        title="Criteria Definition Checklist"
        subtitle="Identify, then define — before comparison begins."
        doctrineRef="JP 5-0, IV-53(d)"
      >
        <div className="space-y-1.5">
          {CRITERIA_DEFINITION_STEPS.map(s => (
            <label
              key={s.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.definitionCompletion[s.id]}
                onChange={(e) =>
                  onChange({
                    ...state,
                    definitionCompletion: {
                      ...state.definitionCompletion,
                      [s.id]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[10px] leading-relaxed flex-1 ${
                  state.definitionCompletion[s.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {s.label}
              </span>
              <span className="text-[9px] font-mono text-joint-400 uppercase shrink-0">
                {s.phase}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={() => setShowSources(!showSources)}
          className="mt-3 w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-joint-800 transition"
        >
          <span className="text-[11px] font-mono text-joint-300">
            Where criteria come from — 9 doctrinal sources
          </span>
          {showSources ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
        {showSources && (
          <div className="mt-2 space-y-1.5">
            {EVAL_CRITERIA_SOURCES.map(s => (
              <div
                key={s.id}
                className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-[10px] text-slate-300 leading-relaxed"
              >
                {s.label}
              </div>
            ))}
            <p className="text-[9px] font-mono text-slate-600 text-right">JP 5-0, IV-45</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 2: Technique
// =============================================================================

const TechniqueTab: React.FC<{
  state: CoaComparisonState;
  onChange: (state: CoaComparisonState) => void;
}> = ({ state, onChange }) => (
  <div className="space-y-5">
    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
      <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
      <p className="text-[10px] text-slate-400 leading-relaxed">
        The staff may use any technique that facilitates reaching the best recommendation and the
        commander making the best decision. These are aids to selection, not decision procedures —
        commanders apply logic, reason, knowledge of the mission and the OE, and operational art to
        determine the best COA.
        <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-53 / App E §1</span>
      </p>
    </div>

    <SectionCard
      title="Comparison Technique"
      subtitle="Drives how the scoring matrix is rendered."
      doctrineRef="JP 5-0, Appendix E"
    >
      <div className="space-y-3">
        {COA_COMPARISON_TECHNIQUES.map(t => {
          const selected = state.technique === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange({ ...state, technique: t.key as ComparisonTechnique })}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selected
                  ? 'bg-joint-950/70 border-joint-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-joint-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${selected ? 'text-joint-200' : 'text-slate-200'}`}
                >
                  {t.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-slate-500">{t.ref}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-joint-300" />}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{t.description}</p>
              <p className="text-[10px] text-amber-400/85 mt-1.5 leading-relaxed">
                <span className="font-mono font-bold">CAVEAT:</span> {t.caveat}
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  </div>
);

// =============================================================================
// Tab 3: Scoring Matrix
// =============================================================================

const ScoringTab: React.FC<{
  state: CoaComparisonState;
  onChange: (state: CoaComparisonState) => void;
  coaDevState: CoaDevelopmentState;
  coaAnalysisState: CoaAnalysisState;
}> = ({ state, onChange, coaDevState, coaAnalysisState }) => {
  const { comparable, discarded } = useComparableCoas(coaDevState, coaAnalysisState);
  const criteria = state.criteria.filter(c => c.active);
  const weighted = state.technique === 'weighted';
  const pmnMode = state.technique === 'plus_minus_neutral';

  if (!coaDevState.coas.length) return <NoCoasNotice />;

  const getScore = (criterionId: string, coaId: string) =>
    state.scores.find(s => s.criterionId === criterionId && s.coaId === coaId);

  const setScore = (criterionId: string, coaId: string, updates: Partial<CriterionScore>) => {
    const existing = getScore(criterionId, coaId);
    if (existing) {
      onChange({
        ...state,
        scores: state.scores.map(s => (s.id === existing.id ? { ...s, ...updates } : s)),
      });
    } else {
      onChange({
        ...state,
        scores: [
          ...state.scores,
          {
            id: `sc-${criterionId}-${coaId}`,
            criterionId,
            coaId,
            score: null,
            pmn: 'unrated',
            rationale: '',
            ...updates,
          },
        ],
      });
    }
  };

  const columnTotal = (coaId: string) =>
    criteria.reduce((sum, c) => {
      const s = getScore(c.id, coaId);
      if (s?.score == null) return sum;
      return sum + s.score * (weighted ? c.weight : 1);
    }, 0);

  const anyScored = state.scores.some(s => s.score != null || s.pmn !== 'unrated');
  const undefinedStandards = criteria.filter(c => !c.standard.trim());
  const scoredDiscarded = comparable.length !== coaDevState.coas.length
    ? coaDevState.coas.filter(
        c => discarded.has(c.id) && state.scores.some(s => s.coaId === c.id && s.score != null)
      )
    : [];

  if (state.technique === 'descriptive') {
    return (
      <div className="p-8 text-center">
        <ListChecks className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-200">Descriptive technique selected</h4>
        <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
          The narrative / bulletized technique records strengths and weaknesses rather than scores.
          Use the <span className="text-joint-300">Strengths &amp; Advantages</span> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Standing doctrinal notice */}
      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-[10px] text-amber-200/80 leading-relaxed space-y-1">
          <p>
            <strong>Do not evaluate COAs against each other within any one criterion.</strong>{' '}
            Evaluate each COA individually against the established criterion, then compare their
            individual performances.
          </p>
          <p>
            Comparison is subjective and should not be a strictly mathematical process. Comparing
            COAs by criterion is more accurate than comparing total values.
            <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-52 / IV-53(4) / App E §2b</span>
          </p>
        </div>
      </div>

      {anyScored && undefinedStandards.length > 0 && (
        <div className="p-2.5 rounded-lg bg-red-950/25 border border-red-900/60 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-red-200/85 leading-relaxed">
            Scoring has begun but {undefinedStandards.length}{' '}
            {undefinedStandards.length === 1 ? 'criterion' : 'criteria'}{' '}
            {undefinedStandards.length === 1 ? 'has' : 'have'} no defined standard (
            {undefinedStandards.map(c => c.name || 'unnamed').join(', ')}).
            Definitions established after scoring starts compromise the outcome.
            <span className="font-mono text-red-400/70 ml-1">JP 5-0, IV-53(d)2b</span>
          </p>
        </div>
      )}

      {scoredDiscarded.length > 0 && (
        <div className="p-2.5 rounded-lg bg-red-950/25 border border-red-900/60 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-red-200/85 leading-relaxed">
            {scoredDiscarded.map(c => c.designator).join(', ')} was marked <strong>discard</strong>{' '}
            during Step 4 analysis but has been scored here. The staff evaluates feasible COAs —
            revisit the Step 4 disposition or remove the scores.
            <span className="font-mono text-red-400/70 ml-1">JP 5-0, IV-52(c)</span>
          </p>
        </div>
      )}

      {criteria.length === 0 ? (
        <div className="p-8 text-center">
          <SlidersHorizontal className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            No active criteria. Define them on the Criteria tab first.
          </p>
        </div>
      ) : (
        <SectionCard
          title={`Comparison Matrix — ${
            COA_COMPARISON_TECHNIQUES.find(t => t.key === state.technique)?.label
          }`}
          subtitle={
            pmnMode
              ? '(+) positive influence, (0) neutral, (−) negative influence.'
              : 'Higher is better. Values reflect the relative strengths and weaknesses of each COA.'
          }
          doctrineRef={pmnMode ? 'JP 5-0, Fig E-5' : 'JP 5-0, Fig E-1 / E-2'}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 pr-3 font-mono text-[10px] text-slate-500 uppercase min-w-[150px]">
                    Criterion
                  </th>
                  {weighted && (
                    <th className="text-center py-2 px-2 font-mono text-[10px] text-slate-500 uppercase w-16">
                      Weight
                    </th>
                  )}
                  {comparable.map(c => (
                    <th
                      key={c.id}
                      className="text-center py-2 px-3 font-mono text-[10px] text-joint-300 min-w-[110px]"
                    >
                      {c.designator}
                      {c.name && (
                        <div className="text-slate-500 font-normal normal-case mt-0.5">{c.name}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map(crit => (
                  <tr key={crit.id} className="border-b border-slate-900">
                    <td className="py-2 pr-3 align-top">
                      <div className="text-slate-200">{crit.name || '(unnamed)'}</div>
                      {crit.standard && (
                        <div className="text-[9px] text-slate-600 mt-0.5 leading-snug">
                          {crit.standard}
                        </div>
                      )}
                    </td>
                    {weighted && (
                      <td className="py-2 px-2 text-center align-top">
                        <span className="text-joint-400 font-mono">{crit.weight}</span>
                      </td>
                    )}
                    {comparable.map(coa => {
                      const s = getScore(crit.id, coa.id);
                      return (
                        <td key={coa.id} className="py-2 px-2 align-top">
                          {pmnMode ? (
                            <div className="flex justify-center gap-1">
                              {PLUS_MINUS_NEUTRAL_VALUES.map(v => {
                                const on = s?.pmn === v.key;
                                const tone =
                                  v.key === 'plus'
                                    ? on
                                      ? 'bg-emerald-600 border-emerald-500 text-slate-950'
                                      : 'border-slate-700 text-slate-500 hover:text-emerald-400'
                                    : v.key === 'minus'
                                    ? on
                                      ? 'bg-red-600 border-red-500 text-slate-950'
                                      : 'border-slate-700 text-slate-500 hover:text-red-400'
                                    : on
                                    ? 'bg-slate-500 border-slate-400 text-slate-950'
                                    : 'border-slate-700 text-slate-500 hover:text-slate-300';
                                return (
                                  <button
                                    key={v.key}
                                    title={v.label}
                                    onClick={() =>
                                      setScore(crit.id, coa.id, {
                                        pmn: on ? 'unrated' : (v.key as PlusMinusNeutral),
                                      })
                                    }
                                    className={`w-7 h-7 rounded border font-mono text-xs font-bold transition bg-slate-950 ${tone}`}
                                  >
                                    {v.symbol}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={9}
                                value={s?.score ?? ''}
                                onChange={(e) =>
                                  setScore(crit.id, coa.id, {
                                    score: e.target.value === '' ? null : Number(e.target.value),
                                  })
                                }
                                placeholder="—"
                                className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center text-[11px] text-slate-200 font-mono focus:outline-none focus:border-joint-500"
                              />
                              {weighted && s?.score != null && (
                                <span className="text-[10px] font-mono text-joint-400">
                                  = {s.score * crit.weight}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {!pmnMode && (
                  <tr className="border-t-2 border-slate-800">
                    <td className="py-2 pr-3">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">
                        {weighted ? 'Weighted total' : 'Total'}
                      </span>
                    </td>
                    {weighted && <td />}
                    {comparable.map(coa => (
                      <td key={coa.id} className="py-2 px-2 text-center">
                        <span className="text-slate-300 font-mono text-sm">{columnTotal(coa.id)}</span>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!pmnMode && (
            <p className="mt-3 text-[9px] text-slate-600 leading-relaxed font-mono">
              Totals are an analytical aid, not a verdict. Do not portray this simplified numeric
              method as the result of rigorous mathematical analysis.
            </p>
          )}
        </SectionCard>
      )}
    </div>
  );
};

// =============================================================================
// Tab 4: Strengths & Advantages
// =============================================================================

const NarrativeTab: React.FC<{
  state: CoaComparisonState;
  onChange: (state: CoaComparisonState) => void;
  coaDevState: CoaDevelopmentState;
  coaAnalysisState: CoaAnalysisState;
}> = ({ state, onChange, coaDevState, coaAnalysisState }) => {
  const { comparable } = useComparableCoas(coaDevState, coaAnalysisState);
  const criteria = state.criteria.filter(c => c.active);
  const [activeCoaId, setActiveCoaId] = useState<string>(comparable[0]?.id || '');

  if (!coaDevState.coas.length) return <NoCoasNotice />;

  const resolvedId = comparable.some(c => c.id === activeCoaId)
    ? activeCoaId
    : comparable[0]?.id || '';
  const wargame = coaAnalysisState.results.find(r => r.coaId === resolvedId);

  const getNarrative = (criterionId: string) =>
    state.narratives.find(n => n.coaId === resolvedId && n.criterionId === criterionId);

  const setNarrative = (criterionId: string, updates: Partial<CoaCriterionNarrative>) => {
    const existing = getNarrative(criterionId);
    if (existing) {
      onChange({
        ...state,
        narratives: state.narratives.map(n => (n.id === existing.id ? { ...n, ...updates } : n)),
      });
    } else {
      onChange({
        ...state,
        narratives: [
          ...state.narratives,
          {
            id: `nar-${criterionId}-${resolvedId}`,
            coaId: resolvedId,
            criterionId,
            strengths: '',
            weaknesses: '',
            advantages: '',
            disadvantages: '',
            ...updates,
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {comparable.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCoaId(c.id)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition ${
              c.id === resolvedId
                ? 'bg-joint-950 border-joint-500 text-joint-100 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-joint-800'
            }`}
          >
            {c.designator}
            {c.name && <span className="text-slate-500 font-normal"> — {c.name}</span>}
          </button>
        ))}
      </div>

      {/* Carried forward from Step 4 — Fig IV-14 key input */}
      {wargame && (wargame.advantages || wargame.disadvantages || wargame.strengths) && (
        <SectionCard
          title="Carried Forward from Wargaming"
          subtitle="Advantages and disadvantages recorded during Step 4 analysis."
          doctrineRef="JP 5-0, Fig IV-14"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
            {([
              ['Strengths', wargame.strengths],
              ['Weaknesses', wargame.weaknesses],
              ['Advantages', wargame.advantages],
              ['Disadvantages', wargame.disadvantages],
            ] as const).map(([lbl, val]) =>
              val ? (
                <div key={lbl} className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[9px] font-mono text-joint-400 uppercase mb-1">{lbl}</div>
                  <p className="text-slate-300 leading-relaxed">{val}</p>
                </div>
              ) : null
            )}
          </div>
        </SectionCard>
      )}

      {criteria.length === 0 ? (
        <div className="p-8 text-center">
          <SlidersHorizontal className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            No active criteria. Define them on the Criteria tab first.
          </p>
        </div>
      ) : (
        <SectionCard
          title="Strengths & Weaknesses by Criterion"
          subtitle="Analyze each criterion for this COA. Evaluating strengths and weaknesses of one COA facilitates comparing its advantages and disadvantages with another."
          doctrineRef="JP 5-0, IV-53 / Figs E-3, E-4"
        >
          <div className="space-y-3">
            {criteria.map(crit => {
              const n = getNarrative(crit.id);
              return (
                <div
                  key={crit.id}
                  className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-white">
                      {crit.name || '(unnamed criterion)'}
                    </span>
                    {crit.standard && (
                      <span className="text-[9px] text-slate-600 truncate max-w-[55%]">
                        {crit.standard}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Field
                      label="Strengths"
                      value={n?.strengths || ''}
                      onChange={(v) => setNarrative(crit.id, { strengths: v })}
                    />
                    <Field
                      label="Weaknesses"
                      value={n?.weaknesses || ''}
                      onChange={(v) => setNarrative(crit.id, { weaknesses: v })}
                    />
                    <Field
                      label="Advantages"
                      value={n?.advantages || ''}
                      onChange={(v) => setNarrative(crit.id, { advantages: v })}
                    />
                    <Field
                      label="Disadvantages"
                      value={n?.disadvantages || ''}
                      onChange={(v) => setNarrative(crit.id, { disadvantages: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// =============================================================================
// Tab 5: Recommendation
// =============================================================================

const RecommendationTab: React.FC<{
  state: CoaComparisonState;
  onChange: (state: CoaComparisonState) => void;
  coaDevState: CoaDevelopmentState;
  coaAnalysisState: CoaAnalysisState;
}> = ({ state, onChange, coaDevState, coaAnalysisState }) => {
  const { comparable } = useComparableCoas(coaDevState, coaAnalysisState);

  if (!coaDevState.coas.length) return <NoCoasNotice />;

  const setRec = (updates: Partial<CoaComparisonState['recommendation']>) =>
    onChange({ ...state, recommendation: { ...state.recommendation, ...updates } });

  /**
   * JP 5-0, IV-53(5): where COAs pursue differing objectives, a side-by-side
   * comparison for selection may not be appropriate.
   */
  const differingObjectives = useMemo(() => {
    const objectives = comparable
      .map(c => c.conops.objectives.trim().toLowerCase())
      .filter(Boolean);
    return objectives.length > 1 && new Set(objectives).size === objectives.length;
  }, [comparable]);

  return (
    <div className="space-y-5">
      {differingObjectives && (
        <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-900/50 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-200/85 leading-relaxed">
            These COAs carry different objectives. Where COAs are significantly different, a
            side-by-side comparison for selection may not be appropriate — but it does let the
            commander show senior leaders the costs and risks of differing options.
            <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-53(5)</span>
          </p>
        </div>
      )}

      <SectionCard
        title="Recommended COA"
        subtitle="The objective is to identify and recommend the COA with the highest probability of accomplishing the mission, that is acceptable."
        doctrineRef="JP 5-0, IV-51"
      >
        <div className="flex flex-wrap gap-2">
          {comparable.map(c => {
            const selected = state.recommendation.recommendedCoaId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setRec({ recommendedCoaId: selected ? '' : c.id })}
                className={`px-3 py-2 rounded-lg border text-[11px] font-mono transition flex items-center gap-1.5 ${
                  selected
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {selected && <Check className="w-3 h-3" />}
                {c.designator}
                {c.name && <span className="text-slate-500 font-normal">— {c.name}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <Field
            label="COA selection rationale"
            value={state.recommendation.rationale}
            onChange={(v) => setRec({ rationale: v })}
            placeholder="Why this COA, in terms of the evaluation criteria and the risk..."
            rows={4}
          />
        </div>

        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Decision matrices alone cannot provide decision solutions. They are analytical tools the
            staff uses to prepare recommendations — the commander provides the solution by applying
            judgment to those recommendations and deciding.
            <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-52(b)</span>
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Questions Comparison Answers for the Commander"
        doctrineRef="JP 5-0, IV-51"
      >
        <div className="space-y-3">
          <Field
            label={COMPARISON_COMMANDER_QUESTIONS[0].question}
            value={state.recommendation.differences}
            onChange={(v) => setRec({ differences: v })}
            rows={3}
          />
          <Field
            label={COMPARISON_COMMANDER_QUESTIONS[1].question}
            value={state.recommendation.advantagesSummary}
            onChange={(v) => setRec({ advantagesSummary: v })}
            rows={3}
          />
          <Field
            label={COMPARISON_COMMANDER_QUESTIONS[2].question}
            value={state.recommendation.riskSummary}
            onChange={(v) => setRec({ riskSummary: v })}
            rows={3}
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Dissenting Views" subtitle="Staff positions that differ from the recommendation.">
          <Field
            label="Recorded dissent"
            value={state.recommendation.dissentingViews}
            onChange={(v) => setRec({ dissentingViews: v })}
            rows={5}
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="text-[11px] font-mono text-slate-400">Comparison briefed</label>
            <LineInput
              value={state.recommendation.briefedDtg}
              onChange={(v) => setRec({ briefedDtg: v })}
              placeholder="DDHHMMZ MON YY"
              className="w-40"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Key Outputs Complete"
          subtitle={`${
            Object.values(state.outputCompletion).filter(Boolean).length
          } of ${COA_COMPARISON_KEY_OUTPUTS.length}. These feed the COA decision brief in Step 6.`}
          doctrineRef="JP 5-0, Fig IV-14"
        >
          <div className="space-y-1.5">
            {COA_COMPARISON_KEY_OUTPUTS.map(o => (
              <label
                key={o.id}
                className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!state.outputCompletion[o.id]}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      outputCompletion: { ...state.outputCompletion, [o.id]: e.target.checked },
                    })
                  }
                  className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
                />
                <span
                  className={`text-[10px] leading-relaxed ${
                    state.outputCompletion[o.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}
                >
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const CoaComparison: React.FC<CoaComparisonProps> = ({
  onOpenExportModal,
}) => {
  const {
    scenario,
    coaComparison: state,
    setCoaComparison: onStateChange,
    // Step 3 — the COAs under comparison
    coaDevelopment: coaDevState,
    // Step 4 — wargame results, advantages and disadvantages (Fig IV-14 inputs)
    coaAnalysis: coaAnalysisState,
  } = usePlanning();
  const [activeTab, setActiveTab] = useState<TabId>('criteria');
  const { comparable, discarded } = useComparableCoas(coaDevState, coaAnalysisState);

  const activeCriteria = state.criteria.filter(c => c.active);
  const scoredCells = state.scores.filter(s => s.score != null || s.pmn !== 'unrated').length;
  const totalCells = activeCriteria.length * comparable.length;
  const recommended = coaDevState.coas.find(c => c.id === state.recommendation.recommendedCoaId);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 5 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">
                JP 5-0 Ch IV, para 4.f &amp; App E
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-joint-400" />
              COA Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Evaluate each COA for Operation {scenario.operationName} independently against the
              established criteria, then recommend the COA with the highest probability of
              accomplishing the mission.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExportModal}
              className="px-3.5 py-2 bg-joint-950/90 hover:bg-joint-900 text-joint-200 text-xs font-semibold rounded-lg border border-joint-700/80 transition flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-joint-400" />
              <span>Export Brief</span>
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {comparable.length}
              {discarded.size > 0 && (
                <span className="text-slate-600 text-xs">/{coaDevState.coas.length}</span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">COAs Compared</div>
          </div>
          <div className="p-2.5 bg-joint-950/50 rounded border border-joint-800 text-center">
            <div className="text-lg font-mono font-bold text-joint-300">{activeCriteria.length}</div>
            <div className="text-[9px] text-joint-400 uppercase font-mono">Active Criteria</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {scoredCells}
              <span className="text-slate-600 text-xs">/{totalCells}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Cells Scored</div>
          </div>
          <div className="p-2.5 bg-emerald-950/30 rounded border border-emerald-900/60 text-center">
            <div className="text-lg font-mono font-bold text-emerald-400">
              {recommended ? recommended.designator : '—'}
            </div>
            <div className="text-[9px] text-emerald-500 uppercase font-mono">Recommended</div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium font-mono border-b-2 transition -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-joint-400 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'criteria' && <CriteriaTab state={state} onChange={onStateChange} />}
        {activeTab === 'technique' && <TechniqueTab state={state} onChange={onStateChange} />}
        {activeTab === 'scoring' && (
          <ScoringTab
            state={state}
            onChange={onStateChange}
            coaDevState={coaDevState}
            coaAnalysisState={coaAnalysisState}
          />
        )}
        {activeTab === 'narrative' && (
          <NarrativeTab
            state={state}
            onChange={onStateChange}
            coaDevState={coaDevState}
            coaAnalysisState={coaAnalysisState}
          />
        )}
        {activeTab === 'recommendation' && (
          <RecommendationTab
            state={state}
            onChange={onStateChange}
            coaDevState={coaDevState}
            coaAnalysisState={coaAnalysisState}
          />
        )}
      </div>
    </div>
  );
};
