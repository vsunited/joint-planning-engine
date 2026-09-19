'use client';

import React, { useMemo, useState } from 'react';
import {
  COA_APPROVAL_KEY_INPUTS,
  COA_APPROVAL_KEY_OUTPUTS,
  COA_DECISION_BRIEF_GUIDE,
  DECISION_BRIEF_ATTENDEES,
  COMMANDER_REVIEW_ACTIONS,
  COMMANDER_DECISION_OPTIONS,
  DECISION_STATEMENT_RULES,
  ACCEPTABILITY_CHECK_ITEMS,
} from '@jpe/shared';
import {
  Sparkles,
  Award,
  Presentation,
  Check,
  X,
  Info,
  AlertTriangle,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Gavel,
  FileSignature,
  ClipboardCheck,
  Wand2,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import {
  CoaApprovalState,
  ApprovalStage,
  CommanderDecisionType,
  MissionAnalysisState,
  CoaDevelopmentState,
  CoaAnalysisState,
  CoaComparisonState,
  CourseOfAction,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

export function createDefaultCoaApprovalState(
  _scenario: OperationalScenario
): CoaApprovalState {
  return {
    stage: 1,
    briefSections: COA_DECISION_BRIEF_GUIDE.map(s => ({
      id: s.id,
      section: s.section,
      prepared: false,
      presenter: '',
      notes: '',
    })),
    attendance: DECISION_BRIEF_ATTENDEES.reduce((acc, a) => {
      acc[a] = false;
      return acc;
    }, {} as Record<string, boolean>),
    decision: {
      type: 'undecided',
      selectedCoaIds: [],
      modifications: '',
      rationale: '',
      decidedDtg: '',
      deferConsultation: '',
      restartAt: 'step_3',
      reviewCompletion: COMMANDER_REVIEW_ACTIONS.reduce((acc, r) => {
        acc[r.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
    },
    decisionStatement: {
      statement: '',
      acceptableRisk: '',
      acceptabilityCheck: ACCEPTABILITY_CHECK_ITEMS.reduce((acc, a) => {
        acc[a.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
    },
    estimate: {
      narrative: '',
      refinedIntent: '',
      higherApprovalRequired: false,
      higherApprovalAuthority: '',
      notes: '',
    },
    outputCompletion: COA_APPROVAL_KEY_OUTPUTS.reduce((acc, o) => {
      acc[o.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
  };
}

// =============================================================================
// Props
// =============================================================================

interface CoaApprovalProps {
  onOpenExportModal: () => void;
}

const STAGES: { id: ApprovalStage; label: string; icon: React.ElementType }[] = [
  { id: 1, label: 'Decision Brief', icon: Presentation },
  { id: 2, label: "Commander's Decision", icon: Gavel },
  { id: 3, label: 'Decision Statement', icon: FileSignature },
  { id: 4, label: "Commander's Estimate", icon: ClipboardCheck },
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
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
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

// =============================================================================
// Prefill — assemble brief content from Steps 2 through 5
// =============================================================================

interface UpstreamStates {
  missionAnalysisState: MissionAnalysisState;
  coaDevState: CoaDevelopmentState;
  coaAnalysisState: CoaAnalysisState;
  coaComparisonState: CoaComparisonState;
}

/**
 * Returns the content the app can supply for a given Figure IV-16 section,
 * so the staff reviews an assembled brief rather than filling empty boxes.
 */
function prefillFor(sectionId: string, u: UpstreamStates): string[] {
  const { missionAnalysisState: ma, coaDevState: cd, coaAnalysisState: ca, coaComparisonState: cc } = u;
  const lines: string[] = [];

  switch (sectionId) {
    case 'db-02': {
      if (ma.jipoe.mlcoa) lines.push(`Enemy MLCOA: ${ma.jipoe.mlcoa}`);
      if (ma.jipoe.mdcoa) lines.push(`Enemy MDCOA: ${ma.jipoe.mdcoa}`);
      if (ma.jipoe.enemyCOG) lines.push(`Enemy COG: ${ma.jipoe.enemyCOG}`);
      break;
    }
    case 'db-04': {
      if (ma.jipoe.friendlyCOG) lines.push(`Friendly COG: ${ma.jipoe.friendlyCOG}`);
      const done = ma.staffEstimates.filter(e => e.status === 'complete').length;
      if (ma.staffEstimates.length) {
        lines.push(`Staff estimates: ${done} of ${ma.staffEstimates.length} complete`);
      }
      break;
    }
    case 'db-06': {
      if (ma.commanderIntent) lines.push(ma.commanderIntent);
      break;
    }
    case 'db-07': {
      const valid = ma.assumptions.filter(a => a.description.trim());
      valid.slice(0, 4).forEach(a => lines.push(`Assumption: ${a.description}`));
      if (cd.cog.enemyCriticalVulnerabilities) {
        lines.push(`Enemy critical vulnerabilities: ${cd.cog.enemyCriticalVulnerabilities}`);
      }
      if (cd.cog.decisivePoints) lines.push(`Decisive points: ${cd.cog.decisivePoints}`);
      break;
    }
    case 'db-08': {
      cd.coas.forEach(c => {
        const bits = [c.designator, c.name].filter(Boolean).join(' — ');
        const what = c.statement.what || c.narrative || c.conops.operationalConcept;
        lines.push(what ? `${bits}: ${what}` : bits);
      });
      const distinct = cd.coas
        .map(c => c.distinguishability.mainEffort)
        .filter(Boolean);
      if (distinct.length) lines.push(`Main efforts differ: ${distinct.join(' | ')}`);
      break;
    }
    case 'db-09': {
      if (ca.turns.length) {
        lines.push(`${ca.turns.length} wargame turns recorded across ${new Set(ca.turns.map(t => t.coaId)).size} COA(s)`);
      }
      ca.results
        .filter(r => r.strengths || r.weaknesses)
        .forEach(r => {
          const coa = cd.coas.find(c => c.id === r.coaId);
          if (!coa) return;
          if (r.strengths) lines.push(`${coa.designator} strengths: ${r.strengths}`);
          if (r.weaknesses) lines.push(`${coa.designator} weaknesses: ${r.weaknesses}`);
        });
      break;
    }
    case 'db-10': {
      const active = cc.criteria.filter(c => c.active);
      if (active.length) {
        lines.push(`Criteria (${active.length}): ${active.map(c => c.name).filter(Boolean).join(', ')}`);
      }
      lines.push(`Methodology: ${cc.technique.replace(/_/g, ' ')}`);
      if (cc.recommendation.advantagesSummary) {
        lines.push(`Advantages/disadvantages: ${cc.recommendation.advantagesSummary}`);
      }
      break;
    }
    case 'db-11': {
      const rec = cd.coas.find(c => c.id === cc.recommendation.recommendedCoaId);
      if (rec) lines.push(`Staff recommends ${rec.designator}${rec.name ? ` — ${rec.name}` : ''}`);
      if (cc.recommendation.rationale) lines.push(`Rationale: ${cc.recommendation.rationale}`);
      if (cc.recommendation.dissentingViews) {
        lines.push(`Dissenting views: ${cc.recommendation.dissentingViews}`);
      }
      break;
    }
    default:
      break;
  }
  return lines.filter(Boolean);
}

/** Assembles a starter decision statement from the selected COA. */
function draftDecisionStatement(
  coas: CourseOfAction[],
  selectedIds: string[],
  scenario: OperationalScenario
): string {
  const selected = coas.filter(c => selectedIds.includes(c.id));
  if (!selected.length) return '';
  return selected
    .map(c => {
      const s = c.statement;
      const parts = [
        s.who || scenario.jtfName,
        s.what || c.narrative,
        s.when ? `commencing ${s.when}` : '',
        s.where ? `in ${s.where}` : '',
        s.why ? `in order to ${s.why}` : '',
      ].filter(Boolean);
      const head = `${c.designator}${c.name ? ` (${c.name})` : ''} is approved.`;
      return `${head} ${parts.join(' ')}`.replace(/\s+/g, ' ').trim();
    })
    .join('\n\n');
}

// =============================================================================
// Stage 1: Decision Brief
// =============================================================================

const StageBrief: React.FC<{
  state: CoaApprovalState;
  onChange: (s: CoaApprovalState) => void;
  upstream: UpstreamStates;
}> = ({ state, onChange, upstream }) => {
  const [expanded, setExpanded] = useState<string | null>('db-08');
  const prepared = state.briefSections.filter(s => s.prepared).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Key Inputs" doctrineRef="JP 5-0, Fig IV-15">
          <div className="space-y-1.5">
            {COA_APPROVAL_KEY_INPUTS.map(i => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
              >
                <span className="text-slate-200">{i.label}</span>
                <span className="text-[9px] font-mono text-joint-400 whitespace-nowrap">
                  {i.source}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Briefing Attendance"
          subtitle="Should attend physically or virtually."
          doctrineRef="JP 5-0, IV-55"
        >
          <div className="space-y-1.5">
            {DECISION_BRIEF_ATTENDEES.map(a => (
              <label
                key={a}
                className="flex items-center gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-joint-900 transition"
              >
                <input
                  type="checkbox"
                  checked={!!state.attendance[a]}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      attendance: { ...state.attendance, [a]: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
                />
                <span className="text-[11px] text-slate-200">{a}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              The staff briefs the commander on the COA comparison, COA analysis, and wargaming
              results, including supporting information such as forces available, current JIPOE, the
              operational approach, and assumptions used in COA development.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="COA Decision Briefing"
        subtitle={`${prepared} of ${state.briefSections.length} sections prepared. Content is assembled from Steps 2–5 — review and add to it rather than starting blank.`}
        doctrineRef="JP 5-0, Fig IV-16"
      >
        <div className="space-y-2">
          {state.briefSections.map((sec, idx) => {
            const guide = COA_DECISION_BRIEF_GUIDE.find(g => g.id === sec.id);
            const auto = prefillFor(sec.id, upstream);
            const isOpen = expanded === sec.id;
            return (
              <div
                key={sec.id}
                className={`rounded-lg border transition ${
                  sec.prepared
                    ? 'border-emerald-900/50 bg-emerald-950/10'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <div className="p-3 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={sec.prepared}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        briefSections: state.briefSections.map((s, i) =>
                          i === idx ? { ...s, prepared: e.target.checked } : s
                        ),
                      })
                    }
                    className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0 shrink-0"
                  />
                  <button
                    onClick={() => setExpanded(isOpen ? null : sec.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-semibold ${
                          sec.prepared ? 'text-slate-400' : 'text-white'
                        }`}
                      >
                        {sec.section}
                      </span>
                      {guide?.sourceStep && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-joint-950/70 text-joint-300 border border-joint-900">
                          {guide.sourceStep}
                        </span>
                      )}
                      {auto.length > 0 && (
                        <span className="text-[9px] font-mono text-emerald-400">
                          {auto.length} item{auto.length === 1 ? '' : 's'} pulled through
                        </span>
                      )}
                    </div>
                  </button>
                  <LineInput
                    value={sec.presenter}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        briefSections: state.briefSections.map((s, i) =>
                          i === idx ? { ...s, presenter: v } : s
                        ),
                      })
                    }
                    placeholder="Presenter"
                    className="w-24 shrink-0"
                  />
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 mt-1 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 mt-1 shrink-0" />
                  )}
                </div>

                {isOpen && (
                  <div className="px-3 pb-3 pl-9 space-y-2">
                    {auto.length > 0 && (
                      <div className="p-2.5 rounded bg-slate-950/70 border border-joint-900/50">
                        <div className="text-[9px] font-mono text-joint-400 uppercase mb-1.5">
                          Assembled from prior steps
                        </div>
                        <ul className="space-y-1">
                          {auto.map((line, i) => (
                            <li
                              key={i}
                              className="text-[10px] text-slate-300 leading-relaxed flex items-start gap-1.5"
                            >
                              <span className="text-joint-500 mt-0.5">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guide && guide.items.length > 0 && (
                      <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/60">
                        <div className="text-[9px] font-mono text-slate-500 uppercase mb-1.5">
                          Required content
                        </div>
                        <ul className="space-y-1">
                          {guide.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5"
                            >
                              <span className="text-slate-600 mt-0.5">–</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Field
                      label="Briefer notes"
                      value={sec.notes}
                      onChange={(v) =>
                        onChange({
                          ...state,
                          briefSections: state.briefSections.map((s, i) =>
                            i === idx ? { ...s, notes: v } : s
                          ),
                        })
                      }
                      rows={2}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Stage 2: Commander's Decision
// =============================================================================

const StageDecision: React.FC<{
  state: CoaApprovalState;
  onChange: (s: CoaApprovalState) => void;
  upstream: UpstreamStates;
}> = ({ state, onChange, upstream }) => {
  const { coaDevState: cd, coaComparisonState: cc } = upstream;
  const d = state.decision;
  const setD = (updates: Partial<typeof d>) =>
    onChange({ ...state, decision: { ...d, ...updates } });

  const recommended = cd.coas.find(c => c.id === cc.recommendation.recommendedCoaId);
  const unprepared = state.briefSections.filter(s => !s.prepared).length;

  const toggleCoa = (id: string) => {
    const multi = d.type === 'combine' || d.type === 'select_different';
    if (multi) {
      setD({
        selectedCoaIds: d.selectedCoaIds.includes(id)
          ? d.selectedCoaIds.filter(x => x !== id)
          : [...d.selectedCoaIds, id],
      });
    } else {
      setD({ selectedCoaIds: d.selectedCoaIds.includes(id) ? [] : [id] });
    }
  };

  /** Choosing a decision pre-selects the staff recommendation where sensible. */
  const chooseType = (key: CommanderDecisionType) => {
    const wantsRecommended = key === 'concur' || key === 'concur_with_mods';
    setD({
      type: key,
      selectedCoaIds:
        wantsRecommended && recommended
          ? [recommended.id]
          : key === 'reject_all'
          ? []
          : d.selectedCoaIds,
    });
  };

  return (
    <div className="space-y-5">
      {unprepared > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-900/50 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-200/85 leading-relaxed">
            {unprepared} briefing section{unprepared === 1 ? '' : 's'} not yet marked prepared. The
            commander should receive the full decision brief before selecting a COA.
            <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-55</span>
          </p>
        </div>
      )}

      <SectionCard
        title="Before Deciding"
        subtitle="What the commander should do before selecting."
        doctrineRef="JP 5-0, IV-55 to IV-56"
      >
        <div className="space-y-1.5">
          {COMMANDER_REVIEW_ACTIONS.map(r => (
            <label
              key={r.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!d.reviewCompletion[r.id]}
                onChange={(e) =>
                  setD({
                    reviewCompletion: { ...d.reviewCompletion, [r.id]: e.target.checked },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[11px] leading-relaxed ${
                  d.reviewCompletion[r.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="The Decision"
        subtitle="Select one. The commander combines personal analysis with the staff recommendation."
        doctrineRef="JP 5-0, IV-56"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {COMMANDER_DECISION_OPTIONS.map(opt => {
            const selected = d.type === opt.key;
            const tone =
              opt.tone === 'approve'
                ? selected
                  ? 'bg-emerald-950/60 border-emerald-600'
                  : 'bg-slate-900/60 border-slate-800 hover:border-emerald-800'
                : opt.tone === 'reject'
                ? selected
                  ? 'bg-red-950/50 border-red-600'
                  : 'bg-slate-900/60 border-slate-800 hover:border-red-900'
                : selected
                ? 'bg-joint-950/70 border-joint-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-joint-800';
            const titleColor =
              opt.tone === 'approve'
                ? selected ? 'text-emerald-200' : 'text-slate-200'
                : opt.tone === 'reject'
                ? selected ? 'text-red-200' : 'text-slate-200'
                : selected ? 'text-joint-200' : 'text-slate-200';
            return (
              <button
                key={opt.key}
                onClick={() => chooseType(opt.key as CommanderDecisionType)}
                className={`text-left p-3 rounded-lg border transition ${tone}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${titleColor}`}>{opt.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed italic">
                  {opt.consequence}
                </p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Rejection callout — recorded, never destructive */}
      {d.type === 'reject_all' && (
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/60">
          <div className="flex items-start gap-2.5">
            <RotateCcw className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-red-200 font-semibold">
                Planning restarts. Nothing proceeds from this step.
              </p>
              <p className="text-[10px] text-red-200/75 mt-1 leading-relaxed">
                The rejection is recorded here. No data in earlier steps has been changed — return to
                the step below and rework from there.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                {([
                  ['step_3', 'Restart at Step 3 — COA Development'],
                  ['step_2', 'Restart at Step 2 — Mission Analysis'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setD({ restartAt: key })}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition ${
                      d.restartAt === key
                        ? 'bg-red-900/60 border-red-600 text-red-100'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-red-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COA selection */}
      {d.type !== 'undecided' && d.type !== 'reject_all' && (
        <SectionCard
          title={d.type === 'combine' ? 'COAs to Combine' : 'Selected COA'}
          subtitle={
            d.type === 'combine'
              ? 'Pick two or more COAs to combine into a new one.'
              : 'Where the objective cannot be determined until the crisis occurs, the JFC may carry more than one valid COA forward to higher authority.'
          }
          doctrineRef="JP 5-0, IV-54 / IV-56"
        >
          {cd.coas.length === 0 ? (
            <div className="p-6 text-center">
              <ShieldAlert className="w-7 h-7 text-amber-500/70 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                No COAs exist yet. Develop them in Step 3.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cd.coas.map(c => {
                const on = d.selectedCoaIds.includes(c.id);
                const isRec = c.id === cc.recommendation.recommendedCoaId;
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCoa(c.id)}
                    className={`px-3 py-2 rounded-lg border text-[11px] font-mono transition flex items-center gap-1.5 ${
                      on
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {on && <Check className="w-3 h-3" />}
                    {c.designator}
                    {c.name && <span className="text-slate-500 font-normal">— {c.name}</span>}
                    {isRec && (
                      <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                        STAFF REC
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* Decision detail */}
      {d.type !== 'undecided' && (
        <SectionCard title="Decision Record" doctrineRef="JP 5-0, IV-56">
          <div className="space-y-3">
            {d.type === 'concur_with_mods' && (
              <Field
                label="Directed modifications"
                value={d.modifications}
                onChange={(v) => setD({ modifications: v })}
                placeholder="Changes the staff must incorporate before the COA proceeds..."
              />
            )}
            {d.type === 'defer' && (
              <Field
                label="Consultation required before deciding"
                value={d.deferConsultation}
                onChange={(v) => setD({ deferConsultation: v })}
                placeholder="Who will be consulted, and by when..."
              />
            )}
            <Field
              label="Rationale"
              value={d.rationale}
              onChange={(v) => setD({ rationale: v })}
              placeholder="Why this decision — personal analysis combined with the staff recommendation..."
            />
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono text-slate-400">Decision DTG</label>
              <LineInput
                value={d.decidedDtg}
                onChange={(v) => setD({ decidedDtg: v })}
                placeholder="DDHHMMZ MON YY"
                className="w-40"
              />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// =============================================================================
// Stage 3: Decision Statement
// =============================================================================

const StageStatement: React.FC<{
  state: CoaApprovalState;
  onChange: (s: CoaApprovalState) => void;
  upstream: UpstreamStates;
  scenario: OperationalScenario;
}> = ({ state, onChange, upstream, scenario }) => {
  const ds = state.decisionStatement;
  const setDs = (updates: Partial<typeof ds>) =>
    onChange({ ...state, decisionStatement: { ...ds, ...updates } });

  const draft = draftDecisionStatement(
    upstream.coaDevState.coas,
    state.decision.selectedCoaIds,
    scenario
  );

  return (
    <div className="space-y-5">
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          The staff refines the commander&apos;s selection into a clear decision statement — a concise
          statement of how the commander intends to accomplish the mission, providing the focus for
          plan development.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-56</span>
        </p>
      </div>

      <SectionCard
        title="Decision Statement"
        subtitle="There is no defined format."
        doctrineRef="JP 5-0, IV-56"
      >
        {draft && !ds.statement && (
          <button
            onClick={() => setDs({ statement: draft })}
            className="mb-3 w-full py-2.5 rounded-lg border border-dashed border-joint-700 bg-joint-950/30 text-[11px] font-mono text-joint-200 hover:bg-joint-950/60 transition flex items-center justify-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Draft from the selected COA
          </button>
        )}
        <textarea
          value={ds.statement}
          onChange={(e) => setDs({ statement: e.target.value })}
          rows={6}
          placeholder="What the force is to do, with as much of when, where, and how as is appropriate..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed resize-none"
        />

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {DECISION_STATEMENT_RULES.map(r => (
            <div
              key={r.id}
              className="p-2 rounded bg-slate-900/50 border border-slate-800/60 text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5"
            >
              <span className="text-joint-500 mt-0.5">•</span>
              {r.label}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Acceptable Risk"
        subtitle="The decision statement must include a statement of what is acceptable risk."
        doctrineRef="JP 5-0, IV-56"
      >
        <Field
          label="Statement of acceptable risk"
          value={ds.acceptableRisk}
          onChange={(v) => setDs({ acceptableRisk: v })}
          rows={3}
        />
      </SectionCard>

      <SectionCard
        title="Final Acceptability Check"
        subtitle="Applied by the staff once the COA is selected."
        doctrineRef="JP 5-0, IV-57"
      >
        <div className="space-y-1.5">
          {ACCEPTABILITY_CHECK_ITEMS.map(a => (
            <label
              key={a.id}
              className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!ds.acceptabilityCheck[a.id]}
                onChange={(e) =>
                  setDs({
                    acceptabilityCheck: { ...ds.acceptabilityCheck, [a.id]: e.target.checked },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[11px] leading-relaxed ${
                  ds.acceptabilityCheck[a.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {a.label}
              </span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Stage 4: Commander's Estimate
// =============================================================================

const StageEstimate: React.FC<{
  state: CoaApprovalState;
  onChange: (s: CoaApprovalState) => void;
  upstream: UpstreamStates;
}> = ({ state, onChange, upstream }) => {
  const est = state.estimate;
  const setEst = (updates: Partial<typeof est>) =>
    onChange({ ...state, estimate: { ...est, ...updates } });

  return (
    <div className="space-y-5">
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Once the commander selects the COA, provides guidance, and updates intent, the staff
          completes the commander&apos;s estimate. In a rapidly developing situation a formal estimate
          may be impractical, and the entire estimate process may condense to a commanders&apos;
          conference. A typical format is in CJCSM 3130.03.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-57</span>
        </p>
      </div>

      <SectionCard
        title="Commander's Estimate"
        subtitle="A concise narrative of how the commander intends to accomplish the mission."
        doctrineRef="JP 5-0, IV-57"
      >
        <Field
          label="Narrative statement"
          value={est.narrative}
          onChange={(v) => setEst({ narrative: v })}
          rows={6}
        />
      </SectionCard>

      <SectionCard
        title="Refined Commander's Intent"
        subtitle="A key output of this step — carries into plan or order development."
        doctrineRef="JP 5-0, Fig IV-15"
      >
        {!est.refinedIntent && upstream.missionAnalysisState.commanderIntent && (
          <button
            onClick={() => setEst({ refinedIntent: upstream.missionAnalysisState.commanderIntent })}
            className="mb-3 w-full py-2.5 rounded-lg border border-dashed border-joint-700 bg-joint-950/30 text-[11px] font-mono text-joint-200 hover:bg-joint-950/60 transition flex items-center justify-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Start from the Step 2 intent statement
          </button>
        )}
        <Field
          label="Refined intent"
          value={est.refinedIntent}
          onChange={(v) => setEst({ refinedIntent: v })}
          rows={5}
        />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Higher Authority Approval"
          subtitle="Where military operations are strategically significant, the President or SecDef approves the COA."
          doctrineRef="JP 5-0, IV-57"
        >
          <label className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-joint-900 transition">
            <input
              type="checkbox"
              checked={est.higherApprovalRequired}
              onChange={(e) => setEst({ higherApprovalRequired: e.target.checked })}
              className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
            />
            <span className="text-[11px] text-slate-200 leading-relaxed">
              COA selection must be briefed to higher authority for approval
            </span>
          </label>
          {est.higherApprovalRequired && (
            <div className="mt-2.5">
              <LineInput
                value={est.higherApprovalAuthority}
                onChange={(v) => setEst({ higherApprovalAuthority: v })}
                placeholder="Approval authority (e.g., SecDef, President, CCDR)"
                className="w-full"
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Key Outputs Complete"
          subtitle={`${
            Object.values(state.outputCompletion).filter(Boolean).length
          } of ${COA_APPROVAL_KEY_OUTPUTS.length}. These feed plan or order development (Step 7).`}
          doctrineRef="JP 5-0, Fig IV-15"
        >
          <div className="space-y-1.5">
            {COA_APPROVAL_KEY_OUTPUTS.map(o => (
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
// Main Component — four-stage wizard
// =============================================================================

export const CoaApproval: React.FC<CoaApprovalProps> = ({
  onOpenExportModal,
}) => {
  const {
    scenario,
    coaApproval: state,
    setCoaApproval: onStateChange,
    missionAnalysis: missionAnalysisState,
    coaDevelopment: coaDevState,
    coaAnalysis: coaAnalysisState,
    coaComparison: coaComparisonState,
  } = usePlanning();
  const [generating, setGenerating] = useState(false);

  const upstream: UpstreamStates = {
    missionAnalysisState,
    coaDevState,
    coaAnalysisState,
    coaComparisonState,
  };

  const decided = state.decision.type !== 'undecided';
  /** Stages 3 and 4 are meaningless until a decision exists. */
  const isLocked = (stage: ApprovalStage) => stage >= 3 && !decided;

  const goTo = (stage: ApprovalStage) => {
    if (isLocked(stage)) return;
    onStateChange({ ...state, stage });
  };

  const preparedCount = state.briefSections.filter(s => s.prepared).length;
  const selectedLabel = useMemo(() => {
    const picked = coaDevState.coas.filter(c => state.decision.selectedCoaIds.includes(c.id));
    if (!picked.length) return '—';
    return picked.map(c => c.designator).join(' + ');
  }, [coaDevState.coas, state.decision.selectedCoaIds]);

  const decisionLabel =
    COMMANDER_DECISION_OPTIONS.find(o => o.key === state.decision.type)?.label || 'Undecided';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 6 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Ch IV, para 4.g</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Award className="w-5 h-5 text-joint-400" />
              COA Approval
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Brief the commander on comparison and wargaming results for Operation{' '}
              {scenario.operationName}, record the decision, and refine it into a clear decision
              statement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGenerating(true);
                setTimeout(() => setGenerating(false), 900);
              }}
              disabled={generating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 transition shadow-md shadow-emerald-950/40 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Synthesizing...' : 'AI Staff Assistant'}</span>
            </button>
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
              {preparedCount}
              <span className="text-slate-600 text-xs">/{state.briefSections.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Brief Prepared</div>
          </div>
          <div
            className={`p-2.5 rounded border text-center ${
              decided
                ? 'bg-emerald-950/30 border-emerald-900/60'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div
              className={`text-[11px] font-mono font-bold leading-tight pt-1 ${
                decided ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {decisionLabel}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono mt-1">Decision</div>
          </div>
          <div className="p-2.5 bg-joint-950/50 rounded border border-joint-800 text-center">
            <div className="text-lg font-mono font-bold text-joint-300">{selectedLabel}</div>
            <div className="text-[9px] text-joint-400 uppercase font-mono">Selected</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {Object.values(state.outputCompletion).filter(Boolean).length}
              <span className="text-slate-600 text-xs">/{COA_APPROVAL_KEY_OUTPUTS.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Outputs</div>
          </div>
        </div>

        {/* Stage rail */}
        <div className="flex items-center gap-2 mt-6 -mb-6 pb-6 overflow-x-auto">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            const active = state.stage === s.id;
            const locked = isLocked(s.id);
            const done = s.id < state.stage && !locked;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => goTo(s.id)}
                  disabled={locked}
                  title={locked ? 'Record the commander’s decision first' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition whitespace-nowrap ${
                    active
                      ? 'bg-joint-950 border-joint-500 text-white'
                      : locked
                      ? 'bg-slate-950/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                      : done
                      ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300 hover:border-emerald-700'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-joint-800'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      active
                        ? 'bg-joint-500 text-white'
                        : done
                        ? 'bg-emerald-600 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {done ? <Check className="w-3 h-3" /> : s.id}
                  </span>
                  {locked ? <Lock className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-mono font-medium">{s.label}</span>
                </button>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        {state.stage === 1 && (
          <StageBrief state={state} onChange={onStateChange} upstream={upstream} />
        )}
        {state.stage === 2 && (
          <StageDecision state={state} onChange={onStateChange} upstream={upstream} />
        )}
        {state.stage === 3 && (
          <StageStatement
            state={state}
            onChange={onStateChange}
            upstream={upstream}
            scenario={scenario}
          />
        )}
        {state.stage === 4 && (
          <StageEstimate state={state} onChange={onStateChange} upstream={upstream} />
        )}

        {/* Wizard navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <button
            onClick={() => goTo((state.stage - 1) as ApprovalStage)}
            disabled={state.stage === 1}
            className="px-3.5 py-2 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300 hover:border-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {state.stage < 4 && (
            <div className="flex items-center gap-3">
              {isLocked((state.stage + 1) as ApprovalStage) && (
                <span className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Record the commander&apos;s decision to continue
                </span>
              )}
              <button
                onClick={() => goTo((state.stage + 1) as ApprovalStage)}
                disabled={isLocked((state.stage + 1) as ApprovalStage)}
                className="px-4 py-2 rounded-lg border border-joint-600 bg-joint-950/70 text-[11px] font-mono font-bold text-joint-100 hover:bg-joint-900 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
