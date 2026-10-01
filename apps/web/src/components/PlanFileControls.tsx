'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, FolderOpen, Save } from 'lucide-react';
import type { PlanningState } from '@/context/PlanningContext';
import { usePlanning } from '@/context/PlanningContext';
import { useEchelon } from '@/context/EchelonContext';
import { downloadText } from '@/lib/download';
import { fromPlanFile, planFilename, toPlanFile } from '@/lib/plan/serialize';
import { flushAutosave } from '@/lib/plan/autosave';

interface PlanFileControlsProps {
  /** A clean workspace to read a file onto, built for a given headquarters. */
  baseline: (state: PlanningState) => PlanningState;
}

/**
 * Save the plan to a file, and open one back.
 *
 * The file is written to the planner's own disk and never uploaded, so a plan
 * stays inside the boundary it was made in. It is also what makes the plan
 * handed to the next shift the same plan rather than a description of one.
 */
export const PlanFileControls: React.FC<PlanFileControlsProps> = ({ baseline }) => {
  const state = usePlanning();
  const { resetPlanning } = state;
  const { echelon, confirm } = useEchelon();
  const input = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');
  const [problem, setProblem] = useState('');

  const save = () => {
    const file = toPlanFile(state);
    downloadText(planFilename(state), JSON.stringify(file, null, 2), 'application/json');
    flushAutosave(state);
    setProblem('');
    setNote(`Saved ${planFilename(state)}`);
  };

  const open = async (f: File) => {
    setNote('');
    setProblem('');
    /*
     * Parsed separately so a corrupt file reports something a planner can act
     * on. The raw parser message — "Unexpected token n in JSON at position 2"
     * — tells them nothing about which file to go and look at.
     */
    let parsed: unknown;
    try {
      parsed = JSON.parse(await f.text());
    } catch {
      setProblem(`${f.name} is not readable JSON. It may be corrupt or the wrong file.`);
      return;
    }

    try {
      const { state: loaded, warnings } = fromPlanFile(parsed, baseline(state));

      /*
       * Adopt the plan's headquarters before loading it.
       *
       * The workspace re-levels whenever the installation echelon and the
       * plan's echelon disagree, and re-levelling discards derived work. Doing
       * this second would therefore throw away the plan that had just been
       * opened. Setting both in the same handler leaves them agreeing, so
       * nothing is discarded.
       */
      const sameHq =
        loaded.echelon.designation === echelon.designation &&
        loaded.echelon.establishedBy === echelon.establishedBy &&
        loaded.echelon.level === echelon.level;
      if (!sameHq) confirm(loaded.echelon);

      resetPlanning(loaded);
      flushAutosave(loaded);

      const messages = [...warnings];
      if (!sameHq) {
        messages.push(
          `This plan was made as ${loaded.echelon.designation} under ${loaded.echelon.establishedBy}. ` +
            'The workspace has been set to that headquarters.'
        );
      }
      setNote(messages.length ? messages.join(' ') : `Opened ${f.name}.`);
    } catch (err) {
      setProblem((err as Error)?.message || 'That file could not be read.');
    }
  };

  return (
    <>
      <button
        onClick={save}
        title="Write this plan to a file on your machine"
        className="text-[11px] font-mono text-joint-300 hover:text-joint-200 flex items-center gap-1 underline underline-offset-2"
      >
        <Save className="w-3 h-3" />
        <span>Save plan</span>
      </button>
      <button
        onClick={() => input.current?.click()}
        title="Open a saved plan"
        className="text-[11px] font-mono text-joint-300 hover:text-joint-200 flex items-center gap-1 underline underline-offset-2"
      >
        <FolderOpen className="w-3 h-3" />
        <span>Open plan</span>
      </button>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          /* Cleared so reopening the same file fires a change event again. */
          e.target.value = '';
          if (f) open(f);
        }}
      />
      {problem && (
        <span className="text-[10px] text-red-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {problem}
        </span>
      )}
      {!problem && note && <span className="text-[10px] text-slate-400">{note}</span>}
    </>
  );
};
