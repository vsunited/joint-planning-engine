'use client';

import React, { useState } from 'react';
import { JPP_PHASES, JOINT_FUNCTIONS } from '@jpe/shared';
import { Header } from '@/components/Header';
import { ClassificationBar } from '@/components/ClassificationBar';
import { PhaseWizard } from '@/components/PhaseWizard';
import { 
  Shield, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Award, 
  FileText, 
  Sparkles,
  ChevronRight,
  Crosshair,
  Radio,
  Eye,
  Flame,
  Truck,
  FileCheck
} from 'lucide-react';

export default function HomePage() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const phaseIcons = [
    Radio,        // Phase 1: Initiation
    Eye,          // Phase 2: Mission Analysis
    Crosshair,    // Phase 3: COA Dev
    Layers,       // Phase 4: COA Analysis / Wargaming
    FileCheck,    // Phase 5: COA Comparison
    Award,        // Phase 6: COA Approval
    FileText,     // Phase 7: Order Production
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090d13]">
      {/* Classification Top Bar */}
      <ClassificationBar level="UNCLASSIFIED" />

      {/* Military Grade Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* JPP 7-Step Interactive Pipeline Strip */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              Joint Planning Process (JPP) Execution Pipeline
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Grounding: JP 5-0 (Joint Planning)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {JPP_PHASES.map((phase) => {
              const Icon = phaseIcons[phase.id - 1] || Shield;
              const isSelected = selectedPhase === phase.id;

              return (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[92px] group relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Step Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold transition ${
                      isSelected ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      STEP 0{phase.id}
                    </span>
                    <Icon className={`w-3.5 h-3.5 transition ${isSelected ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                  </div>

                  {/* Title */}
                  <div className="mt-2">
                    <div className={`text-xs font-semibold leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {phase.name.replace(`Phase ${['I','II','III','IV','V','VI','VII'][phase.id-1]}: `, '')}
                    </div>
                  </div>

                  {/* Active highlight glow indicator */}
                  {isSelected && (
                    <div className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-emerald-400 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase Workspace & Right Operations Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Left 3 Cols: Active Phase Interactive Wizard */}
          <div className="lg:col-span-3 flex flex-col">
            <PhaseWizard phaseId={selectedPhase} />
          </div>

          {/* Right Col: Joint Functions & Staff Estimate Trackers */}
          <div className="space-y-6 flex flex-col">
            {/* 7 Joint Functions Panel */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Joint Functions
                </h3>
                <span className="text-[10px] font-mono text-slate-500">JP 3-0</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Capabilities grouped to assist joint force commanders in integrating and synchronizing operations.
              </p>

              <div className="space-y-1.5">
                {JOINT_FUNCTIONS.map((func, idx) => (
                  <div
                    key={func}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-800 transition text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-mono text-[10px]">0{idx + 1}</span>
                      <span className="text-slate-200 font-medium text-[11px]">{func}</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Echelon Summary Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide mb-2">
                  Staff Synchronization Status
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>OPG Cadence</span>
                    <span className="font-mono text-slate-200">Every 12h</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Component LNOs</span>
                    <span className="font-mono text-emerald-400">5/5 Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>CCIR Thresholds</span>
                    <span className="font-mono text-slate-200">Active (4 PIRs)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    Officer Workload Reducer
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Automated doctrinal validation ensures staff orders and estimates comply with CJCS standards before commander presentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
