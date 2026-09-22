'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Building2, Check, Lock, Unlock, X } from 'lucide-react';
import {
  COMBATANT_COMMANDS,
  COMMAND_ECHELONS,
  describeChain,
  echelon as echelonDef,
} from '@jpe/shared';
import type { CombatantCommand, EchelonLevel, PlanningEchelon } from '@jpe/shared';
import { useEchelon } from '@/context/EchelonContext';
import { RELEVEL_CONSEQUENCES } from '@/lib/echelon';

interface EchelonSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sets, and then locks, the headquarters this installation plans as.
 *
 * Locked by default once confirmed. Re-levelling a staff mid-plan is not a
 * preference change: specified and implied tasks are classified relative to
 * this headquarters, and the restated mission takes its scope from the level.
 * So the unlock states what it costs before it is granted, rather than
 * quietly re-deriving work a planner has already accepted.
 */
export const EchelonSetupModal: React.FC<EchelonSetupModalProps> = ({ isOpen, onClose }) => {
  const { echelon, locked, confirm, unlock } = useEchelon();
  const [draft, setDraft] = useState<PlanningEchelon>(echelon);
  const [confirmingUnlock, setConfirmingUnlock] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(echelon);
      setConfirmingUnlock(false);
    }
  }, [isOpen, echelon]);

  if (!isOpen) return null;

  const def = echelonDef(draft.level);
  const valid = draft.designation.trim().length >= 2;

  const save = () => {
    confirm({ ...draft, designation: draft.designation.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                Installation setting
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Planning headquarters</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-auto">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
              Planning as
            </p>
            <p className="text-sm text-white">{describeChain(draft)}</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Plans {def?.plans.toLowerCase()}. Issues orders to {def?.issuesTo}.
            </p>
          </div>

          {locked && !confirmingUnlock ? (
            <>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-emerald-200/85 leading-relaxed">
                  Locked, so every JPP module plans at this level. Task classification, the restated
                  mission and order addressees all follow from it.
                </p>
              </div>
              <button
                onClick={() => setConfirmingUnlock(true)}
                className="w-full px-4 py-2 rounded-lg border border-amber-800 bg-amber-950/30 hover:bg-amber-950/50 text-amber-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" />
                Change headquarters
              </button>
            </>
          ) : locked && confirmingUnlock ? (
            <div className="p-4 rounded-lg bg-amber-950/25 border border-amber-800/60">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-200">
                    Changing the headquarters discards the current workspace.
                  </p>
                  <p className="text-[11px] text-amber-200/75 mt-1 leading-relaxed">
                    These are defined relative to this headquarters and cannot carry across:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {RELEVEL_CONSEQUENCES.map(c => (
                      <li key={c} className="text-[10px] text-amber-200/70 flex gap-1.5">
                        <span className="text-amber-500">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setConfirmingUnlock(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Keep current
                </button>
                <button
                  onClick={() => {
                    unlock();
                    setConfirmingUnlock(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                >
                  Unlock and edit
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Level</label>
                <select
                  value={draft.level}
                  onChange={e => setDraft({ ...draft, level: e.target.value as EchelonLevel })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500"
                >
                  {COMMAND_ECHELONS.map(l => (
                    <option key={l.key} value={l.key}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Designation
                  <span className="text-slate-600 ml-1.5">as written in an order</span>
                </label>
                <input
                  type="text"
                  value={draft.designation}
                  onChange={e => setDraft({ ...draft, designation: e.target.value })}
                  placeholder="CJTF-SEA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-joint-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Established by
                </label>
                <select
                  value={draft.establishedBy}
                  onChange={e =>
                    setDraft({ ...draft, establishedBy: e.target.value as CombatantCommand })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500"
                >
                  {COMBATANT_COMMANDS.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.multinational}
                  onChange={e => setDraft({ ...draft, multinational: e.target.checked })}
                  className="mt-0.5 accent-joint-500"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Combined (multinational) headquarters
                  <span className="block text-[10px] text-slate-500">
                    The C in CJTF. Changes who the staff coordinates with and how orders are
                    released.
                  </span>
                </span>
              </label>

              <button
                onClick={save}
                disabled={!valid}
                className="w-full px-5 py-2.5 rounded-lg bg-joint-600 hover:bg-joint-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm and lock
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
