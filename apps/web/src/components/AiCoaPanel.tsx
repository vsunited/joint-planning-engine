'use client';

import React, { useState } from 'react';
import { X, Cpu, Loader2, Check, AlertTriangle, Settings2, ShieldCheck } from 'lucide-react';
import { AssistantError, CoaCritique, DraftedCoa } from '@jpe/ai';
import { COA_VALIDITY_CRITERIA } from '@jpe/shared';
import { assistant } from '@/lib/assistant';
import { usePlanning } from '@/context/PlanningContext';
import { CourseOfAction, CoaValidityKey } from '@/types/planning';

type Mode = 'draft' | 'critique';

interface AiCoaPanelProps {
  isOpen: boolean;
  mode: Mode;
  /** Required for critique; the COA under assessment. */
  coa?: CourseOfAction;
  onClose: () => void;
  onAcceptDraft: (draft: DraftedCoa) => void;
  onAcceptCritique: (critique: CoaCritique) => void;
  onOpenSettings: () => void;
}

/** Serialises a COA into the text the assistant assesses. */
function coaToText(coa: CourseOfAction): string {
  const s = coa.statement;
  const c = coa.conops;
  return [
    `${coa.designator}${coa.name ? ` — ${coa.name}` : ''}`,
    coa.narrative && `Narrative: ${coa.narrative}`,
    `Who: ${s.who}`,
    `What: ${s.what}`,
    `Where: ${s.where}`,
    `When: ${s.when}`,
    `Decision points: ${s.decisionPoints}`,
    `How: ${s.how}`,
    `Why: ${s.why}`,
    `Assessment: ${s.assessment}`,
    `Intelligence support: ${s.intelConcept}`,
    `Objectives: ${c.objectives}`,
    `Essential tasks: ${c.essentialTasks}`,
    `Forces and capabilities: ${c.forcesCapabilities}`,
    `Timeline: ${c.integratedTimeline}`,
    `Task organization: ${c.taskOrganization}`,
    `Operational concept: ${c.operationalConcept}`,
    `Sustainment: ${c.sustainmentConcept}`,
    `Deployment: ${c.deploymentConcept}`,
    `Risk: ${c.risk}`,
    `Main and supporting efforts: ${c.mainSupportingEfforts}`,
    `Main effort focus: ${coa.distinguishability.mainEffort}`,
    `Scheme of maneuver: ${coa.distinguishability.scheme}`,
    `Sequencing: ${coa.distinguishability.sequencing}`,
    `Reserves: ${coa.distinguishability.reserves}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export const AiCoaPanel: React.FC<AiCoaPanelProps> = ({
  isOpen,
  mode,
  coa,
  onClose,
  onAcceptDraft,
  onAcceptCritique,
  onOpenSettings,
}) => {
  const { scenario, echelon, missionAnalysis, coaDevelopment } = usePlanning();
  const [guidance, setGuidance] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<DraftedCoa | null>(null);
  const [critique, setCritique] = useState<CoaCritique | null>(null);

  if (!isOpen) return null;

  const ctx = {
    echelon,
    operationName: scenario.operationName,
    aorRegion: scenario.aorRegion,
    classification: scenario.classification,
    missionStatement: missionAnalysis.restatedMission.fullStatement,
    commandersIntent: missionAnalysis.commanderIntent,
    enemyCog: missionAnalysis.jipoe.enemyCOG || coaDevelopment.cog.enemyCog,
    enemyMlcoa: missionAnalysis.jipoe.mlcoa,
    enemyMdcoa: missionAnalysis.jipoe.mdcoa,
    essentialTasks: missionAnalysis.tasks.filter(t => t.isEssential).map(t => t.description),
    /*
     * When drafting, every existing COA matters — the new one must be
     * distinguishable from all of them. When critiquing, exclude the COA under
     * assessment so it is not compared against itself.
     */
    existingCoaSummaries: coaDevelopment.coas
      .filter(c => (mode === 'critique' ? c.id !== coa?.id : true))
      .map(c => `${c.designator}: ${c.statement.what || c.narrative || 'no statement recorded'}`),
  };

  const run = async () => {
    setRunning(true);
    setError('');
    setDraft(null);
    setCritique(null);
    try {
      if (mode === 'draft') {
        setDraft(await assistant.draftCoa(guidance, ctx));
      } else if (coa) {
        setCritique(await assistant.critiqueCoa(coaToText(coa), ctx));
      }
    } catch (err) {
      setError(err instanceof AssistantError ? err.message : 'The request failed unexpectedly.');
    } finally {
      setRunning(false);
    }
  };

  const failCount = critique
    ? COA_VALIDITY_CRITERIA.filter(
        c => critique[c.key as CoaValidityKey]?.status === 'fail'
      ).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              {mode === 'draft' ? <Cpu className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                {mode === 'draft' ? 'JP 5-0, IV-30 / IV-37' : 'JP 5-0, IV-37 to IV-39'}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {mode === 'draft'
                  ? 'Draft a Course of Action'
                  : `Validity Critique — ${coa?.designator ?? ''}`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              title="Assistant settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'draft' && !draft && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Commander&apos;s guidance for this COA
                <span className="text-slate-600 ml-1.5">optional</span>
              </label>
              <textarea
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                rows={5}
                placeholder="Any direction shaping this COA — emphasis, constraints, what to vary from the others…"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-joint-500 resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                The draft is constrained to the nine COA statement questions and the thirteen CONOPS
                elements, and must be distinguishable from the {ctx.existingCoaSummaries.length} COA
                {ctx.existingCoaSummaries.length === 1 ? '' : 's'} already developed.
              </p>
            </div>
          )}

          {mode === 'critique' && !critique && (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {coa?.designator} will be assessed against all five validity criteria and their 25
                doctrinal sub-tests. A COA failing any one criterion is not valid and must be
                rejected or revised.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/25 border border-red-800/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-200/90 leading-relaxed">{error}</p>
            </div>
          )}

          {draft && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Draft only. Accepting adds a new COA to Step 3 for you to edit — it is not a
                  finished product and has not been validity-tested.
                </p>
              </div>
              {draft.name && (
                <div className="text-sm font-bold text-white">{draft.name}</div>
              )}
              {draft.narrative && (
                <p className="text-[11px] text-slate-300 leading-relaxed">{draft.narrative}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(draft.statement)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <div className="text-[9px] font-mono text-joint-400 uppercase mb-1">{k}</div>
                      <p className="text-[11px] text-slate-200 leading-snug">{v}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {critique && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg border ${
                  failCount > 0
                    ? 'bg-red-950/25 border-red-800/60'
                    : 'bg-emerald-950/25 border-emerald-800/60'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold ${
                    failCount > 0 ? 'text-red-200' : 'text-emerald-200'
                  }`}
                >
                  {failCount > 0
                    ? `Fails ${failCount} of 5 criteria — reject or revise before COA analysis.`
                    : 'Satisfies all five validity criteria.'}
                </p>
                {critique.overall && (
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                    {critique.overall}
                  </p>
                )}
              </div>

              {COA_VALIDITY_CRITERIA.map(c => {
                const v = critique[c.key as CoaValidityKey];
                if (!v) return null;
                const failed = v.status === 'fail';
                return (
                  <div
                    key={c.key}
                    className={`p-3 rounded-lg border ${
                      failed
                        ? 'bg-red-950/20 border-red-900/60'
                        : 'bg-emerald-950/10 border-emerald-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          failed
                            ? 'bg-red-600 text-slate-950'
                            : 'bg-emerald-600 text-slate-950'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-white">{c.label}</span>
                    </div>
                    {v.rationale && (
                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {v.rationale}
                      </p>
                    )}
                    {v.failedSubTests.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {v.failedSubTests.map((t, i) => (
                          <li
                            key={i}
                            className="text-[10px] text-red-300/85 leading-relaxed flex items-start gap-1.5"
                          >
                            <span className="mt-0.5">✕</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            Local inference · staff aid, not a decision
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Discard
            </button>
            {!draft && !critique ? (
              <button
                onClick={run}
                disabled={running}
                className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white text-xs font-bold transition shadow-lg shadow-joint-950 flex items-center gap-2 disabled:opacity-40"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {mode === 'draft' ? 'Drafting…' : 'Assessing…'}
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    {mode === 'draft' ? 'Draft COA' : 'Run critique'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (draft) onAcceptDraft(draft);
                  if (critique) onAcceptCritique(critique);
                  onClose();
                }}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                {draft ? 'Add as new COA' : 'Apply to validity test'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
