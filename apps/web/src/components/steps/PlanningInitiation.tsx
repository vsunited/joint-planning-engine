'use client';

import type { PlanningAuthority } from '@jpe/shared';

import React, { useState, useCallback, useMemo } from 'react';
import {
  PLANNING_TRIGGERS,
  STAFF_DIRECTORATES,
  DIRECTORATE_ROLES,
  INITIAL_STAFF_ACTIONS,
  COMBATANT_COMMANDS,
  NON_CCMD_PLANNING_AUTHORITIES,
} from '@jpe/shared';
import {
  Radio,
  Users,
  FileWarning,
  Clock,
  ClipboardCheck,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Presentation,
  Info,
  Check,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import {
  PlanningInitiationState,
  PlanningTrigger,
  CommanderGuidance,
  PlanningOrganization,
  PlanningOrgMember,
  WarnordContent,
  TimeAllocation,
  StaffAction,
  PlanningMilestone,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

export function createDefaultPlanningInitState(
  scenario: OperationalScenario
): PlanningInitiationState {
  const defaultMembers: PlanningOrgMember[] = STAFF_DIRECTORATES.map((dir) => ({
    directorate: dir,
    name: '',
    role: DIRECTORATE_ROLES[dir] || dir,
    status: 'pending' as const,
  }));

  const defaultActions: StaffAction[] = INITIAL_STAFF_ACTIONS.map((sa) => ({
    id: sa.id,
    label: sa.label,
    description: sa.description,
    responsible: sa.responsible,
    completed: false,
  }));

  return {
    trigger: {
      type: 'WARNORD',
      // Always a combatant command now, so there is nothing to fall back to.
      source: scenario.higherHq,
      dtg: '',
      classification: scenario.classification,
      summary: '',
    },
    commanderGuidance: {
      operationalApproach: '',
      problemFraming: '',
      constraints: [],
      restraints: [],
      coordinationRequirements: [],
      timelineGuidance: '',
    },
    planningOrg: {
      type: 'JPG',
      lead: 'J-5',
      planningContext: 'deliberate',
      members: defaultMembers,
    },
    warnord: {
      situation: '',
      commandRelationships: '',
      mission: '',
      constraints: [],
      restraints: [],
      forcesAllocated: '',
      anticipatedTimeline: { mDay: '', cDay: '', dDay: '' },
      assumptions: [],
      secDefApprovalRequired: false,
    },
    timeAllocation: {
      totalHoursToExecution: 72,
      staffAllocation: 24,
      subordinateAllocation: 48,
      planningMilestones: [
        { id: 'ms-1', name: 'Mission Analysis Complete', targetDtg: '', status: 'pending' },
        { id: 'ms-2', name: 'COA Brief to CDR', targetDtg: '', status: 'pending' },
        { id: 'ms-3', name: 'WARNORD 2 Published', targetDtg: '', status: 'pending' },
        { id: 'ms-4', name: 'OPORD Published', targetDtg: '', status: 'pending' },
      ],
    },
    staffActions: defaultActions,
    existingPlansReviewed: [],
    notes: '',
  };
}

// =============================================================================
// Props
// =============================================================================

interface PlanningInitiationProps {
  onOpenExportModal: () => void;
}

// =============================================================================
// Tab IDs
// =============================================================================

type TabId = 'trigger' | 'org' | 'warnord' | 'time' | 'actions';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'trigger', label: 'Trigger & Guidance', icon: Radio },
  { id: 'org', label: 'Planning Organization', icon: Users },
  { id: 'warnord', label: 'WARNORD Builder', icon: FileWarning },
  { id: 'time', label: 'Time Allocation', icon: Clock },
  { id: 'actions', label: 'Staff Actions', icon: ClipboardCheck },
];

// =============================================================================
// Shared UI Primitives
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

