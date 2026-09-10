'use client';

import React, { useState } from 'react';
import { JPP_PHASES, JOINT_FUNCTIONS } from '@jpe/shared';
import { Shield, BookOpen, Layers, CheckCircle, Award, FileText, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const phaseIcons = [
    Shield,
    BookOpen,
    Layers,
    CheckCircle,
    Award,
    CheckCircle,
    FileText,
  ];

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded font-mono font-medium">
              JPP DOCTRINE JP 5-0
            </span>
            <span className="text-slate-400 text-xs font-mono">v0.1.0-alpha</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            JOINT PLANNING ENGINE
          </h1>
          <p className="text-sm text-slate-400">
            Joint Planning Process execution & staff estimates engine for Joint Task Force operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-slate-400">Auth Status</div>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Dev Auth Abstraction (CAC Ready)
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-md border border-slate-700 transition">
            Sign In / Profile
          </button>
        </div>
      </div>

      {/* 7 JPP Phases Pipeline Bar */}
      <div className="my-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          JPP 7-Step Planning Pipeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {JPP_PHASES.map((phase) => {
            const Icon = phaseIcons[phase.id - 1] || Shield;
            const isSelected = selectedPhase === phase.id;

            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between min-h-[96px] ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    STEP {phase.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div className="mt-2">
                  <div className={`text-xs font-semibold leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {phase.name.replace(`Phase ${['I','II','III','IV','V','VI','VII'][phase.id-1]}: `, '')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Cols: Active Phase Workspace */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                Active Phase Overview
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {JPP_PHASES[selectedPhase - 1]?.name}
              </h3>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition">
              Launch Wizard <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-6 flex-1 flex flex-col justify-center items-center text-center px-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-white">Phase Module Initialized</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Ready to generate staff estimates, running estimates, and tactical tasks mapped to the 7 Joint Functions.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Grounding: JP 5-0 (Joint Planning)</span>
            <span>Security: RBAC Enforced</span>
          </div>
        </div>

        {/* Right Col: Joint Functions & Mission Context */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
            7 Joint Functions (JP 3-0)
          </h3>
          <div className="space-y-2 flex-1">
            {JOINT_FUNCTIONS.map((func, idx) => (
              <div
                key={func}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px]">0{idx + 1}</span>
                  <span className="text-slate-200 font-medium">{func}</span>
                </div>
                <span className="text-[10px] text-emerald-500/80 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/60 border border-amber-900/30 rounded p-3 text-[11px] text-slate-400">
              <span className="text-amber-400 font-bold block mb-1">CAC Auth Ready Notice</span>
              Auth interface is structured for DoD ICAM SAML / client mTLS certificate federation without modifying database rules or phase schemas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
