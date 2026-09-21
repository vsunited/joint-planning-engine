'use client';

import React, { useState } from 'react';
import {
  MISSION_ANALYSIS_SUBTASKS,
  DEFAULT_COA_EVAL_CRITERIA,
  MA_BRIEFING_SECTIONS,
  FACT_CATEGORIES,
  STAFF_DIRECTORATES,
} from '@jpe/shared';
import {
  Cpu,
  Eye,
  ListTodo,
  BrainCircuit,
  Target,
  FileText,
  Map,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Presentation,
  Info,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import { AiTaskExtractionPanel } from '@/components/AiTaskExtractionPanel';
import { AssistantSettingsModal } from '@/components/AssistantSettingsModal';
import {
  MissionAnalysisState,
  MissionTask,
  FactItem,
  AssumptionItem,
  CcirItem,
  CcirType,
  EefiItem,
  RestatedMission,
  OperationalObjective,
  CoaEvalCriterion,
  StaffEstimateEntry,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

export function createDefaultMissionAnalysisState(
  scenario: OperationalScenario
): MissionAnalysisState {
  return {
    tasks: [],
    facts: [],
    assumptions: [],
    ccirs: [],
    eefis: [],
    restatedMission: {
      who: scenario.jtfName,
      what: '',
      when: 'When directed',
      where: scenario.aorRegion,
      why: '',
      fullStatement: '',
    },
    objectives: [],
    risks: [],
    coaEvalCriteria: DEFAULT_COA_EVAL_CRITERIA.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      weight: 1,
    })),
    staffEstimates: STAFF_DIRECTORATES.map(dir => ({
      directorate: dir,
      status: 'not_started',
      keyFindings: '',
      shortfalls: '',
      recommendation: '',
    })),
    jipoe: {
      step1_defineOE: 'not_started',
      step2_describeImpact: 'not_started',
      step3_evaluateThreat: 'not_started',
      step4_determineThreatCOAs: 'not_started',
      enemyCOG: '',
      friendlyCOG: '',
      mlcoa: '',
      mdcoa: '',
    },
    briefingSections: MA_BRIEFING_SECTIONS.map(sec => ({
      id: sec.id,
      section: sec.section,
      prepared: false,
      presenter: '',
    })),
    commanderIntent: '',
    commanderGuidanceUpdate: '',
    subTaskCompletion: MISSION_ANALYSIS_SUBTASKS.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
  };
}

// =============================================================================
// Props
// =============================================================================

interface MissionAnalysisProps {
  onOpenExportModal: () => void;
}

type TabId = 'tasks' | 'facts_assumptions' | 'ccirs' | 'mission' | 'estimates';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tasks', label: 'Task Analysis', icon: ListTodo },
  { id: 'facts_assumptions', label: 'Facts & Assumptions', icon: BrainCircuit },
  { id: 'ccirs', label: 'CCIRs & EEFIs', icon: Target },
  { id: 'mission', label: 'Mission & Objectives', icon: FileText },
  { id: 'estimates', label: 'JIPOE & Estimates', icon: Map },
];

// =============================================================================
// Shared Components
// =============================================================================

