'use client';

import React, { useMemo, useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Presentation,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { JPP_PHASES } from '@jpe/shared';
import { usePlanning } from '@/context/PlanningContext';
import { productsForPhase, PlanningProduct } from '@/lib/products';
import { downloadText, copyToClipboard, productFilename } from '@/lib/download';

interface ExportBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePhaseId: number;
}

export const ExportBriefModal: React.FC<ExportBriefModalProps> = ({
  isOpen,
  onClose,
  activePhaseId,
}) => {
  const state = usePlanning();
  const { scenario, echelon } = state;

  const products = useMemo(() => productsForPhase(activePhaseId), [activePhaseId]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Default to the first product for this phase.
  const active: PlanningProduct | undefined =
    products.find(p => p.id === selectedId) || products[0];

  const preview = useMemo(() => {
    if (!active) return '';
    try {
      return active.build(state);
    } catch (err) {
      return `Failed to generate this product.\n\n${String(err)}`;
    }
  }, [active, state]);

  if (!isOpen) return null;

  const currentPhase = JPP_PHASES.find(p => p.id === activePhaseId) || JPP_PHASES[0];

  const handleCopy = async () => {
    const ok = await copyToClipboard(preview);
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 1800);
    } else {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  };

  const handleDownload = (ext: 'md' | 'txt') => {
    if (!active) return;
    downloadText(
      productFilename(scenario.operationName, active.id, ext),
      preview,
      ext === 'md' ? 'text/markdown' : 'text/plain'
    );
  };

  const handleDownloadAll = () => {
    if (!products.length) return;
    const combined = products
      .map(p => {
        try {
          return p.build(state);
        } catch {
          return `# ${p.label}\n\nFailed to generate.`;
        }
      })
      .join('\n\n\n');
    downloadText(
      productFilename(scenario.operationName, `step${activePhaseId}_all_products`, 'md'),
      combined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300 shadow-md">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                {currentPhase.name.replace(/^Phase [IVX]+: /, '')}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Staff Products</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario summary */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono shrink-0">
          <span className="text-slate-500">
            OPERATION <span className="text-emerald-400 font-bold ml-1">{scenario.operationName.toUpperCase()}</span>
          </span>
          <span className="text-slate-500">
            HQ <span className="text-slate-200 ml-1">{echelon.designation}</span>
          </span>
          <span className="text-slate-500">
            CLASSIFICATION <span className="text-emerald-400 font-bold ml-1">{scenario.classification}</span>
          </span>
        </div>

        {/* Body */}
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No products defined for this step.</p>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0">
            {/* Product list */}
            <div className="w-64 shrink-0 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5">
              {products.map(p => {
                const isActive = active?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isActive
                        ? 'bg-joint-950/70 border-joint-500'
                        : 'bg-slate-950/50 border-slate-800 hover:border-joint-800'
                    }`}
                  >
                    <div
                      className={`text-[11px] font-semibold leading-tight ${
                        isActive ? 'text-joint-100' : 'text-slate-200'
                      }`}
                    >
                      {p.label}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-1">{p.doctrineRef}</div>
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-auto p-4 bg-slate-950/40">
                <pre className="text-[10.5px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap break-words">
                  {preview}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={!products.length}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Package className="w-3.5 h-3.5" />
              All products for this step
            </button>
            {copyFailed && (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Clipboard blocked — select the text and copy manually
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!active}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDownload('txt')}
              disabled={!active}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              .txt
            </button>
            <button
              type="button"
              onClick={() => handleDownload('md')}
              disabled={!active}
              className="px-4 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white text-xs font-bold transition shadow-lg shadow-joint-950 flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Download .md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
