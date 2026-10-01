'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Cpu, Link2, Loader2, Target, X } from 'lucide-react';
import { AssistantError } from '@jpe/ai';
import type { ProposedCcir } from '@jpe/ai';
import { assistant } from '@/lib/assistant';
import { usePlanning } from '@/context/PlanningContext';
import { CcirItem, MissionAnalysisState } from '@/types/planning';

interface CcirDerivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: MissionAnalysisState;
  onChange: (next: MissionAnalysisState) => void;
}

/**
 * Derives a critical information requirement for each assumption.
 *
 * An assumption is something the plan needs to be true but which nobody has
 * confirmed. Doctrine answers that with a CCIR — a question whose answer
 * either validates the assumption or kills it in time to change the plan. In
 * practice the CCIR tab is the one most often left half-finished, because
 * writing fifteen requirements by hand is tedious at exactly the moment a
 * staff has no time.
 *
 * The link is the point. Each accepted requirement is attached to the
 * assumption it came from, so the two move together afterwards.
 */
export const CcirDerivePanel: React.FC<CcirDerivePanelProps> = ({
  isOpen,
  onClose,
  state,
  onChange,
}) => {
  const { scenario, echelon } = usePlanning();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [proposed, setProposed] = useState<ProposedCcir[]>([]);
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState('');

  /* Only assumptions nobody is already checking. */
  const open = useMemo(
    () => state.assumptions.filter(a => a.description.trim() && !a.linkedCcir),
    [state.assumptions]
  );

  if (!isOpen) return null;

  const run = async () => {
    setRunning(true);
    setError('');
    setProposed([]);
    setDone('');
    try {
      const result = await assistant.proposeCcirs(
        open.map(a => a.description),
        {
          echelon,
          operationName: scenario.operationName,
          aorRegion: scenario.aorRegion,
          classification: scenario.classification,
          missionStatement: state.restatedMission.fullStatement,
        }
      );
      setProposed(result);
      setPicked(Object.fromEntries(result.map((_, i) => [i, true])));
    } catch (err) {
      setError(
        err instanceof AssistantError ? err.message : 'The requirements could not be derived.'
      );
    } finally {
      setRunning(false);
    }
  };

  const accept = () => {
    const ccirs: CcirItem[] = [...state.ccirs];
    const assumptions = [...state.assumptions];
    let n = 0;

    proposed.forEach((p, i) => {
      if (!picked[i]) return;
      const id = `ccir-${Date.now().toString(36)}-${n}`;
      ccirs.push({
        id,
        type: p.type,
        priority: ccirs.filter(c => c.type === p.type).length + 1,
        question: p.question,
        indicator: p.indicator,
        collectionAsset: '',
        ltiov: '',
        status: 'active',
      });

      /* Attach it to the assumption so neither drifts from the other. */
      const idx = assumptions.findIndex(a => a.description === p.assumption && !a.linkedCcir);
      if (idx >= 0) assumptions[idx] = { ...assumptions[idx], linkedCcir: id };
      n += 1;
    });

    onChange({ ...state, ccirs, assumptions });
    setDone(`${n} requirement${n === 1 ? '' : 's'} added and linked to ${n === 1 ? 'its' : 'their'} assumption${n === 1 ? '' : 's'}.`);
    setProposed([]);
  };

  const chosen = Object.values(picked).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                JP 5-0 — CCIRs
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Derive requirements from assumptions
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-auto flex-1">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            An assumption the plan depends on needs a requirement that will confirm it or kill it
            early enough to change the plan. {open.length} assumption
            {open.length === 1 ? ' has' : 's have'} no requirement attached.
          </p>

          {!open.length && (
            <p className="text-xs text-slate-400">
              Every assumption already has a requirement, or none have been recorded yet. Add
              assumptions on the Facts &amp; Assumptions tab first.
            </p>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-200">{error}</p>
            </div>
          )}

          {done && (
            <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-800/60">
              <p className="text-[11px] text-emerald-200">{done}</p>
            </div>
          )}

          {proposed.map((p, i) => (
            <label
              key={i}
              className={`block p-3 rounded-lg border cursor-pointer transition ${
                picked[i] ? 'bg-joint-950/25 border-joint-700/70' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={!!picked[i]}
                  onChange={() => setPicked(s => ({ ...s, [i]: !s[i] }))}
                  className="mt-1 accent-joint-500"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      p.type === 'PIR'
                        ? 'bg-joint-950 text-joint-300 border-joint-800'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {p.type}
                  </span>
                  <p className="text-[11px] text-white mt-1.5 font-medium">{p.question}</p>
                  {p.indicator && (
                    <p className="text-[10px] text-slate-400 mt-1">Indicator: {p.indicator}</p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-start gap-1.5">
                    <Link2 className="w-3 h-3 mt-0.5 shrink-0" />
                    {p.assumption}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={run}
            disabled={running || !open.length}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            {running ? 'Deriving…' : proposed.length ? 'Derive again' : 'Derive requirements'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              onClick={accept}
              disabled={!chosen}
              className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Accept {chosen || ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
