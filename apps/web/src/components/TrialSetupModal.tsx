'use client';

import React, { useMemo, useState } from 'react';
import { Download, FlaskConical, Play, ShieldCheck, Trash2, X } from 'lucide-react';
import { useTrial } from '@/context/TrialContext';
import { assignmentFor, participantNumber } from '@/lib/telemetry/design';
import { metricsFor, formatDuration } from '@/lib/telemetry/metrics';
import { exportSessionsCsv, exportSessionsJson } from '@/lib/telemetry/export';
import { clearArchive } from '@/lib/telemetry/session';
import { loadAssistantConfig } from '@/lib/assistant';

interface TrialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Enrolment and data export.
 *
 * The condition is derived from the participant code rather than chosen here.
 * An observer picking the arm by hand on the day is how counterbalancing
 * quietly stops being counterbalanced.
 */
export const TrialSetupModal: React.FC<TrialSetupModalProps> = ({ isOpen, onClose }) => {
  const { session, archive, start, refreshArchive } = useTrial();
  const [code, setCode] = useState('P01');
  const [run, setRun] = useState<1 | 2>(1);

  const number = participantNumber(code);
  const assignment = useMemo(() => assignmentFor(number)[run - 1], [number, run]);

  if (!isOpen) return null;

  const begin = () => {
    const cfg = loadAssistantConfig();
    start({
      participant: code,
      arm: assignment.arm,
      packet: assignment.packet,
      order: run,
      model: cfg.model,
      visionModel: cfg.visionModel,
    });
    onClose();
  };

  const completed = archive.filter(s => s.endedAt);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-amber-500">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Measured trial
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Time to initial WARNORD</h2>
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
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-emerald-200/85 leading-relaxed">
              Timing is recorded locally and never transmitted. What a participant types is never
              captured — an edit records the field&apos;s name and how many characters it ended up
              holding, nothing more. Use a participant code, not a name.
            </p>
          </div>

          {session ? (
            <div className="p-4 rounded-lg bg-amber-950/25 border border-amber-800/60">
              <p className="text-xs text-amber-200 font-semibold">
                {session.participant} is mid-run — {session.arm}, packet {session.packet}.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                End the running session from the bar at the bottom of the screen before enrolling
                another.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                    Participant code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="P01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                    Which run for this participant
                  </label>
                  <div className="flex gap-2">
                    {([1, 2] as const).map(n => (
                      <button
                        key={n}
                        onClick={() => setRun(n)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                          run === n
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-amber-700'
                        }`}
                      >
                        Run {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-700">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Assigned condition — derived, not chosen
                </p>
                {number > 0 ? (
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                        assignment.arm === 'tool'
                          ? 'bg-joint-900 text-joint-200 border border-joint-600'
                          : 'bg-slate-800 text-slate-200 border border-slate-600'
                      }`}
                    >
                      {assignment.arm === 'tool' ? 'JPE' : 'Current method'}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Packet {assignment.packet}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {assignment.arm === 'baseline'
                        ? 'Participant drafts in their usual word processor.'
                        : 'Participant drafts in the planning workspace.'}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-400">
                    Code needs a number in it, such as P03, so the condition can be assigned.
                  </p>
                )}
              </div>

              <button
                onClick={begin}
                disabled={number < 1 || !code.trim()}
                className="w-full px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Start session
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Completed runs on this machine — {completed.length}
              </p>
              {completed.length > 0 && (
                <button
                  onClick={() => {
                    clearArchive();
                    refreshArchive();
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {completed.length === 0 ? (
              <p className="text-[11px] text-slate-600">Nothing recorded yet.</p>
            ) : (
              <>
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-950 text-slate-500 font-mono">
                      <tr>
                        <th className="text-left px-2 py-1.5">Code</th>
                        <th className="text-left px-2 py-1.5">Arm</th>
                        <th className="text-left px-2 py-1.5">Pkt</th>
                        <th className="text-right px-2 py-1.5">To WARNORD</th>
                        <th className="text-right px-2 py-1.5">Active</th>
                        <th className="text-right px-2 py-1.5">AI wait</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {completed.map(s => {
                        const m = metricsFor(s);
                        return (
                          <tr key={s.id} className="border-t border-slate-800/80">
                            <td className="px-2 py-1.5 font-mono text-white">{s.participant}</td>
                            <td className="px-2 py-1.5">{s.arm}</td>
                            <td className="px-2 py-1.5">{s.packet}</td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                              {formatDuration(m.timeToWarnordMs)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums text-slate-400">
                              {formatDuration(m.activeMs)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono tabular-nums text-slate-400">
                              {m.aiInvocations ? formatDuration(m.aiWaitMs) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => exportSessionsJson(archive)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Raw JSON
                  </button>
                  <button
                    onClick={() => exportSessionsCsv(archive)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Sessions CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
