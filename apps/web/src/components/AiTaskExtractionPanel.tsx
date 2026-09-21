'use client';

import React, { useState } from 'react';
import { X, Cpu, Loader2, Check, AlertTriangle, Upload, Settings2 } from 'lucide-react';
import { AssistantError, ExtractedTask } from '@jpe/ai';
import { assistant } from '@/lib/assistant';
import { usePlanning } from '@/context/PlanningContext';
import { MissionTask } from '@/types/planning';

interface AiTaskExtractionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (tasks: MissionTask[]) => void;
  onOpenSettings: () => void;
}

/**
 * Extracts tasks from a higher-HQ order using the local assistant.
 *
 * Results are staged for review — the planner chooses which tasks enter the
 * plan. Nothing is written to planning state without an explicit accept.
 */
export const AiTaskExtractionPanel: React.FC<AiTaskExtractionPanelProps> = ({
  isOpen,
  onClose,
  onAccept,
  onOpenSettings,
}) => {
  const { scenario, missionAnalysis } = usePlanning();
  const [orderText, setOrderText] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ExtractedTask[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const readFile = async (file: File) => {
    const text = await file.text();
    setOrderText(text);
  };

  const run = async () => {
    setRunning(true);
    setError('');
    setResults(null);
    try {
      const tasks = await assistant.extractTasks(orderText, {
        jtfName: scenario.jtfName,
        operationName: scenario.operationName,
        higherHq: scenario.higherHq,
        aorRegion: scenario.aorRegion,
        classification: scenario.classification,
        missionStatement: missionAnalysis.restatedMission.fullStatement,
        commandersIntent: missionAnalysis.commanderIntent,
        enemyCog: missionAnalysis.jipoe.enemyCOG,
      });
      setResults(tasks);
      setSelected(new Set(tasks.map((_, i) => i)));
    } catch (err) {
      setError(
        err instanceof AssistantError
          ? err.message
          : 'Task extraction failed unexpectedly.'
      );
    } finally {
      setRunning(false);
    }
  };

  const accept = () => {
    if (!results) return;
    const chosen = results.filter((_, i) => selected.has(i));
    onAccept(
      chosen.map((t, i) => ({
        id: `task-ai-${Date.now()}-${i}`,
        description: t.description,
        classification: t.classification,
        source: t.source || 'Extracted from order',
        assignedTo: '',
        isEssential: t.isEssential,
        notes: t.rationale,
      }))
    );
    onClose();
  };

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                JP 5-0 — Task Analysis
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Extract Tasks from Order</h2>
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
          {!results && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-slate-400">
                    Order text — paste, or load a .txt / .md file
                  </label>
                  <label className="text-[10px] font-mono text-joint-300 hover:text-joint-200 cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    Load file
                    <input
                      type="file"
                      accept=".txt,.md,text/plain,text/markdown"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readFile(f);
                      }}
                    />
                  </label>
                </div>
                <textarea
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  rows={14}
                  placeholder="Paste the WARNORD, PLANORD or OPORD text here…"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-joint-500 resize-none"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {orderText.length.toLocaleString()} characters. Processed locally — this text does
                  not leave your network.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/25 border border-red-800/60 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-200/90 leading-relaxed">{error}</p>
                </div>
              )}
            </>
          )}

          {results && (
            <>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {results.length} task{results.length === 1 ? '' : 's'} identified. Review and
                  deselect anything that does not belong, then accept. These are a staff aid — the
                  planner owns the task list.
                </p>
              </div>

              <div className="space-y-2">
                {results.map((t, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selected.has(i)
                        ? 'bg-slate-900/70 border-joint-700/70'
                        : 'bg-slate-950/40 border-slate-800 opacity-55'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggle(i)}
                      className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            t.classification === 'specified'
                              ? 'bg-sky-950/60 text-sky-300 border-sky-900'
                              : 'bg-amber-950/60 text-amber-300 border-amber-900'
                          }`}
                        >
                          {t.classification.toUpperCase()}
                        </span>
                        {t.isEssential && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                            ESSENTIAL
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-100 mt-1.5 leading-snug">
                        {t.description}
                      </p>
                      {t.rationale && (
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          {t.rationale}
                        </p>
                      )}
                      {t.source && (
                        <p className="text-[9px] font-mono text-slate-600 mt-1">{t.source}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            {results ? `${selected.size} of ${results.length} selected` : 'Local inference'}
          </span>
          <div className="flex items-center gap-2">
            {results && (
              <button
                onClick={() => {
                  setResults(null);
                  setError('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Discard
            </button>
            {!results ? (
              <button
                onClick={run}
                disabled={running || !orderText.trim()}
                className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white text-xs font-bold transition shadow-lg shadow-joint-950 flex items-center gap-2 disabled:opacity-40"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    Extract tasks
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={accept}
                disabled={!selected.size}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-2 disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                Accept {selected.size} task{selected.size === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
