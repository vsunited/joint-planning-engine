'use client';

import React, { useState } from 'react';
import { JPP_PHASES, JOINT_FUNCTIONS } from '@jpe/shared';
import { Header } from '@/components/Header';
import { ClassificationBar } from '@/components/ClassificationBar';
import { PhaseWizard } from '@/components/PhaseWizard';
import { ScenarioSetupModal } from '@/components/ScenarioSetupModal';
import { ExportBriefModal } from '@/components/ExportBriefModal';
import { OperationalScenario } from '@/types/scenario';
import { 
  Shield, 
  Layers, 
  Radio,
  Eye,
  Crosshair,
  Award, 
  FileText, 
  Sparkles,
  FileCheck,
  FolderPlus
} from 'lucide-react';

export default function HomePage() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Operational Scenario State (Default initial scenario for demonstration)
  const [scenario, setScenario] = useState<OperationalScenario>({
    jtfName: 'JTF-Horn of Africa',
    operationName: 'Sentinel Resolve',
    commandingOfficer: 'MAJ D. Hess',
    officerRole: 'Lead J5 Operational Planner',
    serviceBranch: 'Joint Staff',
    operationalEchelon: 'Joint Task Force HQ',
    higherHq: 'USAFRICOM',
    aorRegion: 'Bab-el-Mandeb & Western Indian Ocean',
    classification: 'UNCLASSIFIED',
    uploadedDocuments: [
      {
        name: 'USAFRICOM_PLANORD_26-04.pdf',
        size: '4.20 MB',
        type: 'application/pdf',
        uploadedAt: '08:45',
      },
      {
        name: 'JIPOE_Red_Sea_Maritime_Threat_Estimate.pdf',
        size: '12.80 MB',
        type: 'application/pdf',
        uploadedAt: '09:12',
      },
    ],
  });

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
      <ClassificationBar level={scenario.classification} />

      {/* Military Grade Header with Joint Theme & Scenario Setup Modal Trigger */}
      <Header 
        scenario={scenario} 
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)} 
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* JPP 7-Step Interactive Pipeline Strip */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-joint-300 font-mono flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-joint-400" />
              Joint Planning Process (JPP) Execution Pipeline
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsScenarioModalOpen(true)}
                className="text-[11px] font-mono text-joint-300 hover:text-joint-200 flex items-center gap-1 underline underline-offset-2"
              >
                <FolderPlus className="w-3 h-3" />
                <span>Configure JTF Directives</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono">
                JP 5-0 Joint Standard
              </span>
            </div>
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
                      ? 'bg-gradient-to-b from-joint-950/90 via-slate-900 to-slate-900 border-joint-500 shadow-lg shadow-joint-950/40'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-joint-800 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Step Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold transition ${
                      isSelected ? 'bg-joint-500 text-white shadow-sm' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      STEP 0{phase.id}
                    </span>
                    <Icon className={`w-3.5 h-3.5 transition ${isSelected ? 'text-joint-300' : 'text-slate-600 group-hover:text-slate-400'}`} />
                  </div>

                  {/* Title */}
                  <div className="mt-2">
                    <div className={`text-xs font-semibold leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {phase.name.replace(`Phase ${['I','II','III','IV','V','VI','VII'][phase.id-1]}: `, '')}
                    </div>
                  </div>

                  {/* Active Joint Purple highlight bar */}
                  {isSelected && (
                    <div className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-joint-400 shadow-sm" />
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
            <PhaseWizard 
              phaseId={selectedPhase} 
              scenario={scenario} 
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>

          {/* Right Col: Joint Functions & Staff Estimate Trackers */}
          <div className="space-y-6 flex flex-col">
            {/* 7 Joint Functions Panel with Tactical Purple Highlights */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-joint-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-joint-400" />
                  7 Joint Functions
                </h3>
                <span className="text-[10px] font-mono text-slate-500">JP 3-0</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Doctrinal capabilities integrating multi-domain actions across {scenario.jtfName}.
              </p>

              <div className="space-y-1.5">
                {JOINT_FUNCTIONS.map((func, idx) => (
                  <div
                    key={func}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-joint-800/80 transition text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-joint-400 font-mono text-[10px]">0{idx + 1}</span>
                      <span className="text-slate-200 font-medium text-[11px]">{func}</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-joint-400"></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Orders Ingested Status Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Higher HQ Directives</span>
                  <span className="text-[10px] text-joint-400 font-mono font-normal">
                    {scenario.uploadedDocuments.length} Ingested
                  </span>
                </h4>
                <div className="space-y-2 text-xs">
                  {scenario.uploadedDocuments.slice(0, 3).map((doc, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                      <div className="truncate text-slate-300 text-[11px] max-w-[160px]">
                        {doc.name}
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-900/60">
                        PARSED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setIsScenarioModalOpen(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-joint-300 text-xs font-mono font-semibold rounded-lg border border-slate-700 hover:border-joint-600 transition flex items-center justify-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Manage Ingested Orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario & Orders Setup Modal */}
      <ScenarioSetupModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentScenario={scenario}
        onSave={(updated) => setScenario(updated)}
      />

      {/* Export Staff Brief Modal */}
      <ExportBriefModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activePhaseId={selectedPhase}
        scenario={scenario}
      />
    </div>
  );
}
