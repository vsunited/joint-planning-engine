'use client';

import React, { useState } from 'react';
import { JPP_PHASES, JOINT_FUNCTIONS } from '@jpe/shared';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  Clock, 
  Layers, 
  Copy,
  Presentation
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';

interface PhaseWizardProps {
  phaseId: number;
  scenario: OperationalScenario;
  onOpenExportModal: () => void;
}

export const PhaseWizard: React.FC<PhaseWizardProps> = ({ 
  phaseId, 
  scenario,
  onOpenExportModal 
}) => {
  const currentPhase = JPP_PHASES.find(p => p.id === phaseId) || JPP_PHASES[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'worksheets' | 'ai_synthesis' | 'deliverables'>('overview');
  const [commanderIntent, setCommanderIntent] = useState<string>(
    `Commander, ${scenario.jtfName} initiates multi-domain joint shaping operations in support of Operation ${scenario.operationName}. Joint forces will integrate air, maritime, land, cyber, and space capabilities under unified C2 to achieve regional deterrence and secure critical lines of communication.`
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      {/* Top Phase Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP {currentPhase.id} OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Chapter IV Reference</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              {currentPhase.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {phaseId === 1 && "Receive commander directives, issue the initial WARNORD, allocate staff planning time, and formulate the commander's initial planning guidance."}
              {phaseId === 2 && "Analyze higher HQ orders, develop specified/implied/essential tasks, evaluate CCIR/EEFIs, and formulate restated mission."}
              {phaseId === 3 && "Generate feasible, acceptable, suitable, distinguishable, and complete Courses of Action across all 7 Joint Functions."}
              {phaseId >= 4 && "Rigorous analytical evaluation, wargaming sync matrix generation, and decision brief formulation."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenExportModal}
              className="px-3.5 py-2 bg-joint-950/90 hover:bg-joint-900 text-joint-200 text-xs font-semibold rounded-lg border border-joint-700/80 hover:border-joint-500 transition flex items-center gap-1.5 shadow-sm"
            >
              <Presentation className="w-3.5 h-3.5 text-joint-400" />
              <span>Export Brief</span>
            </button>
          </div>
        </div>

        {/* Wizard Navigation Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6">
          {[
            { id: 'overview', label: 'Doctrinal Overview' },
            { id: 'worksheets', label: 'Staff Worksheet' },
            { id: 'ai_synthesis', label: 'Staff Estimates' },
            { id: 'deliverables', label: 'Required Deliverables' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-medium font-mono border-b-2 transition -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-joint-400 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="p-6 flex-1 flex flex-col">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5">
                <h4 className="text-xs font-mono font-bold text-joint-300 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-joint-400" /> 1/3 - 2/3 Rule Planning Timeline Allocation
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Per JP 5-0, staff allocates no more than <strong>one-third</strong> of available planning time prior to execution for internal JTF headquarters staff planning, reserving <strong>two-thirds</strong> for subordinate components (ARFOR, NAVFOR, AFFOR, MARFOR, JSOTF) to conduct their own operational planning.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-center font-mono">
                  <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total H-Hour Window</div>
                    <div className="text-sm font-bold text-white mt-0.5">72 Hours</div>
                  </div>
                  <div className="p-2.5 bg-joint-950/60 rounded border border-joint-800/80">
                    <div className="text-[10px] text-joint-300">JTF Staff Allocation (1/3)</div>
                    <div className="text-sm font-bold text-joint-200 mt-0.5">24 Hours</div>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Subordinate Units (2/3)</div>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">48 Hours</div>
                  </div>
                </div>
              </div>

              {/* Commander's Initial Guidance */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
                    Commander's Initial Guidance / Intent Draft
                  </label>
                  <span className="text-[10px] text-joint-400 font-mono">CDR {scenario.jtfName} GUIDANCE</span>
                </div>
                <textarea
                  value={commanderIntent}
                  onChange={(e) => setCommanderIntent(e.target.value)}
                  rows={4}
                  className="w-full mt-2 bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-joint-500 font-sans leading-relaxed transition"
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-mono">
                  <span>Grounding: JP 5-0 Section 3</span>
                </div>
              </div>
            </div>

            {/* Quick Staff Checklist */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Staff Gate Completion
              </h4>
              <div className="space-y-2.5 flex-1 text-xs">
                {[
                  { label: "Warning Order 1 (WARNORD 1) drafted & transmitted", done: true },
                  { label: `JTF Operational Planning Group (${scenario.jtfName} OPG) established`, done: true },
                  { label: "Joint Intelligence Preparation (JIPOE) initiated", done: false },
                  { label: "Component LNOs (ARFOR/NAVFOR/AFFOR) integrated", done: false },
                  { label: "Staff Running Estimates baseline populated", done: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-850">
                    <input
                      type="checkbox"
                      defaultChecked={item.done}
                      className="mt-0.5 rounded border-slate-700 text-joint-500 focus:ring-0 bg-slate-800"
                    />
                    <span className={`leading-tight ${item.done ? 'text-slate-300 line-through opacity-70' : 'text-slate-200'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Phase Progress</span>
                <span className="text-joint-300 font-bold">40%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'worksheets' && (
          <div className="p-8 text-center text-slate-400">
            <Layers className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">{scenario.jtfName} Staff Worksheets</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Specified, Implied, and Essential tasks matrices auto-linked to {scenario.uploadedDocuments.length} uploaded strategic documents.
            </p>
          </div>
        )}

        {activeTab === 'ai_synthesis' && (
          <div className="p-8 text-center text-slate-400">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">Staff Estimate Synthesis</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Not yet implemented for this step.
            </p>
          </div>
        )}

        {activeTab === 'deliverables' && (
          <div className="p-8 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">Doctrinal Deliverables</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Warning Order (WARNORD), Commander's Planning Guidance (CPG), and Initial Staff Estimates ready for briefing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
