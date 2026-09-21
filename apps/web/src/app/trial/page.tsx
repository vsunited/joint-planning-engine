'use client';

import React, { useState } from 'react';
import { FlaskConical, Settings2 } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { TrialProvider, useTrial } from '@/context/TrialContext';
import { TrialBar } from '@/components/TrialBar';
import { TrialSetupModal } from '@/components/TrialSetupModal';
import { TRIAL_PACKETS } from '@/lib/telemetry/packets';

/**
 * The baseline console.
 *
 * In the baseline arm the participant drafts the WARNORD however they do it
 * today — usually Word against a unit template — and this page supplies the
 * directive and the clock. Nothing about the planning workspace is on screen.
 *
 * Serving the packet from here rather than handing over paper is what makes
 * the two arms comparable: both conditions read the same text, rendered the
 * same way, and the moment it is opened is recorded the same way. A printed
 * packet in one arm and a screen in the other would put a reading-medium
 * difference inside the measurement.
 */
export default function TrialConsolePage() {
  return (
    <AuthGate>
      <TrialProvider>
        <BaselineConsole />
      </TrialProvider>
    </AuthGate>
  );
}

function BaselineConsole() {
  const { session } = useTrial();
  const [setupOpen, setSetupOpen] = useState(false);
  const packet = session ? TRIAL_PACKETS[session.packet] : null;

  return (
    <div className="min-h-screen bg-[#090d13] flex flex-col">
      <div className="border-b border-slate-800 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-300">
              <FlaskConical className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Trial console</h1>
              <p className="text-[10px] text-slate-500 font-mono">
                Current method — draft in your usual word processor
              </p>
            </div>
          </div>
          <button
            onClick={() => setSetupOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-600 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Sessions
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {packet ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Packet {packet.id}
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">{packet.operation}</h2>
              <p className="text-[10px] text-slate-500 font-mono">{packet.issuer}</p>
            </div>
            <pre className="p-6 text-[12px] leading-relaxed text-slate-200 font-mono whitespace-pre-wrap">
              {packet.body}
            </pre>
          </div>
        ) : (
          <div className="text-center py-24">
            <FlaskConical className="w-10 h-10 text-slate-700 mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-semibold">No session running</p>
            <p className="text-[11px] text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              Open Sessions to enrol a participant. The condition and packet are assigned from the
              participant code.
            </p>
          </div>
        )}
      </div>

      <TrialSetupModal isOpen={setupOpen} onClose={() => setSetupOpen(false)} />
      <TrialBar />
      {session && <div className="h-14" aria-hidden />}
    </div>
  );
}
