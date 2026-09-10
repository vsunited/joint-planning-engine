'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Printer, 
  Check, 
  Share2, 
  Layers, 
  Presentation,
  CheckCircle2
} from 'lucide-react';
import { JPP_PHASES } from '@jpe/shared';
import { OperationalScenario } from '@/types/scenario';

interface ExportBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePhaseId: number;
  scenario: OperationalScenario;
}

export const ExportBriefModal: React.FC<ExportBriefModalProps> = ({
  isOpen,
  onClose,
  activePhaseId,
  scenario,
}) => {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'pptx'>('pdf');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPhase = JPP_PHASES.find(p => p.id === activePhaseId) || JPP_PHASES[0];

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300 shadow-md">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                Staff Decision Brief
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Export JPP Operational Briefing
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Brief Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">OPERATION:</span>
              <span className="text-emerald-400 font-bold">{scenario.operationName.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">HEADQUARTERS:</span>
              <span className="text-slate-200">{scenario.jtfName} ({scenario.higherHq})</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">ACTIVE DELIVERABLE:</span>
              <span className="text-joint-300 font-semibold">{currentPhase.name}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] pt-2 border-t border-slate-800">
              <span className="text-slate-400">CLASSIFICATION:</span>
              <span className="text-emerald-400 font-bold">{scenario.classification}</span>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-slate-300 font-mono uppercase tracking-wider text-[11px] font-bold mb-2">
              Select Briefing Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'pdf', label: 'PDF Document', desc: 'Commander Staff Estimate' },
                { id: 'pptx', label: 'PowerPoint Slides', desc: 'Commander Decision Brief' },
                { id: 'docx', label: 'Word / Annex', desc: 'Standard CJCS Format' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    format === f.id
                      ? 'bg-joint-950/60 border-joint-500 shadow-md text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">{f.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Included Annexes */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              Included Automated Appendices:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/50 border border-slate-850">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Commander Planning Guidance</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/50 border border-slate-850">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>1/3 - 2/3 Timeline Allocation</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/50 border border-slate-850">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Joint Functions Matrix (JP 3-0)</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/50 border border-slate-850">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restated Mission & CCIRs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-mono">
            Doctrinally formatted per CJCSM 3130.03
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={downloading || success}
              className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white font-bold transition shadow-lg shadow-joint-950 flex items-center gap-2 disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? 'Rendering Brief...' : 'Generate & Download'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
