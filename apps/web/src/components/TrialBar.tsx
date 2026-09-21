'use client';

import React, { useEffect, useState } from 'react';
import { CircleDot, FileText, FlagTriangleRight, Square, X } from 'lucide-react';
import { useTrial } from '@/context/TrialContext';
import { TRIAL_MILESTONES } from '@/lib/telemetry/types';
import { TRIAL_PACKETS } from '@/lib/telemetry/packets';
import { emit } from '@/lib/telemetry/probe';

/**
 * The observer's console during a run.
 *
 * Docked rather than modal: the participant works normally and the bar stays
 * visible, which also means nobody is timed without knowing it. Covert
 * measurement would be both an ethics problem and a data problem, since a
 * participant who later learns they were recorded is a participant whose
 * consent has to be withdrawn along with their data.
 *
 * The same bar serves both arms. In the baseline arm it is the whole interface
 * and the participant drafts in their usual word processor; in the tool arm it
 * sits under the planning workspace. Identical controls, identical wording and
 * one clock across both conditions.
 */
export const TrialBar: React.FC = () => {
  const { session, markMilestone, hasMilestone, end } = useTrial();
  const [elapsed, setElapsed] = useState('0:00');
  const [showPacket, setShowPacket] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!session) return;
    const started = new Date(session.startedAt).getTime();
    const tick = () => {
      const total = Math.max(0, Math.round((Date.now() - started) / 1000));
      const m = Math.floor(total / 60);
      setElapsed(`${m}:${(total % 60).toString().padStart(2, '0')}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session]);

  if (!session) return null;

  const packet = TRIAL_PACKETS[session.packet];

  const openPacket = () => {
    setShowPacket(true);
    emit('packet.view', { packet: session.packet });
    if (!hasMilestone('packet.opened')) markMilestone('packet.opened');
  };

  const finish = () => {
    end(notes);
    setClosing(false);
    setNotes('');
  };

  return (
    <>
      {showPacket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Packet {packet.id}
                </span>
                <h2 className="text-base font-bold text-white mt-1">{packet.operation}</h2>
                <p className="text-[10px] text-slate-500 font-mono">{packet.issuer}</p>
              </div>
              <button
                onClick={() => setShowPacket(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="p-5 overflow-auto text-[11px] leading-relaxed text-slate-200 font-mono whitespace-pre-wrap">
              {packet.body}
            </pre>
          </div>
        </div>
      )}

      {closing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">End session {session.participant}</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Record anything that would change how this run should be read — an interruption, a
                tool fault, a misunderstanding of the packet. Sessions with notes are still
                reported; excluding a run after seeing its number is how small trials go wrong.
              </p>
            </div>
            <div className="p-5">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Observer notes (optional)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setClosing(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Keep running
              </button>
              <button
                onClick={finish}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
              >
                End and archive
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 border-t-2 border-amber-600 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <CircleDot className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Trial recording
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 shrink-0">
            <span className="text-white font-bold">{session.participant}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
              {session.arm}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Packet {session.packet}
            </span>
            <span className="text-slate-500">run {session.order}</span>
          </div>

          <span className="text-lg font-mono font-bold text-white tabular-nums shrink-0">
            {elapsed}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {TRIAL_MILESTONES.map(m => {
              const done = hasMilestone(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => !done && markMilestone(m.id)}
                  disabled={done}
                  title={m.hint}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center gap-1.5 border ${
                    done
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300 cursor-default'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-600 hover:text-white'
                  }`}
                >
                  <FlagTriangleRight className="w-3 h-3" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openPacket}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3" />
              Packet
            </button>
            <button
              onClick={() => setClosing(true)}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 border border-red-700 hover:bg-red-800 text-red-100 text-[11px] font-semibold transition flex items-center gap-1.5"
            >
              <Square className="w-3 h-3" />
              End
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
