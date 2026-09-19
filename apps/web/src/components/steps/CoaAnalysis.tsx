'use client';

import React, { useMemo, useState } from 'react';
import {
  COA_ANALYSIS_KEY_INPUTS,
  COA_ANALYSIS_KEY_OUTPUTS,
  WARGAME_KEY_DECISIONS,
  WARGAME_METHODS,
  WARGAME_FORMATS,
  WARGAME_RECORD_METHODS,
  WARGAME_CELLS,
  WARGAME_MOVE_TYPES,
  ENEMY_COA_TYPES,
  WARGAMING_STEPS,
  COA_ANALYSIS_PURPOSES,
  WARGAME_FEASIBILITY_QUESTIONS,
  WARGAME_PRIMARY_OUTPUTS,
  BRANCH_SEQUEL_TYPES,
  JOINT_FUNCTIONS,
  STAFF_DIRECTORATES,
} from '@jpe/shared';
import {
  Sparkles,
  Layers,
  Swords,
  Grid3x3,
  GitFork,
  ClipboardList,
  Presentation,
  Plus,
  X,
  Check,
  Info,
  AlertTriangle,
  Users,
  Target,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import {
  CoaAnalysisState,
  CoaDevelopmentState,
  CriticalEvent,
  WargameTurn,
  EnemyCoaType,
  DecisionSupportEntry,
  BranchSequel,
  HighValueTarget,
  ResourceShortfall,
  RefinedCcir,
  CoaWargameResult,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

export function createDefaultCoaAnalysisState(
  _scenario: OperationalScenario
): CoaAnalysisState {
  return {
    setup: {
      format: 'manual',
      method: 'critical_events',
      recordMethods: ['sync_matrix'],
      // JP 5-0: at minimum, wargame against both the MLCOA and the MDCOA.
      enemyCoasToWargame: ['mlcoa', 'mdcoa'],
      turnsPlanned: 3,
      levelOfDetail: 'Two levels down',
      facilitator: '',
      startEvent: '',
      startLocation: '',
      startTime: '',
      commanderWargameGuidance: '',
      keyDecisionsComplete: WARGAME_KEY_DECISIONS.reduce((acc, d) => {
        acc[d.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
    },
    cells: WARGAME_CELLS.map(c => ({
      cell: c.key as 'blue' | 'red' | 'white' | 'green',
      lead: '',
      members: '',
      notes: '',
    })),
    criticalEvents: [],
    turns: [],
    syncMatrix: [],
    decisionSupport: [],
    branchesSequels: [],
    highValueTargets: [],
    shortfalls: [],
    results: [],
    refinedCcirs: [],
    purposeCompletion: COA_ANALYSIS_PURPOSES.reduce((acc, p) => {
      acc[p.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    outputCompletion: WARGAME_PRIMARY_OUTPUTS.reduce((acc, o) => {
      acc[o.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    assessmentPlan: '',
    notes: '',
  };
}

// =============================================================================
// Props
// =============================================================================

interface CoaAnalysisProps {
  onOpenExportModal: () => void;
}

type TabId = 'prepare' | 'events' | 'wargame' | 'sync' | 'outputs';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'prepare', label: 'Prepare', icon: Layers },
  { id: 'events', label: 'Critical Events', icon: ClipboardList },
  { id: 'wargame', label: 'Conduct Wargame', icon: Swords },
  { id: 'sync', label: 'Sync Matrix', icon: Grid3x3 },
  { id: 'outputs', label: 'Products & Results', icon: GitFork },
];

// =============================================================================
// Shared Components
// =============================================================================

const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  doctrineRef?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, doctrineRef, children, className = '' }) => (
  <div className={`bg-slate-950/60 border border-slate-800 rounded-lg p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <h4 className="text-xs font-mono font-bold text-joint-300 uppercase tracking-wide">
        {title}
      </h4>
      {doctrineRef && (
        <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
          {doctrineRef}
        </span>
      )}
    </div>
    {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    <div className="mt-3">{children}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}> = ({ label, value, onChange, placeholder, rows = 2, hint }) => (
  <div>
    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
      {label}
      {hint && <span className="text-slate-600 ml-1.5 normal-case">{hint}</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
    />
  </div>
);

const LineInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-joint-500 ${className}`}
  />
);

const AddRowButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-joint-400 hover:bg-slate-900/50 hover:border-joint-700 transition flex justify-center items-center gap-1.5"
  >
    <Plus className="w-3 h-3" /> {label}
  </button>
);

/** Empty state shown when Step 3 has produced no COAs to analyze */
const NoCoasNotice: React.FC = () => (
  <div className="p-8 text-center">
    <ShieldAlert className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
    <h4 className="text-sm font-bold text-slate-200">No COAs available to analyze</h4>
    <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
      COA analysis takes the COA alternatives developed in Step 3 as its key input. Develop at least
      one COA in <span className="text-joint-300">Step 3 — COA Development</span>, then return here.
    </p>
  </div>
);

// =============================================================================
// Tab 1: Prepare for the Wargame
// =============================================================================

const PrepareTab: React.FC<{
  state: CoaAnalysisState;
  onChange: (state: CoaAnalysisState) => void;
  coaDevState: CoaDevelopmentState;
}> = ({ state, onChange, coaDevState }) => {
  const [showSteps, setShowSteps] = useState(false);

  const setSetup = (updates: Partial<CoaAnalysisState['setup']>) =>
    onChange({ ...state, setup: { ...state.setup, ...updates } });

  const toggleRecordMethod = (key: string) => {
    const current = state.setup.recordMethods;
    setSetup({
      recordMethods: current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key],
    });
  };

  const toggleEnemyCoa = (key: EnemyCoaType) => {
    const current = state.setup.enemyCoasToWargame;
    setSetup({
      enemyCoasToWargame: current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key],
    });
  };

  const approvedIds = coaDevState.jfcGuidance.approvedCoaIds;

  return (
    <div className="space-y-5">
      {/* Key inputs — traceability to Step 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Key Inputs"
          subtitle="Products of COA development that drive analysis."
          doctrineRef="JP 5-0, Fig IV-12"
        >
          <div className="space-y-1.5">
            {COA_ANALYSIS_KEY_INPUTS.map(input => (
              <div
                key={input.id}
                className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200"
              >
                {input.label}
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Carried forward from Step 3:{' '}
              <span className="text-joint-300 font-mono">
                {coaDevState.coas.length} COA{coaDevState.coas.length === 1 ? '' : 's'} developed
              </span>
              {approvedIds.length > 0 && (
                <>
                  ,{' '}
                  <span className="text-emerald-400 font-mono">
                    {approvedIds.length} approved by the JFC for further analysis
                  </span>
                </>
              )}
              .
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Key Outputs"
          subtitle="What Step 4 must deliver into COA Comparison (Step 5)."
          doctrineRef="JP 5-0, Fig IV-12"
        >
          <div className="space-y-1.5">
            {COA_ANALYSIS_KEY_OUTPUTS.map(output => (
              <div
                key={output.id}
                className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                {output.label}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Three key decisions before analysis begins */}
      <SectionCard
        title="Three Key Decisions Before Analysis Begins"
        subtitle="Settle these before the first turn."
        doctrineRef="JP 5-0, IV-46"
      >
        <div className="space-y-2">
          {WARGAME_KEY_DECISIONS.map((d, idx) => (
            <label
              key={d.id}
              className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.setup.keyDecisionsComplete[d.id]}
                onChange={(e) =>
                  setSetup({
                    keyDecisionsComplete: {
                      ...state.setup.keyDecisionsComplete,
                      [d.id]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-joint-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      state.setup.keyDecisionsComplete[d.id]
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{d.description}</p>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Method & format */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Wargaming Method"
          subtitle="Three manual methods are available to run the event."
          doctrineRef="JP 5-0, IV-46"
        >
          <div className="space-y-2">
            {WARGAME_METHODS.map(m => {
              const selected = state.setup.method === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSetup({ method: m.key as CoaAnalysisState['setup']['method'] })}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selected
                      ? 'bg-joint-950/70 border-joint-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-joint-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${selected ? 'text-joint-200' : 'text-slate-200'}`}
                    >
                      {m.label}
                    </span>
                    {selected && <Check className="w-3.5 h-3.5 text-joint-300" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{m.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Format</label>
              <select
                value={state.setup.format}
                onChange={(e) => setSetup({ format: e.target.value as 'manual' | 'digital' })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-joint-500"
              >
                {WARGAME_FORMATS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Turns Planned
              </label>
              <input
                type="number"
                min={1}
                value={state.setup.turnsPlanned}
                onChange={(e) => setSetup({ turnsPlanned: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-joint-500"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recording & Scope"
          subtitle="How results are recorded, which enemy COAs are played, and at what level of detail."
          doctrineRef="JP 5-0, Fig IV-13"
        >
          <label className="block text-[11px] font-mono text-slate-400 mb-2">
            Record & display methods
          </label>
          <div className="flex flex-wrap gap-2">
            {WARGAME_RECORD_METHODS.map(rm => {
              const on = state.setup.recordMethods.includes(rm.key);
              return (
                <button
                  key={rm.key}
                  onClick={() => toggleRecordMethod(rm.key)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition flex items-center gap-1.5 ${
                    on
                      ? 'bg-joint-950 border-joint-600 text-joint-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {on && <Check className="w-3 h-3" />}
                  {rm.label}
                </button>
              );
            })}
          </div>

          <label className="block text-[11px] font-mono text-slate-400 mb-2 mt-4">
            Enemy COAs to wargame
          </label>
          <div className="flex flex-wrap gap-2">
            {ENEMY_COA_TYPES.map(ec => {
              const on = state.setup.enemyCoasToWargame.includes(ec.key as EnemyCoaType);
              return (
                <button
                  key={ec.key}
                  onClick={() => toggleEnemyCoa(ec.key as EnemyCoaType)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition flex items-center gap-1.5 ${
                    on
                      ? 'bg-red-950/60 border-red-700 text-red-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {on && <Check className="w-3 h-3" />}
                  {ec.label}
                </button>
              );
            })}
          </div>
          {state.setup.enemyCoasToWargame.length < 2 && (
            <p className="text-[10px] text-amber-400/90 mt-2 leading-relaxed flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              Each retained COA should be wargamed against both the most likely and most dangerous
              enemy COAs.
            </p>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Level of detail
              </label>
              <LineInput
                value={state.setup.levelOfDetail}
                onChange={(v) => setSetup({ levelOfDetail: v })}
                placeholder="e.g., Two levels down"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Facilitator</label>
              <LineInput
                value={state.setup.facilitator}
                onChange={(v) => setSetup({ facilitator: v })}
                placeholder="Name / billet"
                className="w-full"
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Starting conditions */}
      <SectionCard
        title="Wargame Start Conditions"
        subtitle="The facilitator and red cell chief agree the rules, then designate the opening event, where in the OA it begins, and when."
        doctrineRef="JP 5-0, IV-48"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Opening event</label>
            <LineInput
              value={state.setup.startEvent}
              onChange={(v) => setSetup({ startEvent: v })}
              placeholder="Enemy offensive, friendly action, RFS..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Where (in the OA)</label>
            <LineInput
              value={state.setup.startLocation}
              onChange={(v) => setSetup({ startLocation: v })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">When</label>
            <LineInput
              value={state.setup.startTime}
              onChange={(v) => setSetup({ startTime: v })}
              placeholder="H-hour or L-hour"
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3">
          <Field
            label="Commander's wargame guidance"
            value={state.setup.commanderWargameGuidance}
            onChange={(v) => setSetup({ commanderWargameGuidance: v })}
            placeholder="Which aspects of the COA to examine, COAs to wargame against which threat COAs, timeline, critical events, level of detail..."
            rows={3}
          />
        </div>
      </SectionCard>

      {/* Cells */}
      <SectionCard
        title="Wargame Cells"
        subtitle="Blue plays friendly, red plays the enemy, green plays the civilian environment, white arbitrates."
        doctrineRef="JP 5-0, IV-47 to IV-48"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {WARGAME_CELLS.map(cellDef => {
            const assignment = state.cells.find(c => c.cell === cellDef.key);
            const accent =
              cellDef.key === 'red'
                ? 'border-red-900/60 bg-red-950/20'
                : cellDef.key === 'blue'
                ? 'border-sky-900/60 bg-sky-950/20'
                : cellDef.key === 'green'
                ? 'border-emerald-900/60 bg-emerald-950/20'
                : 'border-slate-800 bg-slate-900/40';
            const labelColor =
              cellDef.key === 'red'
                ? 'text-red-400'
                : cellDef.key === 'blue'
                ? 'text-sky-400'
                : cellDef.key === 'green'
                ? 'text-emerald-400'
                : 'text-slate-300';
            return (
              <div key={cellDef.key} className={`p-3 rounded-lg border ${accent}`}>
                <div className="flex items-center gap-2">
                  <Users className={`w-3.5 h-3.5 ${labelColor}`} />
                  <h5 className={`text-[11px] font-mono font-bold uppercase ${labelColor}`}>
                    {cellDef.label}
                  </h5>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  {cellDef.description}
                </p>
                <p className="text-[9px] font-mono text-slate-600 mt-1.5">{cellDef.composition}</p>
                <div className="mt-2.5 space-y-2">
                  <LineInput
                    value={assignment?.lead || ''}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        cells: state.cells.map(c =>
                          c.cell === cellDef.key ? { ...c, lead: v } : c
                        ),
                      })
                    }
                    placeholder="Cell lead"
                    className="w-full"
                  />
                  <LineInput
                    value={assignment?.members || ''}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        cells: state.cells.map(c =>
                          c.cell === cellDef.key ? { ...c, members: v } : c
                        ),
                      })
                    }
                    placeholder="Members / augmentees"
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Figure IV-13 reference */}
      <div>
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-joint-800 transition"
        >
          <span className="text-[11px] font-mono text-joint-300 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            Sample Wargaming Steps — reference checklist
          </span>
          {showSteps ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
        {showSteps && (
          <div className="mt-2 space-y-2">
            {WARGAMING_STEPS.map(s => (
              <div key={s.step} className="p-3 rounded bg-slate-900/40 border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-joint-400 bg-joint-950 border border-joint-800 rounded px-1.5 py-0.5">
                    {s.step}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-200">{s.label}</span>
                </div>
                <ul className="mt-2 space-y-1 ml-2">
                  {s.actions.map((a, i) => (
                    <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                      <span className="text-joint-500 mt-0.5">•</span>
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-[9px] font-mono text-slate-600 text-right">JP 5-0, Figure IV-13</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Tab 2: Critical Events
// =============================================================================

const CriticalEventsTab: React.FC<{
  state: CoaAnalysisState;
  onChange: (state: CoaAnalysisState) => void;
}> = ({ state, onChange }) => {
  const addEvent = () => {
    const item: CriticalEvent = {
      id: `ce-${Date.now()}`,
      name: '',
      description: '',
      phase: '',
      timeframe: '',
      linkedEssentialTask: '',
      linkedDecisionPointId: '',
    };
    onChange({ ...state, criticalEvents: [...state.criticalEvents, item] });
  };

  const updateEvent = (id: string, updates: Partial<CriticalEvent>) =>
    onChange({
      ...state,
      criticalEvents: state.criticalEvents.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });

  const removeEvent = (id: string) =>
    onChange({
      ...state,
      criticalEvents: state.criticalEvents.filter(e => e.id !== id),
      turns: state.turns.filter(t => t.criticalEventId !== id),
      syncMatrix: state.syncMatrix.filter(s => s.criticalEventId !== id),
    });

  return (
    <div className="space-y-5">
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Critical events are essential tasks — or a series of critical tasks — that require detailed
          analysis, such as the component tasks performed on D-Day. They tie back to the essential
          tasks identified in mission analysis, and each links to a decision point in time and space.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-45 / IV-50</span>
        </p>
      </div>

      <SectionCard
        title="Known Critical Events"
        subtitle={`${state.criticalEvents.length} identified. These become the rows of the wargame and the synchronization matrix.`}
        doctrineRef="JP 5-0, IV-45"
      >
        <div className="space-y-2">
          {state.criticalEvents.map((ev, idx) => (
            <div key={ev.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-[10px] font-mono font-bold text-joint-400 w-6">
                  CE{String(idx + 1).padStart(2, '0')}
                </span>
                <LineInput
                  value={ev.name}
                  onChange={(v) => updateEvent(ev.id, { name: v })}
                  placeholder="Critical event name"
                  className="flex-1 min-w-[180px]"
                />
                <LineInput
                  value={ev.phase}
                  onChange={(v) => updateEvent(ev.id, { phase: v })}
                  placeholder="Phase"
                  className="w-24"
                />
                <LineInput
                  value={ev.timeframe}
                  onChange={(v) => updateEvent(ev.id, { timeframe: v })}
                  placeholder="Timeframe (e.g., D+2)"
                  className="w-36"
                />
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <LineInput
                  value={ev.linkedEssentialTask}
                  onChange={(v) => updateEvent(ev.id, { linkedEssentialTask: v })}
                  placeholder="Linked essential task (from mission analysis)"
                  className="flex-1 min-w-[200px]"
                />
                <LineInput
                  value={ev.description}
                  onChange={(v) => updateEvent(ev.id, { description: v })}
                  placeholder="Description / measure of assessment"
                  className="flex-1 min-w-[200px]"
                />
              </div>
            </div>
          ))}
          <AddRowButton onClick={addEvent} label="Add Critical Event" />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 3: Conduct the Wargame
// =============================================================================

const WargameTab: React.FC<{
  state: CoaAnalysisState;
  onChange: (state: CoaAnalysisState) => void;
  coaDevState: CoaDevelopmentState;
  activeCoaId: string;
  setActiveCoaId: (id: string) => void;
}> = ({ state, onChange, coaDevState, activeCoaId, setActiveCoaId }) => {
  const [activeEnemyCoa, setActiveEnemyCoa] = useState<EnemyCoaType>('mlcoa');
  const coas = coaDevState.coas;

  if (!coas.length) return <NoCoasNotice />;

  const turns = state.turns.filter(
    t => t.coaId === activeCoaId && t.enemyCoaType === activeEnemyCoa
  );

  const addTurn = () => {
    const item: WargameTurn = {
      id: `turn-${Date.now()}`,
      coaId: activeCoaId,
      enemyCoaType: activeEnemyCoa,
      criticalEventId: state.criticalEvents[0]?.id || '',
      turnNumber: turns.length + 1,
      action: '',
      reaction: '',
      counteraction: '',
      adjudication: '',
      insights: '',
      identifiedGaps: '',
    };
    onChange({ ...state, turns: [...state.turns, item] });
  };

  const updateTurn = (id: string, updates: Partial<WargameTurn>) =>
    onChange({ ...state, turns: state.turns.map(t => (t.id === id ? { ...t, ...updates } : t)) });

  const removeTurn = (id: string) =>
    onChange({ ...state, turns: state.turns.filter(t => t.id !== id) });

  return (
    <div className="space-y-5">
      {/* COA + enemy COA selectors */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {coas.map(c => {
            const isActive = c.id === activeCoaId;
            const approved = coaDevState.jfcGuidance.approvedCoaIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setActiveCoaId(c.id)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-joint-950 border-joint-500 text-joint-100 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-joint-800'
                }`}
              >
                {approved && <Check className="w-3 h-3 text-emerald-400" />}
                {c.designator}
                {c.name && <span className="text-slate-500 font-normal">— {c.name}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {ENEMY_COA_TYPES.map(ec => (
            <button
              key={ec.key}
              onClick={() => setActiveEnemyCoa(ec.key as EnemyCoaType)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition ${
                activeEnemyCoa === ec.key
                  ? 'bg-red-950/70 border-red-600 text-red-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-red-900'
              }`}
            >
              vs {ec.key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Doctrinal guardrails */}
      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-[10px] text-amber-200/80 leading-relaxed space-y-1">
          <p>
            <strong>Do not revise a COA during the wargame.</strong> Stop the wargame, make the
            revisions, and start over at the beginning.
          </p>
          <p>
            Do not compare one friendly COA against another here — that is Step 5. Comparing during
            the wargame introduces bias.
            <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-49</span>
          </p>
        </div>
      </div>

      {/* Turns */}
      <SectionCard
        title={`Wargame Turns — ${coas.find(c => c.id === activeCoaId)?.designator || ''} vs ${activeEnemyCoa.toUpperCase()}`}
        subtitle={`${turns.length} of ${state.setup.turnsPlanned} planned turns recorded. Each turn is three moves: action, reaction, counteraction.`}
        doctrineRef="JP 5-0, IV-48"
      >
        <div className="space-y-3">
          {turns.map((turn) => (
            <div key={turn.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-joint-300 bg-joint-950 border border-joint-800 rounded px-2 py-0.5">
                  TURN {turn.turnNumber}
                </span>
                <select
                  value={turn.criticalEventId}
                  onChange={(e) => updateTurn(turn.id, { criticalEventId: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-joint-500"
                >
                  <option value="">— critical event —</option>
                  {state.criticalEvents.map((ce, i) => (
                    <option key={ce.id} value={ce.id}>
                      CE{String(i + 1).padStart(2, '0')} {ce.name || '(unnamed)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeTurn(turn.id)}
                  className="text-slate-500 hover:text-red-400 ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* action / reaction / counteraction */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {WARGAME_MOVE_TYPES.map(move => {
                  const accent =
                    move.key === 'reaction'
                      ? 'border-red-900/60 focus-within:border-red-600'
                      : 'border-sky-900/60 focus-within:border-sky-600';
                  const labelColor = move.key === 'reaction' ? 'text-red-400' : 'text-sky-400';
                  return (
                    <div key={move.key} className={`p-2.5 rounded-lg border bg-slate-950/60 ${accent}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-mono font-bold uppercase ${labelColor}`}>
                          {move.label}
                        </span>
                        <span className="text-[9px] font-mono text-slate-600">{move.owner}</span>
                      </div>
                      <textarea
                        value={turn[move.key as 'action' | 'reaction' | 'counteraction']}
                        onChange={(e) => updateTurn(turn.id, { [move.key]: e.target.value })}
                        rows={4}
                        placeholder={move.description}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-100 focus:outline-none focus:border-joint-500 resize-none leading-relaxed"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <LineInput
                  value={turn.adjudication}
                  onChange={(v) => updateTurn(turn.id, { adjudication: v })}
                  placeholder="White cell adjudication"
                  className="w-full"
                />
                <LineInput
                  value={turn.insights}
                  onChange={(v) => updateTurn(turn.id, { insights: v })}
                  placeholder="Insights / evaluation criteria affected"
                  className="w-full"
                />
                <LineInput
                  value={turn.identifiedGaps}
                  onChange={(v) => updateTurn(turn.id, { identifiedGaps: v })}
                  placeholder="Gaps and seams identified"
                  className="w-full"
                />
              </div>
            </div>
          ))}
          <AddRowButton onClick={addTurn} label="Add Turn" />
        </div>
      </SectionCard>

      {/* Feasibility questions */}
      <SectionCard
        title="Continuous Feasibility Check"
        subtitle="Participants continually evaluate the COA's feasibility throughout the wargame."
        doctrineRef="JP 5-0, IV-49"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {WARGAME_FEASIBILITY_QUESTIONS.map((q, i) => (
            <div
              key={i}
              className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-300 leading-relaxed flex items-start gap-1.5"
            >
              <span className="text-joint-500 mt-0.5">•</span>
              {q}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 4: Synchronization Matrix
// =============================================================================

const SyncMatrixTab: React.FC<{
  state: CoaAnalysisState;
  onChange: (state: CoaAnalysisState) => void;
  coaDevState: CoaDevelopmentState;
  activeCoaId: string;
  setActiveCoaId: (id: string) => void;
}> = ({ state, onChange, coaDevState, activeCoaId, setActiveCoaId }) => {
  const coas = coaDevState.coas;
  if (!coas.length) return <NoCoasNotice />;

  const getCell = (jointFunction: string, criticalEventId: string) =>
    state.syncMatrix.find(
      s =>
        s.coaId === activeCoaId &&
        s.jointFunction === jointFunction &&
        s.criticalEventId === criticalEventId
    );

  const setCell = (jointFunction: string, criticalEventId: string, content: string) => {
    const existing = getCell(jointFunction, criticalEventId);
    if (existing) {
      onChange({
        ...state,
        syncMatrix: state.syncMatrix.map(s =>
          s.id === existing.id ? { ...s, content } : s
        ),
      });
    } else {
      onChange({
        ...state,
        syncMatrix: [
          ...state.syncMatrix,
          {
            id: `sm-${Date.now()}-${jointFunction}`,
            coaId: activeCoaId,
            jointFunction,
            criticalEventId,
            content,
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {coas.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCoaId(c.id)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition ${
              c.id === activeCoaId
                ? 'bg-joint-950 border-joint-500 text-joint-100 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-joint-800'
            }`}
          >
            {c.designator}
          </button>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          The synchronization matrix is both a decision-making tool and the method of recording
          wargame results. It helps the staff, supporting commands, and components visually
          synchronize the COA across time and space against the enemy&apos;s possible COAs, and is
          useful for identifying cross-component support resource requirements.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-49</span>
        </p>
      </div>

      {state.criticalEvents.length === 0 ? (
        <div className="p-8 text-center">
          <Grid3x3 className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            Add critical events first — they form the columns of the matrix.
          </p>
        </div>
      ) : (
        <SectionCard
          title="Synchronization Matrix"
          subtitle="Joint functions across critical events. Records what each function does at each event."
          doctrineRef="JP 5-0, IV-49"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-3 font-mono text-[10px] text-slate-500 uppercase sticky left-0 bg-slate-950 z-10 min-w-[140px]">
                    Joint Function
                  </th>
                  {state.criticalEvents.map((ce, i) => (
                    <th
                      key={ce.id}
                      className="text-left py-2 px-2 font-mono text-[10px] text-joint-300 min-w-[160px] align-bottom"
                    >
                      <div>CE{String(i + 1).padStart(2, '0')}</div>
                      <div className="text-slate-400 font-normal normal-case mt-0.5">
                        {ce.name || '(unnamed)'}
                      </div>
                      {ce.timeframe && (
                        <div className="text-slate-600 font-normal mt-0.5">{ce.timeframe}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOINT_FUNCTIONS.map(fn => (
                  <tr key={fn} className="border-t border-slate-900">
                    <td className="py-1.5 pr-3 text-slate-300 align-top sticky left-0 bg-slate-950 z-10">
                      {fn}
                    </td>
                    {state.criticalEvents.map(ce => (
                      <td key={ce.id} className="py-1.5 px-1 align-top">
                        <textarea
                          value={getCell(fn, ce.id)?.content || ''}
                          onChange={(e) => setCell(fn, ce.id, e.target.value)}
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-joint-500 resize-none leading-relaxed"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

// =============================================================================
// Tab 5: Products & Results
// =============================================================================

const OutputsTab: React.FC<{
  state: CoaAnalysisState;
  onChange: (state: CoaAnalysisState) => void;
  coaDevState: CoaDevelopmentState;
}> = ({ state, onChange, coaDevState }) => {
  const coas = coaDevState.coas;

  const getResult = (coaId: string): CoaWargameResult =>
    state.results.find(r => r.coaId === coaId) || {
      coaId,
      strengths: '',
      weaknesses: '',
      advantages: '',
      disadvantages: '',
      assessedRisk: 'not_assessed',
      riskRationale: '',
      feasibilityConfirmed: false,
      recommendation: 'pending',
    };

  const setResult = (coaId: string, updates: Partial<CoaWargameResult>) => {
    const existing = state.results.find(r => r.coaId === coaId);
    onChange({
      ...state,
      results: existing
        ? state.results.map(r => (r.coaId === coaId ? { ...r, ...updates } : r))
        : [...state.results, { ...getResult(coaId), ...updates }],
    });
  };

  const addDst = () => {
    const item: DecisionSupportEntry = {
      id: `dst-${Date.now()}`,
      coaId: coas[0]?.id || '',
      decisionPoint: '',
      criticalEvent: '',
      latestTimeToDecide: '',
      linkedCcir: '',
      namedAreaOfInterest: '',
      friendlyAction: '',
    };
    onChange({ ...state, decisionSupport: [...state.decisionSupport, item] });
  };

  const addBranchSequel = () => {
    const item: BranchSequel = {
      id: `bs-${Date.now()}`,
      coaId: coas[0]?.id || '',
      type: 'branch',
      name: '',
      trigger: '',
      description: '',
    };
    onChange({ ...state, branchesSequels: [...state.branchesSequels, item] });
  };

  const addHvt = () => {
    const item: HighValueTarget = {
      id: `hvt-${Date.now()}`,
      coaId: coas[0]?.id || '',
      target: '',
      jointFunction: JOINT_FUNCTIONS[3],
      whyCritical: '',
      linkedCog: '',
    };
    onChange({ ...state, highValueTargets: [...state.highValueTargets, item] });
  };

  const addShortfall = () => {
    const item: ResourceShortfall = {
      id: `sf-${Date.now()}`,
      coaId: coas[0]?.id || '',
      description: '',
      directorate: 'J-4',
      impact: 'medium',
      sourcingAction: '',
    };
    onChange({ ...state, shortfalls: [...state.shortfalls, item] });
  };

  const addRefinedCcir = () => {
    const item: RefinedCcir = {
      id: `rc-${Date.now()}`,
      coaId: coas[0]?.id || '',
      type: 'PIR',
      question: '',
      linkedDecisionPoint: '',
      namedAreaOfInterest: '',
      isNew: true,
    };
    onChange({ ...state, refinedCcirs: [...state.refinedCcirs, item] });
  };

  return (
    <div className="space-y-5">
      {/* Per-COA results */}
      {coas.length === 0 ? (
        <NoCoasNotice />
      ) : (
        <SectionCard
          title="Strengths, Weaknesses & Assessed Risk by COA"
          subtitle="The core of the back brief to the commander. Record advantages and disadvantages as they become evident during the wargame."
          doctrineRef="JP 5-0, IV-50 / IV-51"
        >
          <div className="space-y-3">
            {coas.map(coa => {
              const r = getResult(coa.id);
              return (
                <div key={coa.id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-[11px] font-mono font-bold text-joint-200 bg-joint-950 border border-joint-800 rounded px-2 py-0.5">
                      {coa.designator}
                    </span>
                    {coa.name && <span className="text-[11px] text-slate-400">{coa.name}</span>}
                    <div className="ml-auto flex items-center gap-2">
                      <select
                        value={r.assessedRisk}
                        onChange={(e) =>
                          setResult(coa.id, {
                            assessedRisk: e.target.value as CoaWargameResult['assessedRisk'],
                          })
                        }
                        className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                          r.assessedRisk === 'high'
                            ? 'border-red-800 text-red-400'
                            : r.assessedRisk === 'medium'
                            ? 'border-amber-800 text-amber-400'
                            : r.assessedRisk === 'low'
                            ? 'border-emerald-800 text-emerald-400'
                            : 'border-slate-700 text-slate-500'
                        }`}
                      >
                        <option value="not_assessed">RISK: NOT ASSESSED</option>
                        <option value="low">RISK: LOW</option>
                        <option value="medium">RISK: MEDIUM</option>
                        <option value="high">RISK: HIGH</option>
                      </select>
                      <select
                        value={r.recommendation}
                        onChange={(e) =>
                          setResult(coa.id, {
                            recommendation: e.target.value as CoaWargameResult['recommendation'],
                          })
                        }
                        className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                          r.recommendation === 'retain'
                            ? 'border-emerald-800 text-emerald-400'
                            : r.recommendation === 'discard'
                            ? 'border-red-800 text-red-400'
                            : r.recommendation === 'modify'
                            ? 'border-amber-800 text-amber-400'
                            : 'border-slate-700 text-slate-500'
                        }`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="retain">RETAIN</option>
                        <option value="modify">MODIFY</option>
                        <option value="discard">DISCARD</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Field
                      label="Strengths"
                      value={r.strengths}
                      onChange={(v) => setResult(coa.id, { strengths: v })}
                    />
                    <Field
                      label="Weaknesses"
                      value={r.weaknesses}
                      onChange={(v) => setResult(coa.id, { weaknesses: v })}
                    />
                    <Field
                      label="Advantages"
                      value={r.advantages}
                      onChange={(v) => setResult(coa.id, { advantages: v })}
                    />
                    <Field
                      label="Disadvantages"
                      value={r.disadvantages}
                      onChange={(v) => setResult(coa.id, { disadvantages: v })}
                    />
                  </div>

                  {r.recommendation === 'discard' && (
                    <p className="text-[10px] text-amber-400/90 mt-2 flex items-start gap-1.5 leading-relaxed">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      If suitability, feasibility, or acceptability becomes questionable during
                      analysis, the commander should modify or discard the COA and concentrate on the
                      others.
                      <span className="font-mono text-slate-600">JP 5-0, IV-51</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* DST / DSM */}
      <SectionCard
        title="Decision Support Template / Matrix"
        subtitle="Decision points tie to points in time and space where the commander makes a critical decision, and each ties to a CCIR."
        doctrineRef="JP 5-0, IV-50"
      >
        <div className="space-y-2">
          {state.decisionSupport.map(d => (
            <div key={d.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  value={d.coaId}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, coaId: e.target.value } : x
                      ),
                    })
                  }
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                >
                  {coas.map(c => (
                    <option key={c.id} value={c.id}>{c.designator}</option>
                  ))}
                </select>
                <LineInput
                  value={d.decisionPoint}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, decisionPoint: v } : x
                      ),
                    })
                  }
                  placeholder="Decision point"
                  className="flex-1 min-w-[150px]"
                />
                <LineInput
                  value={d.latestTimeToDecide}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, latestTimeToDecide: v } : x
                      ),
                    })
                  }
                  placeholder="Latest time to decide"
                  className="w-40"
                />
                <button
                  onClick={() =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.filter(x => x.id !== d.id),
                    })
                  }
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <LineInput
                  value={d.linkedCcir}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, linkedCcir: v } : x
                      ),
                    })
                  }
                  placeholder="Linked CCIR"
                  className="flex-1 min-w-[140px]"
                />
                <LineInput
                  value={d.namedAreaOfInterest}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, namedAreaOfInterest: v } : x
                      ),
                    })
                  }
                  placeholder="Named area of interest (NAI)"
                  className="flex-1 min-w-[160px]"
                />
                <LineInput
                  value={d.friendlyAction}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      decisionSupport: state.decisionSupport.map(x =>
                        x.id === d.id ? { ...x, friendlyAction: v } : x
                      ),
                    })
                  }
                  placeholder="Friendly action on decision"
                  className="flex-1 min-w-[160px]"
                />
              </div>
            </div>
          ))}
          <AddRowButton onClick={addDst} label="Add Decision Point" />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Branches & sequels */}
        <SectionCard
          title="Branches & Sequels"
          subtitle="Contingency options and follow-on operations identified during the wargame."
          doctrineRef="JP 5-0, IV-44"
        >
          <div className="space-y-2">
            {state.branchesSequels.map(bs => (
              <div key={bs.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={bs.type}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        branchesSequels: state.branchesSequels.map(x =>
                          x.id === bs.id ? { ...x, type: e.target.value as 'branch' | 'sequel' } : x
                        ),
                      })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                  >
                    {BRANCH_SEQUEL_TYPES.map(t => (
                      <option key={t.key} value={t.key}>{t.label.toUpperCase()}</option>
                    ))}
                  </select>
                  <select
                    value={bs.coaId}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        branchesSequels: state.branchesSequels.map(x =>
                          x.id === bs.id ? { ...x, coaId: e.target.value } : x
                        ),
                      })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-joint-500"
                  >
                    {coas.map(c => (
                      <option key={c.id} value={c.id}>{c.designator}</option>
                    ))}
                  </select>
                  <LineInput
                    value={bs.name}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        branchesSequels: state.branchesSequels.map(x =>
                          x.id === bs.id ? { ...x, name: v } : x
                        ),
                      })
                    }
                    placeholder="Name"
                    className="flex-1 min-w-[120px]"
                  />
                  <button
                    onClick={() =>
                      onChange({
                        ...state,
                        branchesSequels: state.branchesSequels.filter(x => x.id !== bs.id),
                      })
                    }
                    className="text-slate-500 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <LineInput
                  value={bs.trigger}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      branchesSequels: state.branchesSequels.map(x =>
                        x.id === bs.id ? { ...x, trigger: v } : x
                      ),
                    })
                  }
                  placeholder="Trigger condition"
                  className="w-full"
                />
              </div>
            ))}
            <AddRowButton onClick={addBranchSequel} label="Add Branch / Sequel" />
          </div>
        </SectionCard>

        {/* High-value targets */}
        <SectionCard
          title="High-Value Targets"
          subtitle="Identified through wargaming and tied to the enemy COG analysis."
          doctrineRef="JP 5-0, IV-44"
        >
          <div className="space-y-2">
            {state.highValueTargets.map(h => (
              <div key={h.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <LineInput
                    value={h.target}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        highValueTargets: state.highValueTargets.map(x =>
                          x.id === h.id ? { ...x, target: v } : x
                        ),
                      })
                    }
                    placeholder="Target"
                    className="flex-1 min-w-[130px]"
                  />
                  <select
                    value={h.jointFunction}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        highValueTargets: state.highValueTargets.map(x =>
                          x.id === h.id ? { ...x, jointFunction: e.target.value } : x
                        ),
                      })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                  >
                    {JOINT_FUNCTIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      onChange({
                        ...state,
                        highValueTargets: state.highValueTargets.filter(x => x.id !== h.id),
                      })
                    }
                    className="text-slate-500 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <LineInput
                  value={h.whyCritical}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      highValueTargets: state.highValueTargets.map(x =>
                        x.id === h.id ? { ...x, whyCritical: v } : x
                      ),
                    })
                  }
                  placeholder="Why critical / linked critical vulnerability"
                  className="w-full"
                />
              </div>
            ))}
            <AddRowButton onClick={addHvt} label="Add High-Value Target" />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shortfalls */}
        <SectionCard
          title="Newly Identified Resource Shortfalls"
          doctrineRef="JP 5-0, IV-51"
        >
          <div className="space-y-2">
            {state.shortfalls.map(s => (
              <div key={s.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-2 items-center flex-wrap">
                <select
                  value={s.directorate}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id ? { ...x, directorate: e.target.value } : x
                      ),
                    })
                  }
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-joint-500"
                >
                  {STAFF_DIRECTORATES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <LineInput
                  value={s.description}
                  onChange={(v) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id ? { ...x, description: v } : x
                      ),
                    })
                  }
                  placeholder="Shortfall"
                  className="flex-1 min-w-[140px]"
                />
                <select
                  value={s.impact}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id ? { ...x, impact: e.target.value as 'low' | 'medium' | 'high' } : x
                      ),
                    })
                  }
                  className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                    s.impact === 'high'
                      ? 'border-red-800 text-red-400'
                      : s.impact === 'medium'
                      ? 'border-amber-800 text-amber-400'
                      : 'border-emerald-800 text-emerald-400'
                  }`}
                >
                  <option value="low">LOW</option>
                  <option value="medium">MED</option>
                  <option value="high">HIGH</option>
                </select>
                <button
                  onClick={() =>
                    onChange({ ...state, shortfalls: state.shortfalls.filter(x => x.id !== s.id) })
                  }
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <AddRowButton onClick={addShortfall} label="Add Shortfall" />
          </div>
        </SectionCard>

        {/* Refined CCIRs */}
        <SectionCard
          title="Refined / New CCIRs"
          subtitle="PIRs tied to a decision point require a collection plan; JIPOE ties PIRs to NAIs."
          doctrineRef="JP 5-0, IV-50"
        >
          <div className="space-y-2">
            {state.refinedCcirs.map(c => (
              <div key={c.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={c.type}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        refinedCcirs: state.refinedCcirs.map(x =>
                          x.id === c.id ? { ...x, type: e.target.value as 'PIR' | 'FFIR' } : x
                        ),
                      })
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                  >
                    <option value="PIR">PIR</option>
                    <option value="FFIR">FFIR</option>
                  </select>
                  <LineInput
                    value={c.question}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        refinedCcirs: state.refinedCcirs.map(x =>
                          x.id === c.id ? { ...x, question: v } : x
                        ),
                      })
                    }
                    placeholder="Information requirement"
                    className="flex-1 min-w-[150px]"
                  />
                  <button
                    onClick={() =>
                      onChange({
                        ...state,
                        refinedCcirs: state.refinedCcirs.filter(x => x.id !== c.id),
                      })
                    }
                    className="text-slate-500 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <LineInput
                    value={c.linkedDecisionPoint}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        refinedCcirs: state.refinedCcirs.map(x =>
                          x.id === c.id ? { ...x, linkedDecisionPoint: v } : x
                        ),
                      })
                    }
                    placeholder="Linked decision point"
                    className="flex-1 min-w-[130px]"
                  />
                  <LineInput
                    value={c.namedAreaOfInterest}
                    onChange={(v) =>
                      onChange({
                        ...state,
                        refinedCcirs: state.refinedCcirs.map(x =>
                          x.id === c.id ? { ...x, namedAreaOfInterest: v } : x
                        ),
                      })
                    }
                    placeholder="NAI"
                    className="flex-1 min-w-[110px]"
                  />
                </div>
              </div>
            ))}
            <AddRowButton onClick={addRefinedCcir} label="Add CCIR" />
          </div>
        </SectionCard>
      </div>

      {/* Primary outputs checklist */}
      <SectionCard
        title="Primary Wargame Outputs"
        subtitle={`${Object.values(state.outputCompletion).filter(Boolean).length} of ${WARGAME_PRIMARY_OUTPUTS.length} products complete. These feed COA comparison, COA approval, and plan or order development.`}
        doctrineRef="JP 5-0, IV-50 to IV-51"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {WARGAME_PRIMARY_OUTPUTS.map(o => (
            <label
              key={o.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.outputCompletion[o.id]}
                onChange={(e) =>
                  onChange({
                    ...state,
                    outputCompletion: { ...state.outputCompletion, [o.id]: e.target.checked },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[10px] leading-relaxed ${
                  state.outputCompletion[o.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {o.label}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <Field
            label="Assessment plan and criteria"
            value={state.assessmentPlan}
            onChange={(v) => onChange({ ...state, assessmentPlan: v })}
            placeholder="How the commander will assess progress: measures of effectiveness, measures of performance, reporting cadence..."
            rows={3}
          />
        </div>
      </SectionCard>

      {/* Analysis purposes checklist */}
      <SectionCard
        title="COA Analysis Coverage"
        subtitle={`${Object.values(state.purposeCompletion).filter(Boolean).length} of ${COA_ANALYSIS_PURPOSES.length} analytical objectives addressed.`}
        doctrineRef="JP 5-0, IV-43 to IV-44"
      >
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {COA_ANALYSIS_PURPOSES.map((p, idx) => (
            <label
              key={p.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.purposeCompletion[p.id]}
                onChange={(e) =>
                  onChange({
                    ...state,
                    purposeCompletion: { ...state.purposeCompletion, [p.id]: e.target.checked },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span className="text-[9px] font-mono text-slate-600 mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span
                className={`text-[10px] leading-relaxed flex-1 ${
                  state.purposeCompletion[p.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {p.label}
              </span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const CoaAnalysis: React.FC<CoaAnalysisProps> = ({
  onOpenExportModal,
}) => {
  const {
    scenario,
    coaAnalysis: state,
    setCoaAnalysis: onStateChange,
    // Step 3 output feeds Step 4 (JP 5-0, Figure IV-12 key inputs)
    coaDevelopment: coaDevState,
  } = usePlanning();
  const [activeTab, setActiveTab] = useState<TabId>('prepare');
  const [generating, setGenerating] = useState(false);
  const [activeCoaId, setActiveCoaId] = useState<string>(coaDevState.coas[0]?.id || '');

  const resolvedCoaId = useMemo(() => {
    if (coaDevState.coas.some(c => c.id === activeCoaId)) return activeCoaId;
    return coaDevState.coas[0]?.id || '';
  }, [coaDevState.coas, activeCoaId]);

  /**
   * JP 5-0, IV-45: "For a valid COA comparison (JPP step 5), planners wargame
   * each friendly COA against the same set of threat COAs."
   */
  const unevenCoverage = useMemo(() => {
    if (coaDevState.coas.length < 2) return false;
    const signature = (coaId: string) =>
      state.setup.enemyCoasToWargame
        .map(ec => (state.turns.some(t => t.coaId === coaId && t.enemyCoaType === ec) ? '1' : '0'))
        .join('');
    const sigs = new Set(coaDevState.coas.map(c => signature(c.id)));
    return sigs.size > 1;
  }, [coaDevState.coas, state.turns, state.setup.enemyCoasToWargame]);

  const totalTurns = state.turns.length;
  const wargamedCoas = new Set(state.turns.map(t => t.coaId)).size;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 4 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Chapter IV, para 4.e</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Swords className="w-5 h-5 text-joint-400" />
              COA Analysis and Wargaming
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Wargame each COA for Operation {scenario.operationName} against the enemy MLCOA and
              MDCOA using action, reaction, and counteraction — revealing strengths, weaknesses, and
              risk for each.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGenerating(true);
                setTimeout(() => setGenerating(false), 900);
              }}
              disabled={generating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 transition shadow-md shadow-emerald-950/40 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Synthesizing...' : 'AI Staff Assistant'}</span>
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

        {/* Status strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {wargamedCoas}
              <span className="text-slate-600 text-xs">/{coaDevState.coas.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">COAs Wargamed</div>
          </div>
          <div className="p-2.5 bg-joint-950/50 rounded border border-joint-800 text-center">
            <div className="text-lg font-mono font-bold text-joint-300">{totalTurns}</div>
            <div className="text-[9px] text-joint-400 uppercase font-mono">Turns Recorded</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">{state.criticalEvents.length}</div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Critical Events</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {Object.values(state.outputCompletion).filter(Boolean).length}
              <span className="text-slate-600 text-xs">/{WARGAME_PRIMARY_OUTPUTS.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Products Complete</div>
          </div>
        </div>

        {unevenCoverage && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/60 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-200/85 leading-relaxed">
              COAs have not all been wargamed against the same set of threat COAs. For a valid COA
              comparison in Step 5, each friendly COA must be wargamed against the same threat COAs.
              <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-45</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium font-mono border-b-2 transition -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-joint-400 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'prepare' && (
          <PrepareTab state={state} onChange={onStateChange} coaDevState={coaDevState} />
        )}
        {activeTab === 'events' && <CriticalEventsTab state={state} onChange={onStateChange} />}
        {activeTab === 'wargame' && (
          <WargameTab
            state={state}
            onChange={onStateChange}
            coaDevState={coaDevState}
            activeCoaId={resolvedCoaId}
            setActiveCoaId={setActiveCoaId}
          />
        )}
        {activeTab === 'sync' && (
          <SyncMatrixTab
            state={state}
            onChange={onStateChange}
            coaDevState={coaDevState}
            activeCoaId={resolvedCoaId}
            setActiveCoaId={setActiveCoaId}
          />
        )}
        {activeTab === 'outputs' && (
          <OutputsTab state={state} onChange={onStateChange} coaDevState={coaDevState} />
        )}
      </div>
    </div>
  );
};
