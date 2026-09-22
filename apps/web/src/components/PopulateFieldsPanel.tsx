'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Cpu,
  FileText,
  Loader2,
  Quote,
  Sparkles,
  X,
} from 'lucide-react';
import { AssistantError } from '@jpe/ai';
import type { PopulatedField } from '@jpe/ai';
import { assistant } from '@/lib/assistant';
import { usePlanning } from '@/context/PlanningContext';
import { POPULATION_CHUNKS, FieldValues } from '@/lib/population/chunks';
import { checkLevelConsistency, ConsistencyFlag } from '@/lib/population/consistency';

interface PopulateFieldsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: number;
}

/** A drafted field awaiting the planner's decision. */
interface Draft extends PopulatedField {
  chunkId: string;
  label: string;
  kind: 'text' | 'list';
  accepted: boolean;
  /** True when the field already held planner work. */
  wasOccupied: boolean;
}

/**
 * Drafts a step's fields from the directive, for the planner to verify.
 *
 * Every field arrives with the passage it came from and a decision attached.
 * Nothing is written until the planner accepts it, and anything that already
 * held their work arrives unticked — the assistant's job is to save typing,
 * not to overwrite judgement that has already been exercised.
 */
export const PopulateFieldsPanel: React.FC<PopulateFieldsPanelProps> = ({
  isOpen,
  onClose,
  stepId,
}) => {
  const state = usePlanning();
  const { scenario, echelon, setPlanningInit, setMissionAnalysis } = state;

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [flags, setFlags] = useState<ConsistencyFlag[]>([]);
  const [applied, setApplied] = useState(false);

  const chunks = useMemo(() => POPULATION_CHUNKS.filter(c => c.stepId === stepId), [stepId]);
  const directive = scenario.uploadedDocuments.find(d => d.role === 'directive');
  const source = directive ?? scenario.uploadedDocuments.find(d => d.text);

  if (!isOpen) return null;

  const ctx = () => ({
    echelon,
    operationName: scenario.operationName,
    aorRegion: scenario.aorRegion,
    classification: scenario.classification,
    missionStatement: state.missionAnalysis.restatedMission.fullStatement,
    commandersIntent: state.missionAnalysis.commanderIntent,
  });

  const run = async () => {
    if (!source?.text) {
      setError('Upload an order first. There is nothing to draft from.');
      return;
    }
    setRunning(true);
    setError('');
    setDrafts([]);
    setFlags([]);
    setApplied(false);

    const collected: Draft[] = [];
    try {
      for (const chunk of chunks) {
        setProgress(`Drafting ${chunk.label.toLowerCase()}…`);
        const occupied = chunk.occupied(state);
        const result = await assistant.populateFields(
          chunk.fields,
          source.text,
          source.role === 'directive',
          ctx()
        );
        result.forEach(f => {
          const spec = chunk.fields.find(x => x.key === f.key);
          if (!spec) return;
          collected.push({
            ...f,
            chunkId: chunk.id,
            label: spec.label,
            kind: spec.kind,
            wasOccupied: occupied.includes(f.key),
            /* Anything already holding planner work starts unticked. */
            accepted: !occupied.includes(f.key),
          });
        });
      }
      setDrafts(collected);
      if (!collected.length) {
        setError('The assistant could not support any field from this document.');
      }
    } catch (err) {
      setError(
        err instanceof AssistantError ? err.message : 'The fields could not be drafted.'
      );
    } finally {
      setRunning(false);
      setProgress('');
    }
  };

  const toggle = (i: number) =>
    setDrafts(d => d.map((x, j) => (j === i ? { ...x, accepted: !x.accepted } : x)));

  const edit = (i: number, value: string) =>
    setDrafts(d =>
      d.map((x, j) =>
        j === i ? { ...x, value: x.kind === 'list' ? value.split('\n').filter(Boolean) : value } : x
      )
    );

  const acceptAll = () => {
    const accepted = drafts.filter(d => d.accepted);
    if (!accepted.length) return;

    /*
     * Applied chunk by chunk against a state that carries the previous chunk's
     * patch, so two chunks touching the same step slice do not overwrite each
     * other — the second would otherwise be built from the pre-population
     * slice and silently drop the first.
     */
    let next = state;
    chunks.forEach(chunk => {
      const values: FieldValues = {};
      accepted
        .filter(d => d.chunkId === chunk.id)
        .forEach(d => {
          values[d.key] = d.value;
        });
      if (!Object.keys(values).length) return;
      next = { ...next, ...chunk.apply(next, values) };
    });

    setPlanningInit(next.planningInit);
    setMissionAnalysis(next.missionAnalysis);
    setFlags(checkLevelConsistency(next, echelon));
    setApplied(true);
  };

  const acceptedCount = drafts.filter(d => d.accepted).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                Step {stepId} — draft from source
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Populate fields for {echelon.designation}
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
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-joint-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              {source ? (
                <>
                  <p className="text-xs text-slate-200 truncate">{source.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {source.role === 'directive'
                      ? `The order that tasks ${echelon.designation}. Its taskings apply directly.`
                      : `Not addressed to ${echelon.designation} — treated as background, and it ` +
                        `cannot create specified tasks.`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  No document uploaded. Add the order in scenario setup first.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-200">{error}</p>
            </div>
          )}

          {applied && (
            <div
              className={`p-3 rounded-lg border ${
                flags.length
                  ? 'bg-amber-950/25 border-amber-800/60'
                  : 'bg-emerald-950/25 border-emerald-800/60'
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  flags.length ? 'text-amber-200' : 'text-emerald-200'
                }`}
              >
                {flags.length
                  ? `Accepted, with ${flags.length} thing${flags.length > 1 ? 's' : ''} to check`
                  : `Accepted. Everything reads as written for ${echelon.designation}.`}
              </p>
              {flags.map(f => (
                <p key={f.field} className="text-[10px] text-amber-200/80 mt-1.5 leading-relaxed">
                  <span className="font-semibold">{f.label}:</span> {f.detail}
                </p>
              ))}
            </div>
          )}

          {drafts.map((d, i) => (
            <div
              key={`${d.chunkId}:${d.key}`}
              className={`p-3 rounded-lg border transition ${
                d.accepted
                  ? 'bg-joint-950/25 border-joint-700/70'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.accepted}
                  onChange={() => toggle(i)}
                  className="mt-1 accent-joint-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-white">{d.label}</span>
                    {d.wasOccupied && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-900/60">
                        WOULD REPLACE YOUR WORK
                      </span>
                    )}
                  </div>
                  <textarea
                    value={Array.isArray(d.value) ? d.value.join('\n') : d.value}
                    onChange={e => edit(i, e.target.value)}
                    rows={Array.isArray(d.value) ? Math.min(d.value.length + 1, 6) : 3}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-100 leading-relaxed focus:outline-none focus:border-joint-500 resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 flex items-start gap-1.5">
                    <Quote className="w-3 h-3 mt-0.5 shrink-0" />
                    {d.evidence ? `“${d.evidence}”` : 'Inferred — not quoted from the source.'}
                  </p>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={run}
            disabled={running || !source?.text}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Cpu className="w-3.5 h-3.5" />
            )}
            {running ? progress || 'Drafting…' : drafts.length ? 'Draft again' : 'Draft from source'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">
              {drafts.length ? `${acceptedCount} of ${drafts.length} selected` : ''}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              onClick={acceptAll}
              disabled={!acceptedCount}
              className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Accept selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
