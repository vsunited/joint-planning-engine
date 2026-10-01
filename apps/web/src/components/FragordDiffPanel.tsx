'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  GitCompare,
  Loader2,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { AssistantError } from '@jpe/ai';
import { assistant } from '@/lib/assistant';
import { usePlanning } from '@/context/PlanningContext';
import { MissionTask } from '@/types/planning';
import { POPULATION_CHUNKS } from '@/lib/population/chunks';
import {
  deriveImpacts,
  diffDates,
  diffList,
  diffTasks,
  FragordDiff,
  TaskChange,
} from '@/lib/fragord/compare';

interface FragordDiffPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * What a fragmentary order changes about the plan.
 *
 * Answered by hand today — two orders side by side, under time pressure. The
 * assistant pulls the tasks and coordinating instructions out of the new
 * order; the comparison itself is deterministic, so the answer is the same
 * every time and cannot contain a change that is not in the document.
 *
 * Nothing is applied without a tick. Removals start unticked in particular,
 * because a fragmentary order usually restates only what it is changing and
 * silence is not an instruction to delete.
 */
export const FragordDiffPanel: React.FC<FragordDiffPanelProps> = ({ isOpen, onClose }) => {
  const state = usePlanning();
  const { scenario, echelon, missionAnalysis, planningInit, setMissionAnalysis } = state;

  const [sourceName, setSourceName] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [diff, setDiff] = useState<FragordDiff | null>(null);
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  const [applied, setApplied] = useState('');

  const readable = useMemo(
    () => scenario.uploadedDocuments.filter(d => d.text),
    [scenario.uploadedDocuments]
  );
  const directive = scenario.uploadedDocuments.find(d => d.role === 'directive');

  if (!isOpen) return null;

  const ctx = () => ({
    echelon,
    operationName: scenario.operationName,
    aorRegion: scenario.aorRegion,
    classification: scenario.classification,
    missionStatement: missionAnalysis.restatedMission.fullStatement,
  });

  const limitFields = POPULATION_CHUNKS.find(c => c.id === 'step1-guidance')!.fields.filter(f =>
    ['constraints', 'restraints'].includes(f.key)
  );

  const run = async (docName: string) => {
    const doc = scenario.uploadedDocuments.find(d => d.name === docName);
    if (!doc?.text) return;

    setRunning(true);
    setError('');
    setDiff(null);
    setApplied('');
    setSourceName(docName);

    try {
      setProgress('Reading tasks from the new order…');
      const incoming = await assistant.extractTasks(doc.text, ctx());

      setProgress('Reading its coordinating instructions…');
      const limits = await assistant.populateFields(limitFields, doc.text, true, ctx());
      const asList = (key: string): string[] => {
        const hit = limits.find(f => f.key === key);
        if (!hit) return [];
        return Array.isArray(hit.value) ? hit.value : [hit.value];
      };

      const base: Omit<FragordDiff, 'impacts'> = {
        tasks: diffTasks(missionAnalysis.tasks, incoming),
        constraints: diffList(planningInit.commanderGuidance.constraints, asList('constraints')),
        restraints: diffList(planningInit.commanderGuidance.restraints, asList('restraints')),
        dates: diffDates(directive?.text ?? '', doc.text),
      };

      const full: FragordDiff = {
        ...base,
        impacts: deriveImpacts(base, missionAnalysis.restatedMission.fullStatement),
      };

      /* Additions and rewordings are offered ticked; removals are not. */
      const defaults: Record<number, boolean> = {};
      full.tasks.forEach((c, i) => {
        defaults[i] = c.kind === 'added' || c.kind === 'reworded';
      });

      setDiff(full);
      setPicked(defaults);
    } catch (err) {
      setError(err instanceof AssistantError ? err.message : 'The order could not be compared.');
    } finally {
      setRunning(false);
      setProgress('');
    }
  };

  const apply = () => {
    if (!diff) return;
    let tasks = [...missionAnalysis.tasks];
    let added = 0;
    let changed = 0;
    let removed = 0;

    diff.tasks.forEach((c, i) => {
      if (!picked[i]) return;
      if (c.kind === 'added' && c.incoming) {
        tasks.push({
          id: `task-${Date.now().toString(36)}-${added}`,
          description: c.incoming.description,
          classification: c.incoming.classification,
          source: `${sourceName} — ${c.incoming.source}`,
          assignedTo: '',
          isEssential: c.incoming.isEssential,
          notes: '',
        });
        added += 1;
      }
      if (c.kind === 'reworded' && c.incoming && c.existing) {
        tasks = tasks.map(t =>
          t.id === c.existing!.id
            ? { ...t, description: c.incoming!.description, source: `${sourceName} — ${c.incoming!.source}` }
            : t
        );
        changed += 1;
      }
      if (c.kind === 'removed' && c.existing) {
        tasks = tasks.filter(t => t.id !== c.existing!.id);
        removed += 1;
      }
    });

    setMissionAnalysis({ ...missionAnalysis, tasks });
    setApplied(
      `Applied: ${added} added, ${changed} reworded, ${removed} removed. ` +
        'Constraints, restraints and dates are listed for you to carry across yourself.'
    );
  };

  const counts = diff
    ? {
        added: diff.tasks.filter(t => t.kind === 'added').length,
        reworded: diff.tasks.filter(t => t.kind === 'reworded').length,
        removed: diff.tasks.filter(t => t.kind === 'removed').length,
        unchanged: diff.tasks.filter(t => t.kind === 'unchanged').length,
      }
    : null;

  const badge = (k: TaskChange['kind']) =>
    k === 'added'
      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
      : k === 'removed'
      ? 'bg-red-950/60 text-red-300 border-red-800'
      : k === 'reworded'
      ? 'bg-amber-950/60 text-amber-300 border-amber-800'
      : 'bg-slate-900 text-slate-400 border-slate-700';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-amber-500">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-300">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Change analysis
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">What changed for {echelon.designation}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-auto flex-1">
          {!readable.length && (
            <p className="text-xs text-slate-400">
              No readable document is loaded. Upload the fragmentary order in scenario setup first.
            </p>
          )}

          {readable.length > 0 && !diff && !running && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                Pick the order that changed things. It is compared against the {missionAnalysis.tasks.length} task
                {missionAnalysis.tasks.length === 1 ? '' : 's'} already in the plan.
              </p>
              {readable.map(d => (
                <button
                  key={d.name}
                  onClick={() => run(d.name)}
                  className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-600 transition flex items-center gap-2.5"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {d.role === 'directive' ? 'Currently the directive' : 'Reference'} ·{' '}
                      {d.charCount.toLocaleString()} chars
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {running && (
            <p className="text-[11px] font-mono text-amber-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {progress}
            </p>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-200">{error}</p>
            </div>
          )}

          {diff && counts && (
            <>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                  {sourceName}
                </p>
                <p className="text-sm text-white">
                  {counts.added} new · {counts.reworded} reworded · {counts.removed} not restated ·{' '}
                  {counts.unchanged} unchanged
                </p>
              </div>

              {diff.impacts.map(i => (
                <div key={i} className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-800/60 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-200/90 leading-relaxed">{i}</p>
                </div>
              ))}

              {applied && (
                <div className="p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-800/60">
                  <p className="text-[11px] text-emerald-200">{applied}</p>
                </div>
              )}

              {diff.tasks
                .map((c, i) => ({ c, i }))
                .filter(({ c }) => c.kind !== 'unchanged')
                .map(({ c, i }) => (
                  <label
                    key={i}
                    className={`block p-3 rounded-lg border cursor-pointer transition ${
                      picked[i] ? 'bg-slate-900 border-amber-700/70' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!picked[i]}
                        onChange={() => setPicked(p => ({ ...p, [i]: !p[i] }))}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${badge(c.kind)}`}>
                          {c.kind === 'removed' ? 'not restated' : c.kind}
                        </span>
                        {c.kind === 'reworded' && c.existing && (
                          <p className="text-[10px] text-slate-500 mt-1.5 line-through">{c.existing.description}</p>
                        )}
                        <p className="text-[11px] text-slate-100 mt-1 flex items-start gap-1.5">
                          {c.kind === 'added' && <Plus className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />}
                          {c.kind === 'removed' && <Minus className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />}
                          {c.kind === 'reworded' && <ArrowRight className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />}
                          {c.incoming?.description || c.existing?.description}
                        </p>
                        {c.incoming?.isEssential && (
                          <span className="text-[9px] font-mono text-joint-300">ESSENTIAL</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}

              {(diff.constraints.added.length > 0 ||
                diff.restraints.added.length > 0 ||
                diff.dates.length > 0) && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Also changed — carry these across yourself
                  </p>
                  {diff.dates.map(d => (
                    <p key={d.label} className="text-[11px] text-slate-200">
                      <span className="font-mono text-amber-300">{d.label}</span>{' '}
                      {d.before ?? 'unset'} → {d.after}
                    </p>
                  ))}
                  {diff.constraints.added.map(c => (
                    <p key={c} className="text-[11px] text-slate-200">
                      <span className="font-mono text-emerald-300">+ constraint</span> {c}
                    </p>
                  ))}
                  {diff.restraints.added.map(r => (
                    <p key={r} className="text-[11px] text-slate-200">
                      <span className="font-mono text-emerald-300">+ restraint</span> {r}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setDiff(null);
              setError('');
              setApplied('');
            }}
            disabled={!diff || running}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-600 text-slate-200 text-xs font-semibold transition disabled:opacity-40"
          >
            Compare another
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition">
              Close
            </button>
            <button
              onClick={apply}
              disabled={!diff || !Object.values(picked).some(Boolean)}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