const ChipList: React.FC<{
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  chipColor?: string;
}> = ({ items, onAdd, onRemove, placeholder, chipColor = 'bg-joint-950 border-joint-800 text-joint-200' }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 transition"
        />
        <button
          onClick={handleAdd}
          className="px-2.5 py-1.5 bg-joint-950 hover:bg-joint-900 text-joint-300 rounded-lg border border-joint-800 transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${chipColor}`}
            >
              {item}
              <button
                onClick={() => onRemove(idx)}
                className="hover:text-red-400 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

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
// Tab 1: Trigger & Guidance
// =============================================================================

const TriggerAndGuidanceTab: React.FC<{
  state: PlanningInitiationState;
  onChange: (state: PlanningInitiationState) => void;
  scenario: OperationalScenario;
}> = ({ state, onChange, scenario }) => {
  const updateTrigger = (updates: Partial<PlanningTrigger>) =>
    onChange({ ...state, trigger: { ...state.trigger, ...updates } });

  const updateGuidance = (updates: Partial<CommanderGuidance>) =>
    onChange({ ...state, commanderGuidance: { ...state.commanderGuidance, ...updates } });

  const selectedTrigger = PLANNING_TRIGGERS.find(t => t.key === state.trigger.type);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left: Planning Trigger */}
      <div className="space-y-4">
        <SectionCard title="Planning Trigger" subtitle="What initiated this planning effort?">
          <div className="space-y-3">
            {/* Trigger Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              {PLANNING_TRIGGERS.map((trigger) => (
                <button
                  key={trigger.key}
                  onClick={() => updateTrigger({ type: trigger.key as PlanningTrigger['type'] })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    state.trigger.type === trigger.key
                      ? 'bg-joint-950/80 border-joint-500 shadow-lg shadow-joint-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`text-[11px] font-mono font-bold ${
                    state.trigger.type === trigger.key ? 'text-joint-200' : 'text-slate-300'
                  }`}>
                    {trigger.key}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{trigger.source}</div>
                </button>
              ))}
            </div>

            {/* Trigger Description */}
            {selectedTrigger && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">{selectedTrigger.description}</p>
              </div>
            )}

            {/* Source and DTG */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Source HQ</label>
                <select
                  value={state.trigger.source}
                  onChange={(e) => updateTrigger({ source: e.target.value as PlanningAuthority })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500 transition"
                >
                  <optgroup label="Combatant commands">
                    {COMBATANT_COMMANDS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.key}
                        {c.key === scenario.higherHq ? '  (higher HQ)' : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other authorities">
                    {NON_CCMD_PLANNING_AUTHORITIES.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Date-Time Group (DTG)</label>
                <input
                  type="text"
                  value={state.trigger.dtg}
                  onChange={(e) => updateTrigger({ dtg: e.target.value })}
                  placeholder="101200Z SEP 2026"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500 transition font-mono"
                />
              </div>
            </div>

            {/* Trigger Summary */}
            <TextArea
              value={state.trigger.summary}
              onChange={(val) => updateTrigger({ summary: val })}
              placeholder="Brief summary of the directive or situation that initiated planning..."
              label="Directive Summary"
              rows={3}
            />
          </div>
        </SectionCard>
      </div>

      {/* Right: Commander's Initial Planning Guidance */}
      <div className="space-y-4">
        <SectionCard
          title="Commander's Initial Planning Guidance (CIPG)"
          subtitle={`CDR ${scenario.jtfName} guidance to orient the staff`}
        >
          <div className="space-y-4">
            <TextArea
              value={state.commanderGuidance.problemFraming}
              onChange={(val) => updateGuidance({ problemFraming: val })}
              placeholder="What is going on? Why is this happening? What is the core problem to be solved?"
              label="Problem Framing"
              rows={3}
            />

            <TextArea
              value={state.commanderGuidance.operationalApproach}
              onChange={(val) => updateGuidance({ operationalApproach: val })}
              placeholder="Commander's initial visualization of the operational approach..."
              label="Operational Approach"
              rows={3}
            />

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Constraints <span className="text-amber-400/80">(must do)</span>
              </label>
              <ChipList
                items={state.commanderGuidance.constraints}
                onAdd={(item) => updateGuidance({ constraints: [...state.commanderGuidance.constraints, item] })}
                onRemove={(idx) => updateGuidance({ constraints: state.commanderGuidance.constraints.filter((_, i) => i !== idx) })}
                placeholder="Add constraint..."
                chipColor="bg-amber-950/60 border-amber-800/60 text-amber-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Restraints <span className="text-red-400/80">(cannot do)</span>
              </label>
              <ChipList
                items={state.commanderGuidance.restraints}
                onAdd={(item) => updateGuidance({ restraints: [...state.commanderGuidance.restraints, item] })}
                onRemove={(idx) => updateGuidance({ restraints: state.commanderGuidance.restraints.filter((_, i) => i !== idx) })}
                placeholder="Add restraint..."
                chipColor="bg-red-950/60 border-red-800/60 text-red-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Coordination Requirements</label>
              <ChipList
                items={state.commanderGuidance.coordinationRequirements}
                onAdd={(item) => updateGuidance({ coordinationRequirements: [...state.commanderGuidance.coordinationRequirements, item] })}
                onRemove={(idx) => updateGuidance({ coordinationRequirements: state.commanderGuidance.coordinationRequirements.filter((_, i) => i !== idx) })}
                placeholder="Supporting command, interagency partner, or ally..."
              />
            </div>

            <TextArea
              value={state.commanderGuidance.timelineGuidance}
              onChange={(val) => updateGuidance({ timelineGuidance: val })}
              placeholder="Timeline expectations, D-day/C-day/M-day horizons..."
              label="Timeline Guidance"
              rows={2}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// =============================================================================
// Tab 2: Planning Organization
// =============================================================================

const PlanningOrgTab: React.FC<{
  state: PlanningInitiationState;
  onChange: (state: PlanningInitiationState) => void;
  scenario: OperationalScenario;
}> = ({ state, onChange, scenario }) => {
  const updateOrg = (updates: Partial<PlanningOrganization>) =>
    onChange({ ...state, planningOrg: { ...state.planningOrg, ...updates } });

  const updateMember = (idx: number, updates: Partial<PlanningOrgMember>) => {
    const members = [...state.planningOrg.members];
    members[idx] = { ...members[idx], ...updates };
    updateOrg({ members });
  };

  const assignedCount = state.planningOrg.members.filter(m => m.status === 'assigned').length;
  const totalCount = state.planningOrg.members.length;

  return (
    <div className="space-y-5">
      {/* Org Type & Context Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Organization Type">
          <div className="flex gap-2">
            {(['JPG', 'OPT', 'OPG'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateOrg({
                  type: t,
                  lead: t === 'OPT' ? 'J-3' : 'J-5',
                  planningContext: t === 'OPT' ? 'crisis' : 'deliberate',
                })}
                className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-mono font-bold transition ${
                  state.planningOrg.type === t
                    ? 'bg-joint-950/80 border-joint-500 text-joint-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Planning Context">
          <div className="flex gap-2">
            {(['deliberate', 'crisis'] as const).map((ctx) => (
              <button
                key={ctx}
                onClick={() => updateOrg({
                  planningContext: ctx,
                  lead: ctx === 'crisis' ? 'J-3' : 'J-5',
                })}
                className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium capitalize transition ${
                  state.planningOrg.planningContext === ctx
                    ? ctx === 'crisis'
                      ? 'bg-red-950/60 border-red-700 text-red-200'
                      : 'bg-joint-950/80 border-joint-500 text-joint-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {ctx}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Organization Lead">
          <div className="flex items-center gap-3 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <Shield className="w-5 h-5 text-joint-400" />
            <div>
              <div className="text-sm font-bold text-white">{state.planningOrg.lead}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {state.planningOrg.planningContext === 'crisis' ? 'Current Ops' : 'Plans & Strategy'}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Staff Roster */}
      <SectionCard
        title={`${scenario.jtfName} ${state.planningOrg.type} Staff Roster`}
        subtitle={`${assignedCount} of ${totalCount} positions filled`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-400 uppercase">Directorate</th>
                <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-400 uppercase">Functional Role</th>
                <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-400 uppercase">Assigned Officer</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.planningOrg.members.map((member, idx) => (
                <tr
                  key={member.directorate}
                  className="border-b border-slate-800/50 hover:bg-slate-900/40 transition"
                >
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-joint-300">{member.directorate}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{member.role}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(idx, {
                        name: e.target.value,
                        status: e.target.value.trim() ? 'assigned' : 'pending',
                      })}
                      placeholder="Name / Rank..."
                      className="w-full bg-transparent border-b border-slate-700/60 focus:border-joint-500 px-1 py-1 text-slate-100 focus:outline-none transition text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        const statusCycle: PlanningOrgMember['status'][] = ['pending', 'assigned', 'unavailable'];
                        const nextIdx = (statusCycle.indexOf(member.status) + 1) % statusCycle.length;
                        updateMember(idx, { status: statusCycle[nextIdx] });
                      }}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition ${
                        member.status === 'assigned'
                          ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                          : member.status === 'unavailable'
                          ? 'bg-red-950/60 border-red-700/60 text-red-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      {member.status.toUpperCase()}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add LNO Row */}
        <button
          onClick={() => updateOrg({
            members: [...state.planningOrg.members, {
              directorate: 'LNO',
              name: '',
              role: 'Liaison Officer',
              status: 'pending',
            }],
          })}
          className="mt-3 flex items-center gap-1.5 text-[11px] text-joint-300 hover:text-joint-200 font-mono font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add LNO / External Member
        </button>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 3: WARNORD Builder
// =============================================================================

const WarnordBuilderTab: React.FC<{
  state: PlanningInitiationState;
  onChange: (state: PlanningInitiationState) => void;
  scenario: OperationalScenario;
}> = ({ state, onChange, scenario }) => {
  const updateWarnord = (updates: Partial<WarnordContent>) =>
    onChange({ ...state, warnord: { ...state.warnord, ...updates } });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    situation: true,
    commandRelationships: true,
    mission: true,
    limitations: false,
    forces: false,
    timeline: false,
    assumptions: false,
  });

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const WarnordSection: React.FC<{
    sectionKey: string;
    number: number;
    title: string;
    children: React.ReactNode;
  }> = ({ sectionKey, number, title, children }) => (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900/80 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
            {number}
          </span>
          <span className="text-xs font-semibold text-slate-200">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* WARNORD Header */}
      <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2.5">
          <FileWarning className="w-4 h-4 text-joint-400" />
          <div>
            <div className="text-xs font-bold text-white">
              WARNORD — {scenario.jtfName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Operation {scenario.operationName} • {scenario.classification}
            </div>
          </div>
        </div>
        {state.warnord.secDefApprovalRequired && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-800/60 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-amber-300">SecDef APPROVAL REQUIRED</span>
          </div>
        )}
      </div>

      {/* Section 1: Situation */}
      <WarnordSection sectionKey="situation" number={1} title="Situation">
        <TextArea
          value={state.warnord.situation}
          onChange={(val) => updateWarnord({ situation: val })}
          placeholder="Description of the operational situation and background that necessitated this planning effort..."
          rows={4}
        />
      </WarnordSection>

      {/* Section 2: Command Relationships */}
      <WarnordSection sectionKey="commandRelationships" number={2} title="Command Relationships">
        <TextArea
          value={state.warnord.commandRelationships}
          onChange={(val) => updateWarnord({ commandRelationships: val })}
          placeholder="Supported/supporting commanders, coordinating authorities, command relationships (OPCON, TACON, Support)..."
          rows={3}
        />
      </WarnordSection>

      {/* Section 3: Mission */}
      <WarnordSection sectionKey="mission" number={3} title="Mission">
        <TextArea
          value={state.warnord.mission}
          onChange={(val) => updateWarnord({ mission: val })}
          placeholder="Mission statement or statement of the higher commander's intent..."
          rows={3}
        />
      </WarnordSection>

      {/* Section 4: Operational Limitations */}
      <WarnordSection sectionKey="limitations" number={4} title="Operational Limitations">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-amber-300/80 mb-1.5">
              Constraints (must do)
            </label>
            <ChipList
              items={state.warnord.constraints}
              onAdd={(item) => updateWarnord({ constraints: [...state.warnord.constraints, item] })}
              onRemove={(idx) => updateWarnord({ constraints: state.warnord.constraints.filter((_, i) => i !== idx) })}
              placeholder="Add constraint..."
              chipColor="bg-amber-950/60 border-amber-800/60 text-amber-200"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-red-300/80 mb-1.5">
              Restraints (cannot do)
            </label>
            <ChipList
              items={state.warnord.restraints}
              onAdd={(item) => updateWarnord({ restraints: [...state.warnord.restraints, item] })}
              onRemove={(idx) => updateWarnord({ restraints: state.warnord.restraints.filter((_, i) => i !== idx) })}
              placeholder="Add restraint..."
              chipColor="bg-red-950/60 border-red-800/60 text-red-200"
            />
          </div>
        </div>
      </WarnordSection>

      {/* Section 5: Forces Allocated */}
      <WarnordSection sectionKey="forces" number={5} title="Forces & Strategic Mobility Resources">
        <TextArea
          value={state.warnord.forcesAllocated}
          onChange={(val) => updateWarnord({ forcesAllocated: val })}
          placeholder="Forces and strategic mobility resources allocated or direction for the supported commander to identify requirements..."
          rows={3}
        />
      </WarnordSection>

      {/* Section 6: Anticipated Timeline */}
      <WarnordSection sectionKey="timeline" number={6} title="Anticipated Timeline">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1.5">M-Day (Mobilization)</label>
            <input
              type="text"
              value={state.warnord.anticipatedTimeline.mDay}
              onChange={(e) => updateWarnord({ anticipatedTimeline: { ...state.warnord.anticipatedTimeline, mDay: e.target.value } })}
              placeholder="TBD"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500 font-mono transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1.5">C-Day (Deployment)</label>
            <input
              type="text"
              value={state.warnord.anticipatedTimeline.cDay}
              onChange={(e) => updateWarnord({ anticipatedTimeline: { ...state.warnord.anticipatedTimeline, cDay: e.target.value } })}
              placeholder="TBD"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500 font-mono transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1.5">D-Day (Employment)</label>
            <input
              type="text"
              value={state.warnord.anticipatedTimeline.dDay}
              onChange={(e) => updateWarnord({ anticipatedTimeline: { ...state.warnord.anticipatedTimeline, dDay: e.target.value } })}
              placeholder="TBD"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-joint-500 font-mono transition"
            />
          </div>
        </div>
        {/* SecDef Approval Toggle */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-900/40">
          <button
            onClick={() => updateWarnord({ secDefApprovalRequired: !state.warnord.secDefApprovalRequired })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
              state.warnord.secDefApprovalRequired
                ? 'bg-amber-600 border-amber-500'
                : 'border-slate-600 hover:border-amber-600'
            }`}
          >
            {state.warnord.secDefApprovalRequired && <Check className="w-3 h-3 text-white" />}
          </button>
          <div>
            <div className="text-xs font-semibold text-amber-200">SecDef Approval Required</div>
            <div className="text-[10px] text-slate-400">Required when WARNORD includes deployment of forces or PTDO actions</div>
          </div>
        </div>
      </WarnordSection>

      {/* Section 7: Assumptions */}
      <WarnordSection sectionKey="assumptions" number={7} title="Assumptions">
        <div className="mb-2">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 mb-3">
            <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Valid assumptions must be <strong className="text-slate-300">logical</strong>, <strong className="text-slate-300">realistic</strong>, and <strong className="text-slate-300">essential</strong>. 
              Phrase as &ldquo;will&rdquo; or &ldquo;will not&rdquo; — not &ldquo;should&rdquo; or &ldquo;may.&rdquo;
            </p>
          </div>
        </div>
        <ChipList
          items={state.warnord.assumptions}
          onAdd={(item) => updateWarnord({ assumptions: [...state.warnord.assumptions, item] })}
          onRemove={(idx) => updateWarnord({ assumptions: state.warnord.assumptions.filter((_, i) => i !== idx) })}
          placeholder="Add assumption (e.g., 'Host nation will grant overflight rights')..."
          chipColor="bg-slate-800/60 border-slate-700 text-slate-200"
        />
      </WarnordSection>
    </div>
  );
};

// =============================================================================
// Tab 4: Time Allocation (1/3–2/3 Rule)
// =============================================================================

const TimeAllocationTab: React.FC<{
  state: PlanningInitiationState;
  onChange: (state: PlanningInitiationState) => void;
  scenario: OperationalScenario;
}> = ({ state, onChange, scenario }) => {
  const updateTime = (updates: Partial<TimeAllocation>) =>
    onChange({ ...state, timeAllocation: { ...state.timeAllocation, ...updates } });

  const handleTotalChange = (total: number) => {
    updateTime({
      totalHoursToExecution: total,
      staffAllocation: Math.round(total / 3),
      subordinateAllocation: Math.round((total * 2) / 3),
    });
  };

  const updateMilestone = (idx: number, updates: Partial<PlanningMilestone>) => {
    const milestones = [...state.timeAllocation.planningMilestones];
    milestones[idx] = { ...milestones[idx], ...updates };
    updateTime({ planningMilestones: milestones });
  };

  const total = state.timeAllocation.totalHoursToExecution;
  const staff = state.timeAllocation.staffAllocation;
  const sub = state.timeAllocation.subordinateAllocation;
  const staffPct = total > 0 ? (staff / total) * 100 : 33.3;
  const subPct = total > 0 ? (sub / total) * 100 : 66.7;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Time Calculator */}
      <div className="lg:col-span-2 space-y-5">
        <SectionCard
          title="1/3 – 2/3 Rule Calculator"
          subtitle="Staff uses ≤ 1/3 of available time; subordinates receive ≥ 2/3 for parallel planning"
        >
          <div className="space-y-5">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono text-slate-400">Total Hours to Execution</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => handleTotalChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white font-mono font-bold text-center focus:outline-none focus:border-joint-500 transition"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">hrs</span>
                </div>
              </div>
              <input
                type="range"
                min={6}
                max={720}
                step={6}
                value={total}
                onChange={(e) => handleTotalChange(parseInt(e.target.value))}
                className="w-full accent-joint-500 h-2 rounded-full appearance-none bg-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>6h (Crisis)</span>
                <span>72h</span>
                <span>168h (7 days)</span>
                <span>720h (30 days)</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div>
              <div className="h-10 rounded-lg overflow-hidden flex border border-slate-700">
                <div
                  className="bg-gradient-to-r from-joint-700 to-joint-500 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${staffPct}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                    HQ STAFF: {staff}h
                  </span>
                </div>
                <div
                  className="bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${subPct}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-100 drop-shadow">
                    SUBORDINATE CMDS: {sub}h
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] font-mono text-joint-300">1/3 ({staffPct.toFixed(0)}%)</span>
                <span className="text-[10px] font-mono text-slate-400">2/3 ({subPct.toFixed(0)}%)</span>
              </div>
            </div>

            {/* Key Numbers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400">Total Window</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">{total}h</div>
                <div className="text-[10px] text-slate-500">{(total / 24).toFixed(1)} days</div>
              </div>
              <div className="p-3 bg-joint-950/60 rounded-lg border border-joint-800/80 text-center">
                <div className="text-[10px] font-mono text-joint-300">JTF HQ (1/3)</div>
                <div className="text-lg font-bold text-joint-200 font-mono mt-0.5">{staff}h</div>
                <div className="text-[10px] text-joint-400/80">{(staff / 24).toFixed(1)} days</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400">Subordinates (2/3)</div>
                <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">{sub}h</div>
                <div className="text-[10px] text-slate-500">{(sub / 24).toFixed(1)} days</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Right: Milestones */}
      <div>
        <SectionCard title="Planning Milestones" subtitle="Key decision points and deadlines">
          <div className="space-y-2.5">
            {state.timeAllocation.planningMilestones.map((ms, idx) => (
              <div
                key={ms.id}
                className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-200">{ms.name}</span>
                  <button
                    onClick={() => {
                      const cycle: PlanningMilestone['status'][] = ['pending', 'in_progress', 'complete'];
                      const nextIdx = (cycle.indexOf(ms.status) + 1) % cycle.length;
                      updateMilestone(idx, { status: cycle[nextIdx] });
                    }}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition ${
                      ms.status === 'complete'
                        ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                        : ms.status === 'in_progress'
                        ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {ms.status.replace('_', ' ').toUpperCase()}
                  </button>
                </div>
                <input
                  type="text"
                  value={ms.targetDtg}
                  onChange={(e) => updateMilestone(idx, { targetDtg: e.target.value })}
                  placeholder="DTG or NLT date..."
                  className="w-full bg-transparent border-b border-slate-700/60 focus:border-joint-500 px-1 py-1 text-[11px] text-slate-300 focus:outline-none font-mono transition"
                />
              </div>
            ))}

            {/* Add Milestone */}
            <button
              onClick={() => updateTime({
                planningMilestones: [
                  ...state.timeAllocation.planningMilestones,
                  { id: `ms-${Date.now()}`, name: 'New Milestone', targetDtg: '', status: 'pending' },
                ],
              })}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] text-joint-300 hover:text-joint-200 font-mono font-medium py-2 border border-dashed border-slate-700 rounded-lg hover:border-joint-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// =============================================================================
// Tab 5: Staff Actions Checklist
// =============================================================================

const StaffActionsTab: React.FC<{
  state: PlanningInitiationState;
  onChange: (state: PlanningInitiationState) => void;
}> = ({ state, onChange }) => {
  const toggleAction = (idx: number) => {
    const actions = [...state.staffActions];
    actions[idx] = {
      ...actions[idx],
      completed: !actions[idx].completed,
      completedAt: !actions[idx].completed ? new Date().toISOString() : undefined,
    };
    onChange({ ...state, staffActions: actions });
  };

  const completedCount = state.staffActions.filter(a => a.completed).length;
  const totalCount = state.staffActions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Left: Checklist */}
      <div className="lg:col-span-3">
        <SectionCard
          title="Initial Staff Actions Checklist"
          subtitle="10 doctrinal actions to complete during Planning Initiation (JP 5-0)"
        >
          <div className="space-y-2">
            {state.staffActions.map((action, idx) => (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                  action.completed
                    ? 'bg-emerald-950/20 border-emerald-900/40'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleAction(idx)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                    action.completed
                      ? 'bg-emerald-600 border-emerald-500'
                      : 'border-slate-600 hover:border-joint-500'
                  }`}
                >
                  {action.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-joint-400 font-bold">{action.id.toUpperCase()}</span>
                    <span className={`text-xs font-medium leading-tight ${
                      action.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                    }`}>
                      {action.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{action.description}</p>
                </div>

                <span className={`shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  action.completed
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}>
                  {action.responsible}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Right: Progress Summary */}
      <div>
        <SectionCard title="Step 1 Progress">
          <div className="space-y-4">
            {/* Progress Circle */}
            <div className="flex flex-col items-center py-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(30,41,59)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPct * 2.64} ${264 - progressPct * 2.64}`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(139,92,246)" />
                      <stop offset="100%" stopColor="rgb(168,85,247)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white font-mono">{progressPct.toFixed(0)}%</span>
                  <span className="text-[9px] text-slate-400 font-mono">COMPLETE</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {completedCount} of {totalCount} actions
              </div>
            </div>

            {/* Per-directorate Status */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">By Directorate</h5>
              {Array.from(new Set(state.staffActions.map(a => a.responsible))).map((dir) => {
                const dirActions = state.staffActions.filter(a => a.responsible === dir);
                const dirComplete = dirActions.filter(a => a.completed).length;
                return (
                  <div key={dir} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/40">
                    <span className="text-[10px] font-mono text-joint-300">{dir}</span>
                    <span className={`text-[10px] font-mono font-bold ${
                      dirComplete === dirActions.length ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {dirComplete}/{dirActions.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// =============================================================================
// Main Component: PlanningInitiation
// =============================================================================

export const PlanningInitiation: React.FC<PlanningInitiationProps> = ({
  onOpenExportModal,
}) => {
  const { scenario, planningInit: state, setPlanningInit: onStateChange } = usePlanning();
  const [activeTab, setActiveTab] = useState<TabId>('trigger');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 1 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Chapter IV</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Radio className="w-5 h-5 text-joint-400" />
              Planning Initiation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Receive directives, establish the planning organization, issue the initial WARNORD, allocate planning time, and initiate staff estimates for Operation {scenario.operationName}.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium font-mono border-b-2 transition -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-joint-400 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'trigger' && (
          <TriggerAndGuidanceTab state={state} onChange={onStateChange} scenario={scenario} />
        )}
        {activeTab === 'org' && (
          <PlanningOrgTab state={state} onChange={onStateChange} scenario={scenario} />
        )}
        {activeTab === 'warnord' && (
          <WarnordBuilderTab state={state} onChange={onStateChange} scenario={scenario} />
        )}
        {activeTab === 'time' && (
          <TimeAllocationTab state={state} onChange={onStateChange} scenario={scenario} />
        )}
        {activeTab === 'actions' && (
          <StaffActionsTab state={state} onChange={onStateChange} />
        )}
      </div>
    </div>
  );
};