const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-slate-950/60 border border-slate-800 rounded-lg p-5 ${className}`}>
    <h4 className="text-xs font-mono font-bold text-joint-300 uppercase tracking-wide">
      {title}
    </h4>
    {subtitle && (
      <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
    )}
    <div className="mt-3">{children}</div>
  </div>
);

const TextArea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}> = ({ value, onChange, placeholder, rows = 3, label }) => (
  <div>
    {label && (
      <label className="block text-[11px] font-mono text-slate-400 mb-1.5">{label}</label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
    />
  </div>
);

// =============================================================================
// Tab 1: Task Analysis
// =============================================================================

const TaskAnalysisTab: React.FC<{
  state: MissionAnalysisState;
  onChange: (state: MissionAnalysisState) => void;
}> = ({ state, onChange }) => {
  const addTask = () => {
    const newTask: MissionTask = {
      id: `task-${Date.now()}`,
      description: '',
      classification: 'specified',
      source: '',
      assignedTo: '',
      isEssential: false,
      notes: '',
    };
    onChange({ ...state, tasks: [...state.tasks, newTask] });
  };

  const updateTask = (id: string, updates: Partial<MissionTask>) => {
    onChange({
      ...state,
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  };

  const removeTask = (id: string) => {
    onChange({ ...state, tasks: state.tasks.filter(t => t.id !== id) });
  };

  return (
    <div className="space-y-5">
      <SectionCard 
        title="Task Analysis" 
        subtitle="Identify and classify Specified, Implied, and Essential tasks."
      >
        <div className="mb-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900/80 rounded border border-slate-800 p-3">
            <div className="text-xl font-mono text-white font-bold">{state.tasks.filter(t => t.classification === 'specified').length}</div>
            <div className="text-[10px] text-slate-400 uppercase">Specified</div>
          </div>
          <div className="bg-slate-900/80 rounded border border-slate-800 p-3">
            <div className="text-xl font-mono text-white font-bold">{state.tasks.filter(t => t.classification === 'implied').length}</div>
            <div className="text-[10px] text-slate-400 uppercase">Implied</div>
          </div>
          <div className="bg-joint-950/60 rounded border border-joint-800 p-3">
            <div className="text-xl font-mono text-joint-300 font-bold">{state.tasks.filter(t => t.isEssential).length}</div>
            <div className="text-[10px] text-joint-400 uppercase font-bold">Essential</div>
          </div>
        </div>

        <div className="space-y-3">
          {state.tasks.map((task) => (
            <div key={task.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-4 items-start">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  placeholder="Task description..."
                  className="w-full bg-transparent border-b border-slate-700 focus:border-joint-500 text-sm text-slate-200 pb-1 focus:outline-none"
                />
                <div className="flex gap-4">
                  <select
                    value={task.classification}
                    onChange={(e) => updateTask(task.id, { classification: e.target.value as any })}
                    className="bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-300 px-2 py-1 focus:outline-none focus:border-joint-500"
                  >
                    <option value="specified">Specified</option>
                    <option value="implied">Implied</option>
                  </select>
                  
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.isEssential}
                      onChange={(e) => updateTask(task.id, { isEssential: e.target.checked })}
                      className="rounded border-slate-700 text-joint-500 bg-slate-950"
                    />
                    Mark as Essential (Mission-Critical)
                  </label>
                </div>
              </div>
              <button onClick={() => removeTask(task.id)} className="text-slate-500 hover:text-red-400 transition mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addTask}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-joint-400 hover:bg-slate-900/50 hover:border-joint-700 transition flex justify-center items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 2: Facts & Assumptions
// =============================================================================

const FactsAssumptionsTab: React.FC<{
  state: MissionAnalysisState;
  onChange: (state: MissionAnalysisState) => void;
}> = ({ state, onChange }) => {
  const addFact = () => {
    onChange({
      ...state,
      facts: [...state.facts, { id: `fact-${Date.now()}`, description: '', source: '', category: 'friendly' }],
    });
  };

  const updateFact = (id: string, updates: Partial<FactItem>) => {
    onChange({ ...state, facts: state.facts.map(f => f.id === id ? { ...f, ...updates } : f) });
  };

  const removeFact = (id: string) => {
    onChange({ ...state, facts: state.facts.filter(f => f.id !== id) });
  };

  const addAssumption = () => {
    onChange({
      ...state,
      assumptions: [...state.assumptions, {
        id: `assump-${Date.now()}`, description: '', isLogical: false, isRealistic: false, isEssential: false, linkedCcir: '', validatedAsFact: false
      }],
    });
  };

  const updateAssumption = (id: string, updates: Partial<AssumptionItem>) => {
    onChange({ ...state, assumptions: state.assumptions.map(a => a.id === id ? { ...a, ...updates } : a) });
  };

  const removeAssumption = (id: string) => {
    onChange({ ...state, assumptions: state.assumptions.filter(a => a.id !== id) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Known Facts" subtitle="Verifiable evidence about the OE.">
        <div className="space-y-3">
          {state.facts.map(fact => (
            <div key={fact.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={fact.description}
                  onChange={(e) => updateFact(fact.id, { description: e.target.value })}
                  placeholder="Fact description..."
                  className="w-full bg-transparent border-b border-slate-700 focus:border-joint-500 text-xs text-slate-200 pb-1 focus:outline-none"
                />
                <select
                  value={fact.category}
                  onChange={(e) => updateFact(fact.id, { category: e.target.value as any })}
                  className="bg-slate-950 border border-slate-700 rounded text-[10px] text-slate-400 px-2 py-1 focus:outline-none focus:border-joint-500"
                >
                  {FACT_CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => removeFact(fact.id)} className="text-slate-500 hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addFact} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-joint-400 hover:bg-slate-900/50 transition flex justify-center items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add Fact
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Planning Assumptions" subtitle="Suppositions required to continue planning.">
        <div className="mb-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Must be <strong>logical</strong>, <strong>realistic</strong>, and <strong>essential</strong>. Phrase as "will" or "will not".
          </p>
        </div>
        <div className="space-y-3">
          {state.assumptions.map(assump => (
            <div key={assump.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-3">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={assump.description}
                  onChange={(e) => updateAssumption(assump.id, { description: e.target.value })}
                  placeholder="Assumption..."
                  className="w-full bg-transparent border-b border-slate-700 focus:border-joint-500 text-xs text-slate-200 pb-1 focus:outline-none"
                />
                <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={assump.isLogical} onChange={(e) => updateAssumption(assump.id, { isLogical: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-joint-500" /> Logical
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={assump.isRealistic} onChange={(e) => updateAssumption(assump.id, { isRealistic: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-joint-500" /> Realistic
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={assump.isEssential} onChange={(e) => updateAssumption(assump.id, { isEssential: e.target.checked })} className="rounded bg-slate-950 border-slate-700 text-joint-500" /> Essential
                  </label>
                </div>
              </div>
              <button onClick={() => removeAssumption(assump.id)} className="text-slate-500 hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addAssumption} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-joint-400 hover:bg-slate-900/50 transition flex justify-center items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add Assumption
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 3: CCIRs & EEFIs
// =============================================================================

const CcirsTab: React.FC<{
  state: MissionAnalysisState;
  onChange: (state: MissionAnalysisState) => void;
}> = ({ state, onChange }) => {
  const addCcir = (type: CcirType) => {
    onChange({
      ...state,
      ccirs: [...state.ccirs, { id: `ccir-${Date.now()}`, type, priority: 1, question: '', indicator: '', collectionAsset: '', ltiov: '', status: 'active' }],
    });
  };

  const updateCcir = (id: string, updates: Partial<CcirItem>) => {
    onChange({ ...state, ccirs: state.ccirs.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const removeCcir = (id: string) => {
    onChange({ ...state, ccirs: state.ccirs.filter(c => c.id !== id) });
  };

  const pirs = state.ccirs.filter(c => c.type === 'PIR');
  const ffirs = state.ccirs.filter(c => c.type === 'FFIR');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Priority Intelligence Requirements (PIR)" subtitle="Focus on enemy and OE (J-2).">
        <div className="space-y-3">
          {pirs.map((pir, idx) => (
            <div key={pir.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="flex gap-2 items-start">
                <div className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-900/60 text-[10px] font-mono text-red-400">PIR {idx + 1}</div>
                <input
                  type="text"
                  value={pir.question}
                  onChange={(e) => updateCcir(pir.id, { question: e.target.value })}
                  placeholder="Intelligence question..."
                  className="flex-1 bg-transparent border-b border-slate-700 focus:border-red-500 text-xs text-slate-200 pb-1 focus:outline-none"
                />
                <button onClick={() => removeCcir(pir.id)} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={() => addCcir('PIR')} className="w-full py-2 border border-dashed border-red-900/40 rounded-lg text-xs font-mono text-red-400/80 hover:bg-red-950/20 transition flex justify-center items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add PIR
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Friendly Force Information Requirements (FFIR)" subtitle="Focus on friendly forces (J-3).">
        <div className="space-y-3">
          {ffirs.map((ffir, idx) => (
            <div key={ffir.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="flex gap-2 items-start">
                <div className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-900/60 text-[10px] font-mono text-sky-400">FFIR {idx + 1}</div>
                <input
                  type="text"
                  value={ffir.question}
                  onChange={(e) => updateCcir(ffir.id, { question: e.target.value })}
                  placeholder="Friendly force information..."
                  className="flex-1 bg-transparent border-b border-slate-700 focus:border-sky-500 text-xs text-slate-200 pb-1 focus:outline-none"
                />
                <button onClick={() => removeCcir(ffir.id)} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={() => addCcir('FFIR')} className="w-full py-2 border border-dashed border-sky-900/40 rounded-lg text-xs font-mono text-sky-400/80 hover:bg-sky-950/20 transition flex justify-center items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add FFIR
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 4: Mission & Objectives
// =============================================================================

const MissionObjectivesTab: React.FC<{
  state: MissionAnalysisState;
  onChange: (state: MissionAnalysisState) => void;
}> = ({ state, onChange }) => {
  const updateMission = (updates: Partial<RestatedMission>) => {
    onChange({ ...state, restatedMission: { ...state.restatedMission, ...updates } });
  };

  const generateFullStatement = () => {
    const { who, what, when, where, why } = state.restatedMission;
    return `${when}, ${who} ${what} in ${where} in order to ${why}.`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Restated Mission Statement">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">WHO</label>
              <input type="text" value={state.restatedMission.who} onChange={(e) => updateMission({ who: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-joint-500" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">WHEN</label>
              <input type="text" value={state.restatedMission.when} onChange={(e) => updateMission({ when: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-joint-500" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">WHAT (Essential Tasks)</label>
            <input type="text" value={state.restatedMission.what} onChange={(e) => updateMission({ what: e.target.value })} placeholder="Deters aggression and secures LOCs..." className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-joint-500" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">WHERE (AOR / JOA)</label>
            <input type="text" value={state.restatedMission.where} onChange={(e) => updateMission({ where: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-joint-500" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">WHY (Purpose)</label>
            <input type="text" value={state.restatedMission.why} onChange={(e) => updateMission({ why: e.target.value })} placeholder="Maintain regional stability..." className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-joint-500" />
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="block text-[10px] font-mono text-joint-400 mb-1">COMBINED STATEMENT</label>
            <div className="p-3 bg-joint-950/30 border border-joint-900/60 rounded-lg text-sm text-slate-200 leading-relaxed font-serif italic">
              "{state.restatedMission.fullStatement || generateFullStatement()}"
            </div>
          </div>
        </div>
      </SectionCard>
      
      <div className="space-y-5">
        <SectionCard title="Commander's Intent Refinement">
          <TextArea
            value={state.commanderIntent}
            onChange={(val) => onChange({ ...state, commanderIntent: val })}
            placeholder="Refined commander's intent based on mission analysis..."
            rows={4}
          />
        </SectionCard>
      </div>
    </div>
  );
};

// =============================================================================
// Tab 5: JIPOE & Estimates
// =============================================================================

const JipoeEstimatesTab: React.FC<{
  state: MissionAnalysisState;
  onChange: (state: MissionAnalysisState) => void;
}> = ({ state, onChange }) => {
  const updateEstimate = (idx: number, updates: Partial<StaffEstimateEntry>) => {
    const estimates = [...state.staffEstimates];
    estimates[idx] = { ...estimates[idx], ...updates };
    onChange({ ...state, staffEstimates: estimates });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Functional Staff Estimates">
        <div className="overflow-y-auto max-h-[400px] pr-2 space-y-2">
          {state.staffEstimates.map((est, idx) => (
            <div key={est.directorate} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono">{est.directorate}</span>
                <select
                  value={est.status}
                  onChange={(e) => updateEstimate(idx, { status: e.target.value as any })}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border focus:outline-none ${
                    est.status === 'complete' ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400' :
                    est.status === 'in_progress' ? 'bg-amber-950/60 border-amber-700/60 text-amber-400' :
                    'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <option value="not_started">NOT STARTED</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="complete">COMPLETE</option>
                </select>
              </div>
              <input
                type="text"
                value={est.keyFindings}
                onChange={(e) => updateEstimate(idx, { keyFindings: e.target.value })}
                placeholder="Key findings & shortfalls..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-joint-500"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="JIPOE Progress">
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <h5 className="text-[10px] font-mono text-slate-400 mb-2">Enemy Most Likely COA (MLCOA)</h5>
            <textarea
              value={state.jipoe.mlcoa}
              onChange={(e) => onChange({ ...state, jipoe: { ...state.jipoe, mlcoa: e.target.value } })}
              placeholder="Adversary MLCOA description..."
              className="w-full bg-slate-950 border border-slate-700/60 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 resize-none h-16"
            />
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <h5 className="text-[10px] font-mono text-slate-400 mb-2">Enemy Most Dangerous COA (MDCOA)</h5>
            <textarea
              value={state.jipoe.mdcoa}
              onChange={(e) => onChange({ ...state, jipoe: { ...state.jipoe, mdcoa: e.target.value } })}
              placeholder="Adversary MDCOA description..."
              className="w-full bg-slate-950 border border-slate-700/60 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 resize-none h-16"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const MissionAnalysis: React.FC<MissionAnalysisProps> = ({
  onOpenExportModal,
}) => {
  const { scenario, missionAnalysis: state, setMissionAnalysis: onStateChange } = usePlanning();
  const [activeTab, setActiveTab] = useState<TabId>('tasks');
  const [aiOpen, setAiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 2 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Chapter IV</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Eye className="w-5 h-5 text-joint-400" />
              Mission Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Analyze directives, identify tasks, develop facts/assumptions, establish CCIRs, and construct the restated mission for Operation {scenario.operationName}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 transition shadow-md shadow-emerald-950/40"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Extract Tasks from Order</span>
            </button>
            <button
              onClick={onOpenExportModal}
              className="px-3.5 py-2 bg-joint-950/90 hover:bg-joint-900 text-joint-200 text-xs font-semibold rounded-lg border border-joint-700/80 transition flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-joint-400" />
              <span>Export Brief</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium font-mono border-b-2 transition -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id ? 'border-joint-400 text-white font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AiTaskExtractionPanel
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onOpenSettings={() => { setAiOpen(false); setSettingsOpen(true); }}
        onAccept={(tasks) => onStateChange({ ...state, tasks: [...state.tasks, ...tasks] })}
      />
      <AssistantSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'tasks' && <TaskAnalysisTab state={state} onChange={onStateChange} />}
        {activeTab === 'facts_assumptions' && <FactsAssumptionsTab state={state} onChange={onStateChange} />}
        {activeTab === 'ccirs' && <CcirsTab state={state} onChange={onStateChange} />}
        {activeTab === 'mission' && <MissionObjectivesTab state={state} onChange={onStateChange} />}
        {activeTab === 'estimates' && <JipoeEstimatesTab state={state} onChange={onStateChange} />}
      </div>
    </div>
  );
};
