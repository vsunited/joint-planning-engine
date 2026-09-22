'use client';

import { describeChain, echelon as echelonDef, parseOrderHeader, proposeEchelon, sameHeadquarters } from '@jpe/shared';
import { useEchelon } from '@/context/EchelonContext';
import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Check, 
  Shield, 
  FolderPlus,
  Lock, 
  Trash2,
  Loader2, 
  Info
} from 'lucide-react';
import { OperationalScenario, UploadedDocument } from '@/types/scenario';
import { ingestFile, statusLabel, acceptAttribute, IngestedDocument } from '@/lib/ingest';

interface ScenarioSetupModalProps {
  /** Opens the dialog that owns the command chain. */
  onOpenEchelonModal: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentScenario: OperationalScenario;
  onSave: (updated: OperationalScenario) => void;
}

export const ScenarioSetupModal: React.FC<ScenarioSetupModalProps> = ({
  
  onOpenEchelonModal,isOpen,
  onClose,
  currentScenario,
  onSave,
}) => {
  const { echelon, locked, confirm } = useEchelon();
  const [scenario, setScenario] = useState<OperationalScenario>({ ...currentScenario });
  const [dragOver, setDragOver] = useState(false);
  const [ingesting, setIngesting] = useState<string>('');

  if (!isOpen) return null;

  /** Converts an ingest result into the scenario's document record. */
  const toDocument = (doc: IngestedDocument): UploadedDocument => {
    const header = parseOrderHeader(doc.text);
    return {
    name: doc.name,
    size: `${(doc.size / (1024 * 1024)).toFixed(2)} MB`,
    type: doc.mime,
    uploadedAt: new Date(doc.ingestedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    text: doc.text,
    charCount: doc.charCount,
    status: doc.status,
    pageCount: doc.pageCount,
    detail: doc.detail,
    images: doc.images,
    issuer: header.issuer ?? undefined,
    addressee: header.addressee ?? undefined,
    headerEvidence: header.evidence ?? undefined,
    role: 'unknown',
    };
  };

  /**
   * Marks one document as the order that tasks this staff.
   *
   * Mutually exclusive by construction. A planner may hold an INDOPACOM order
   * to CJTF-SEA and a EUCOM order to some other JTF at the same time, but they
   * are planning one of those operations, not both, so choosing one releases
   * the other to being a reference.
   */
  const setDirective = (index: number) => {
    setScenario(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.map((d, i) => ({
        ...d,
        role: i === index ? 'directive' : d.role === 'directive' ? 'reference' : d.role,
      })),
    }));
  };

  const directive = scenario.uploadedDocuments.find(d => d.role === 'directive');
  const proposal = directive
    ? proposeEchelon({
        issuer: (directive.issuer ?? null) as never,
        addressee: directive.addressee ?? null,
        evidence: directive.headerEvidence ?? null,
      })
    : null;
  const proposalMatchesLocked =
    !!proposal && sameHeadquarters(proposal.echelon.designation, echelon.designation);

  /** Reads each file for real and stores the extracted text. */
  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      setIngesting(file.name);
      const result = await ingestFile(file, p =>
        setIngesting(p.detail ? `${file.name} — ${p.detail}` : file.name)
      );
      setScenario(prev => ({
        ...prev,
        uploadedDocuments: [...prev.uploadedDocuments, toDocument(result)],
      }));
    }
    setIngesting('');
  };

  const removeDoc = (index: number) => {
    setScenario(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(scenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300 shadow-md shadow-joint-950/50">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                  Joint Task Force Setup
                </span>
                <span className="text-slate-500 text-xs font-mono">• JP 5-0 Directive</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Operational Scenario & Orders Intake
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

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: JTF Identity & Command Echelon */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-joint-300 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> 1. Joint Task Force Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/*
                * The headquarters is shown, not edited.
                *
                * It is fixed per installation — a J5 cell belongs to one
                * command and does not become another between operations — so
                * it is set once in the echelon dialog and read here. Editing it
                * alongside the operation name would invite changing it per
                * scenario, and specified/implied task classification is defined
                * relative to it.
                */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Planning Headquarters
                </label>
                <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{describeChain(echelon)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {locked ? 'Locked for this installation.' : 'Not yet confirmed.'} Issues orders
                      to {echelonDef(echelon.level)?.issuesTo}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenEchelonModal}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5"
                  >
                    {locked ? <Lock className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Operation Name
                </label>
                <input
                  type="text"
                  value={scenario.operationName}
                  onChange={e => setScenario({ ...scenario, operationName: e.target.value })}
                  placeholder="e.g., Sentinel Resolve, Pacific Sentry, Joint Forge"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-joint-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Lead Planning Officer Rank & Name
                </label>
                <input
                  type="text"
                  value={scenario.commandingOfficer}
                  onChange={e => setScenario({ ...scenario, commandingOfficer: e.target.value })}
                  placeholder="e.g., MAJ D. Hess, LTC J. Reynolds, COL M. Vance"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-joint-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Staff Role / Billet
                </label>
                <select
                  value={scenario.officerRole}
                  onChange={e => setScenario({ ...scenario, officerRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-joint-500 transition"
                >
                  <option value="Lead J5 Operational Planner">Lead J5 Operational Planner</option>
                  <option value="J3 Director of Operations">J3 Director of Operations</option>
                  <option value="J2 Senior Intelligence Officer">J2 Senior Intelligence Officer</option>
                  <option value="J4 Logistics Staff Officer">J4 Logistics Staff Officer</option>
                  <option value="JTF Chief of Staff">JTF Chief of Staff</option>
                  <option value="Commander, Joint Task Force">Commander, Joint Task Force</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Security Classification Boundary
                </label>
                <select
                  value={scenario.classification}
                  onChange={e => setScenario({ ...scenario, classification: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-joint-500 transition font-mono"
                >
                  <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  <option value="CUI">CUI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Upload Higher HQ Directives & Documents */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-joint-300 flex items-center gap-2">
                <UploadCloud className="w-3.5 h-3.5" /> 2. Higher HQ Documents & Orders Intake
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Supports: WARNORD, PLANORD, OPORD, JIPOE, GEF
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) {
                  handleFileUpload(Array.from(e.dataTransfer.files));
                }
              }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                dragOver 
                  ? 'border-joint-500 bg-joint-950/30' 
                  : 'border-slate-700 hover:border-joint-500/70 bg-slate-950/40'
              }`}
            >
              <input
                type="file"
                multiple
                id="docUpload"
                className="hidden"
                onChange={e => e.target.files && handleFileUpload(Array.from(e.target.files))}
                accept={acceptAttribute()}
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-joint-300 mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Click to browse or drag & drop Higher HQ Directives
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  PDF, Word, PowerPoint, images or plain text — read on this machine
                </div>
              </label>
            </div>

            {ingesting && (
              <div className="mt-3 p-2.5 rounded-lg bg-joint-950/30 border border-joint-800 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-joint-300 animate-spin shrink-0" />
                <span className="text-[11px] text-joint-200 font-mono truncate">{ingesting}</span>
              </div>
            )}

            {/* Document List */}
            {scenario.uploadedDocuments.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                  Ingested Strategic Directives ({scenario.uploadedDocuments.length})
                </div>
                {proposal && !proposalMatchesLocked && (
                  <div className="mb-3 p-3 rounded-lg bg-joint-950/40 border border-joint-800">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-joint-300 mb-1.5">
                      Planning level read from this directive
                    </p>
                    <p className="text-sm text-white">{describeChain(proposal.echelon)}</p>
                    {proposal.evidence && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5 break-words">
                        {/* The planner confirms something they can check, not a guess. */}
                        Read from: “{proposal.evidence}”
                      </p>
                    )}
                    {!proposal.confident && (
                      <p className="text-[10px] text-amber-300/90 mt-1.5">
                        The issuing command was not found in the header — check this before locking.
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => confirm(proposal.echelon)}
                        className="px-3 py-1.5 rounded-lg bg-joint-600 hover:bg-joint-500 text-white text-[11px] font-bold transition"
                      >
                        Confirm and lock this level
                      </button>
                      <button
                        type="button"
                        onClick={onOpenEchelonModal}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Adjust
                      </button>
                    </div>
                    {locked && (
                      <p className="text-[10px] text-amber-300/80 mt-2">
                        Currently locked to {echelon.designation}. Confirming replaces it and
                        rebuilds the workspace.
                      </p>
                    )}
                  </div>
                )}
                {proposal && proposalMatchesLocked && (
                  <p className="mb-3 text-[10px] text-emerald-300/85 font-mono">
                    Directive matches the locked headquarters — {echelon.designation}.
                  </p>
                )}
                {scenario.uploadedDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-joint-400" />
                      <div>
                        <div className="font-medium text-slate-200">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {doc.size}
                          {doc.pageCount ? ` • ${doc.pageCount} pages` : ''}
                          {doc.charCount ? ` • ${doc.charCount.toLocaleString()} chars` : ''}
                          {' • '}{doc.uploadedAt}
                        </div>
                        {doc.detail && (
                          <div className="text-[10px] text-slate-500 mt-1 max-w-sm leading-snug">
                            {doc.detail}
                          </div>
                        )}
                        {(doc.issuer || doc.addressee) && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {doc.issuer ?? 'unknown'} → {doc.addressee ?? 'unknown'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          doc.status === 'parsed' || doc.status === 'vision_parsed'
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60'
                            : doc.status === 'needs_vision'
                            ? 'text-amber-400 bg-amber-950/60 border-amber-900/60'
                            : 'text-red-400 bg-red-950/60 border-red-900/60'
                        }`}
                      >
                        {statusLabel(doc.status)}
                      </span>
                      {/*
                        * Exactly one directive. A staff plans one operation for
                        * one headquarters, so selecting a directive clears any
                        * other rather than accumulating them.
                        */}
                      <button
                        type="button"
                        onClick={() => setDirective(idx)}
                        disabled={!doc.addressee}
                        title={
                          doc.addressee
                            ? 'The order that tasks this staff'
                            : 'No addressee found in this document'
                        }
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition disabled:opacity-30 ${
                          doc.role === 'directive'
                            ? 'text-joint-200 bg-joint-900 border-joint-600'
                            : 'text-slate-400 bg-slate-900 border-slate-700 hover:border-joint-700'
                        }`}
                      >
                        {doc.role === 'directive' ? 'OUR DIRECTIVE' : 'Set as directive'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-joint-950/40 border border-joint-900/60 rounded-lg p-3 text-[11px] text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-joint-400 shrink-0 mt-0.5" />
              <div>
                <strong>What happens to an uploaded order:</strong> text is extracted here
                and on upload — from PDF, Word, PowerPoint and plain text, with scans
                transcribed by a local vision model if one is configured. Step 2 can then run
                task extraction against that text. Results are staged for review; the planner
                accepts, edits or discards them, and nothing is written into a worksheet
                without that decision.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white font-bold transition shadow-lg shadow-joint-950 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Scenario & Directives</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
