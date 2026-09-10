'use client';

import React, { useMemo, useState } from 'react';
import {
  COA_DEV_KEY_INPUTS,
  COA_DEV_KEY_OUTPUTS,
  COA_VALIDITY_CRITERIA,
  COA_DISTINGUISHABILITY_FACTORS,
  COA_STATEMENT_QUESTIONS,
  CONOPS_ELEMENTS,
  COA_STEP_BY_STEP_APPROACH,
  COA_DEV_TECHNIQUES,
  COA_SEQUENCING_OPTIONS,
  OPERATION_MILESTONES,
  COA_DEV_SUBTASKS,
  COA_DEV_BRIEF_SECTIONS,
  JOINT_FUNCTIONS,
  STAFF_DIRECTORATES,
} from '@jpe/shared';
import {
  Sparkles,
  Crosshair,
  Layers,
  GitBranch,
  ShieldCheck,
  Presentation,
  Plus,
  X,
  Check,
  Info,
  AlertTriangle,
  Network,
  ListChecks,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import {
  CoaDevelopmentState,
  CourseOfAction,
  CoaValidityKey,
  CoaEffort,
  ComponentTask,
  CoaDecisionPoint,
  TaskOrgEntry,
  CoaRisk,
  CoaStatement,
  CoaConops,
} from '@/types/planning';

// =============================================================================
// Factories
// =============================================================================

const COA_DESIGNATORS = ['COA 1', 'COA 2', 'COA 3', 'COA 4', 'COA 5'];

function emptyStatement(): CoaStatement {
  return {
    who: '',
    what: '',
    where: '',
    when: '',
    decisionPoints: '',
    how: '',
    why: '',
    assessment: '',
    intelConcept: '',
  };
}

function emptyConops(): CoaConops {
  return {
    operationalArea: '',
    objectives: '',
    essentialTasks: '',
    forcesCapabilities: '',
    integratedTimeline: '',
    taskOrganization: '',
    operationalConcept: '',
    sustainmentConcept: '',
    commSync: '',
    risk: '',
    requiredDecisions: '',
    deploymentConcept: '',
    mainSupportingEfforts: '',
  };
}

function emptyValidity(): Record<CoaValidityKey, { status: 'untested'; rationale: string }> {
  return {
    suitable: { status: 'untested', rationale: '' },
    feasible: { status: 'untested', rationale: '' },
    acceptable: { status: 'untested', rationale: '' },
    distinguishable: { status: 'untested', rationale: '' },
    complete: { status: 'untested', rationale: '' },
  };
}

export function createCoa(index: number, scenario: OperationalScenario): CourseOfAction {
  return {
    id: `coa-${Date.now()}-${index}`,
    designator: COA_DESIGNATORS[index] || `COA ${index + 1}`,
    name: '',
    narrative: '',
    sketchNotes: '',
    statement: { ...emptyStatement(), who: scenario.jtfName, where: scenario.aorRegion },
    conops: { ...emptyConops(), operationalArea: scenario.aorRegion },
    distinguishability: {
      mainEffort: '',
      scheme: '',
      sequencing: 'simultaneous',
      mechanism: '',
      taskOrg: '',
      reserves: '',
    },
    efforts: [],
    componentTasks: [],
    decisionPoints: [],
    taskOrg: [],
    risks: [],
    validity: emptyValidity(),
    jfcDisposition: 'pending',
    wargamePriority: index + 1,
  };
}

export function createDefaultCoaDevelopmentState(
  scenario: OperationalScenario
): CoaDevelopmentState {
  // JP 5-0: "Many staffs find they have time and resources to develop only two or
  // three distinct COAs per operational approach." Seed two.
  const coas = [createCoa(0, scenario), createCoa(1, scenario)];

  return {
    technique: 'sequential',
    operationalArea: scenario.aorRegion,
    milestones: { cDay: '', dDay: '', hHour: '', lHour: '', mDay: '', nDay: '' },
    cog: {
      enemyCog: '',
      enemyCriticalCapabilities: '',
      enemyCriticalRequirements: '',
      enemyCriticalVulnerabilities: '',
      friendlyCog: '',
      friendlyCriticalVulnerabilities: '',
      protectionPriorities: '',
      decisivePoints: '',
    },
    coas,
    supportability: STAFF_DIRECTORATES.flatMap(dir =>
      coas.map(coa => ({
        directorate: dir,
        coaId: coa.id,
        supportable: 'not_assessed' as const,
        shortfalls: '',
      }))
    ),
    briefSections: COA_DEV_BRIEF_SECTIONS.map(sec => ({
      id: sec.id,
      owner: sec.owner,
      section: sec.section,
      prepared: false,
      presenter: '',
    })),
    jfcGuidance: {
      approvedCoaIds: [],
      revisionDirection: '',
      wargamePriorityEnemyCoa: 'both',
      additionalGuidance: '',
      briefDtg: '',
    },
    subTaskCompletion: COA_DEV_SUBTASKS.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    notes: '',
  };
}

// =============================================================================
// Props
// =============================================================================

interface CoaDevelopmentProps {
  scenario: OperationalScenario;
  state: CoaDevelopmentState;
  onStateChange: (state: CoaDevelopmentState) => void;
  onOpenExportModal: () => void;
}

type TabId = 'inputs' | 'coas' | 'conops' | 'validity' | 'brief';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'inputs', label: 'Inputs & Technique', icon: Layers },
  { id: 'coas', label: 'COA Statements', icon: GitBranch },
  { id: 'conops', label: 'CONOPS & Task Org', icon: Network },
  { id: 'validity', label: 'Validity Test', icon: ShieldCheck },
  { id: 'brief', label: 'COA Dev Brief', icon: Presentation },
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

/** COA selector strip — shared across the COA-scoped tabs */
const CoaSelector: React.FC<{
  coas: CourseOfAction[];
  activeId: string;
  onSelect: (id: string) => void;
}> = ({ coas, activeId, onSelect }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {coas.map((coa) => {
      const failed = Object.values(coa.validity).some(v => v.status === 'fail');
      const isActive = coa.id === activeId;
      return (
        <button
          key={coa.id}
          onClick={() => onSelect(coa.id)}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition flex items-center gap-1.5 ${
            isActive
              ? 'bg-joint-950 border-joint-500 text-joint-100 font-bold shadow-sm'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-joint-800 hover:text-slate-200'
          }`}
        >
          {failed && <AlertTriangle className="w-3 h-3 text-red-400" />}
          <span>{coa.designator}</span>
          {coa.name && <span className="text-slate-500 font-normal">— {coa.name}</span>}
        </button>
      );
    })}
  </div>
);

// =============================================================================
// Tab 1: Inputs & Technique
// =============================================================================

const InputsTab: React.FC<{
  scenario: OperationalScenario;
  state: CoaDevelopmentState;
  onChange: (state: CoaDevelopmentState) => void;
}> = ({ scenario, state, onChange }) => {
  const [showBackwardPlanning, setShowBackwardPlanning] = useState(false);

  return (
    <div className="space-y-5">
      {/* Key Inputs / Key Outputs — Figure IV-9 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Key Inputs"
          subtitle="Products of mission analysis that drive COA development."
          doctrineRef="JP 5-0, Fig IV-9"
        >
          <div className="space-y-1.5">
            {COA_DEV_KEY_INPUTS.map((input) => (
              <div
                key={input.id}
                className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
              >
                <span className="text-slate-200">{input.label}</span>
                <span className="text-[9px] font-mono text-joint-400 whitespace-nowrap ml-2">
                  {input.source}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Key Outputs"
          subtitle="What Step 3 must deliver into COA Analysis & Wargaming (Step 4)."
          doctrineRef="JP 5-0, Fig IV-9"
        >
          <div className="space-y-1.5">
            {COA_DEV_KEY_OUTPUTS.map((output) => (
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

      {/* COA Development Technique — first decision of Step 3 */}
      <SectionCard
        title="COA Development Technique"
        subtitle="The first decision in COA development: simultaneous or sequential development of the COAs."
        doctrineRef="JP 5-0, IV-31"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COA_DEV_TECHNIQUES.map((tech) => {
            const selected = state.technique === tech.key;
            return (
              <button
                key={tech.key}
                onClick={() => onChange({ ...state, technique: tech.key })}
                className={`text-left p-3 rounded-lg border transition ${
                  selected
                    ? 'bg-joint-950/70 border-joint-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-joint-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${selected ? 'text-joint-200' : 'text-slate-200'}`}>
                    {tech.label}
                  </span>
                  {selected && <Check className="w-3.5 h-3.5 text-joint-300" />}
                </div>
                <p className="text-[10px] text-emerald-400/90 mt-2 leading-relaxed">
                  <span className="font-mono font-bold">ADV:</span> {tech.advantage}
                </p>
                <p className="text-[10px] text-amber-400/90 mt-1.5 leading-relaxed">
                  <span className="font-mono font-bold">DIS:</span> {tech.disadvantage}
                </p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowBackwardPlanning(!showBackwardPlanning)}
          className="mt-4 w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-joint-800 transition"
        >
          <span className="text-[11px] font-mono text-joint-300 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            Step-by-Step (Backward Planning) Approach — 7 steps
          </span>
          {showBackwardPlanning ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
        {showBackwardPlanning && (
          <div className="mt-2 space-y-2">
            {COA_STEP_BY_STEP_APPROACH.map((s) => (
              <div key={s.step} className="flex gap-3 p-2.5 rounded bg-slate-900/40 border border-slate-800/60">
                <span className="text-[10px] font-mono font-bold text-joint-400 shrink-0 w-4">{s.step}</span>
                <p className="text-[10px] text-slate-300 leading-relaxed">{s.action}</p>
              </div>
            ))}
            <p className="text-[9px] font-mono text-slate-600 text-right">JP 5-0, Figure IV-10</p>
          </div>
        )}
      </SectionCard>

      {/* Operational Area & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard
          title="Define the Operational Area"
          subtitle="Geographic boundaries that facilitate coordination, integration, and deconfliction across components."
          doctrineRef="JP 5-0, IV-36"
        >
          <Field
            label="Operational Area (OA) Definition"
            value={state.operationalArea}
            onChange={(v) => onChange({ ...state, operationalArea: v })}
            placeholder={`JOA boundaries within ${scenario.aorRegion}, access/basing/overflight considerations...`}
            rows={5}
          />
        </SectionCard>

        <SectionCard
          title="Operation Milestones"
          subtitle="Fix the reference days and hours that drive the integrated timeline."
          doctrineRef="JP 5-0, IV-33"
        >
          <div className="space-y-2">
            {OPERATION_MILESTONES.map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <div className="w-16 shrink-0">
                  <div className="text-[11px] font-mono font-bold text-joint-300">{m.label}</div>
                </div>
                <LineInput
                  value={state.milestones[m.key as keyof typeof state.milestones]}
                  onChange={(v) =>
                    onChange({ ...state, milestones: { ...state.milestones, [m.key]: v } })
                  }
                  placeholder={m.definition}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* COG Refinement */}
      <SectionCard
        title="Refined Center of Gravity Analysis"
        subtitle="Review and refine the COG analysis begun during mission analysis using updated intelligence, JIPOE products, and initial staff estimates. COAs focus on COGs and decisive points."
        doctrineRef="JP 5-0, IV-33"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3 p-3 rounded-lg bg-red-950/20 border border-red-900/40">
            <h5 className="text-[10px] font-mono font-bold text-red-400 uppercase">Enemy / Threat</h5>
            <Field
              label="Enemy COG"
              value={state.cog.enemyCog}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, enemyCog: v } })}
              placeholder="Source of power the adversary derives freedom of action from..."
            />
            <Field
              label="Critical Capabilities"
              value={state.cog.enemyCriticalCapabilities}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, enemyCriticalCapabilities: v } })}
            />
            <Field
              label="Critical Requirements"
              value={state.cog.enemyCriticalRequirements}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, enemyCriticalRequirements: v } })}
            />
            <Field
              label="Critical Vulnerabilities"
              value={state.cog.enemyCriticalVulnerabilities}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, enemyCriticalVulnerabilities: v } })}
              hint="— targets for decisive action"
            />
          </div>

          <div className="space-y-3 p-3 rounded-lg bg-sky-950/20 border border-sky-900/40">
            <h5 className="text-[10px] font-mono font-bold text-sky-400 uppercase">Friendly</h5>
            <Field
              label="Friendly COG"
              value={state.cog.friendlyCog}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, friendlyCog: v } })}
            />
            <Field
              label="Friendly Critical Vulnerabilities"
              value={state.cog.friendlyCriticalVulnerabilities}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, friendlyCriticalVulnerabilities: v } })}
            />
            <Field
              label="Protection Priorities"
              value={state.cog.protectionPriorities}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, protectionPriorities: v } })}
              hint="— resources will not cover every capability"
            />
            <Field
              label="Decisive Points"
              value={state.cog.decisivePoints}
              onChange={(v) => onChange({ ...state, cog: { ...state.cog, decisivePoints: v } })}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 2: COA Statements
// =============================================================================

const CoaStatementsTab: React.FC<{
  scenario: OperationalScenario;
  state: CoaDevelopmentState;
  onChange: (state: CoaDevelopmentState) => void;
  activeCoaId: string;
  setActiveCoaId: (id: string) => void;
}> = ({ scenario, state, onChange, activeCoaId, setActiveCoaId }) => {
  const coa = state.coas.find(c => c.id === activeCoaId);

  const updateCoa = (id: string, updates: Partial<CourseOfAction>) => {
    onChange({ ...state, coas: state.coas.map(c => (c.id === id ? { ...c, ...updates } : c)) });
  };

  const addCoa = () => {
    const next = createCoa(state.coas.length, scenario);
    onChange({
      ...state,
      coas: [...state.coas, next],
      supportability: [
        ...state.supportability,
        ...STAFF_DIRECTORATES.map(dir => ({
          directorate: dir,
          coaId: next.id,
          supportable: 'not_assessed' as const,
          shortfalls: '',
        })),
      ],
    });
    setActiveCoaId(next.id);
  };

  const removeCoa = (id: string) => {
    const remaining = state.coas.filter(c => c.id !== id);
    onChange({
      ...state,
      coas: remaining,
      supportability: state.supportability.filter(s => s.coaId !== id),
      jfcGuidance: {
        ...state.jfcGuidance,
        approvedCoaIds: state.jfcGuidance.approvedCoaIds.filter(cid => cid !== id),
      },
    });
    if (activeCoaId === id && remaining.length) setActiveCoaId(remaining[0].id);
  };

  if (!coa) {
    return (
      <div className="p-8 text-center">
        <GitBranch className="w-8 h-8 text-joint-500/60 mx-auto mb-2" />
        <p className="text-xs text-slate-400">No COAs developed. Add a COA to begin.</p>
        <button
          onClick={addCoa}
          className="mt-3 px-3 py-1.5 bg-joint-950 border border-joint-700 rounded-lg text-[11px] font-mono text-joint-200"
        >
          Add COA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <CoaSelector coas={state.coas} activeId={activeCoaId} onSelect={setActiveCoaId} />
        <div className="flex items-center gap-2">
          <button
            onClick={addCoa}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-[11px] font-mono text-joint-400 hover:border-joint-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" /> Add COA
          </button>
          {state.coas.length > 1 && (
            <button
              onClick={() => removeCoa(coa.id)}
              className="px-2 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-500 hover:text-red-400 hover:border-red-900 transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Essential tasks identified during mission analysis are <strong>common to all COAs</strong>. Vary COAs by
          adjusting the use of joint force capabilities across the physical domains, the information environment
          (including cyberspace), and the EMS — or by recommending alternate objectives.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-29</span>
        </p>
      </div>

      <SectionCard title={`${coa.designator} — Identification`} doctrineRef="JP 5-0, IV-37">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Designator</label>
            <LineInput
              value={coa.designator}
              onChange={(v) => updateCoa(coa.id, { designator: v })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
              COA Name / Short Title
            </label>
            <LineInput
              value={coa.name}
              onChange={(v) => updateCoa(coa.id, { name: v })}
              placeholder="e.g., MARITIME INTERDICTION FIRST"
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Field
            label="Concept Narrative"
            value={coa.narrative}
            onChange={(v) => updateCoa(coa.id, { narrative: v })}
            placeholder="Broad but clear terms: what is to be done throughout the operation, including consolidation, stabilization, and transition..."
            rows={5}
          />
          <Field
            label="COA Sketch Notes"
            value={coa.sketchNotes}
            onChange={(v) => updateCoa(coa.id, { sketchNotes: v })}
            placeholder="Graphic control measures, AOs, amphibious objective areas, force laydown..."
            rows={5}
            hint="— a sketch accompanies each COA where possible"
          />
        </div>
      </SectionCard>

      {/* The nine questions */}
      <SectionCard
        title="COA Statement — Nine Required Questions"
        subtitle="Each COA sketch and statement must answer all nine."
        doctrineRef="JP 5-0, IV-37"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COA_STATEMENT_QUESTIONS.map((q, idx) => (
            <div key={q.id}>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 flex items-start gap-1.5">
                <span className="text-joint-400 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                <span className="leading-tight">{q.question}</span>
              </label>
              <textarea
                value={coa.statement[q.key as keyof CoaStatement]}
                onChange={(e) =>
                  updateCoa(coa.id, {
                    statement: { ...coa.statement, [q.key]: e.target.value },
                  })
                }
                rows={2}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Distinguishability */}
      <SectionCard
        title="Distinguishability"
        subtitle="How this COA is sufficiently different from the others under consideration."
        doctrineRef="JP 5-0, IV-38"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field
            label="Focus / direction of main effort"
            value={coa.distinguishability.mainEffort}
            onChange={(v) =>
              updateCoa(coa.id, { distinguishability: { ...coa.distinguishability, mainEffort: v } })
            }
          />
          <Field
            label="Scheme of maneuver (domains, IE, EMS)"
            value={coa.distinguishability.scheme}
            onChange={(v) =>
              updateCoa(coa.id, { distinguishability: { ...coa.distinguishability, scheme: v } })
            }
          />
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
              Sequencing of actions
            </label>
            <select
              value={coa.distinguishability.sequencing}
              onChange={(e) =>
                updateCoa(coa.id, {
                  distinguishability: {
                    ...coa.distinguishability,
                    sequencing: e.target.value as 'simultaneous' | 'sequential' | 'combination',
                  },
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-joint-500"
            >
              {COA_SEQUENCING_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Field
            label="Primary mechanism for mission accomplishment"
            value={coa.distinguishability.mechanism}
            onChange={(v) =>
              updateCoa(coa.id, { distinguishability: { ...coa.distinguishability, mechanism: v } })
            }
          />
          <Field
            label="Task organization"
            value={coa.distinguishability.taskOrg}
            onChange={(v) =>
              updateCoa(coa.id, { distinguishability: { ...coa.distinguishability, taskOrg: v } })
            }
          />
          <Field
            label="Use of reserves"
            value={coa.distinguishability.reserves}
            onChange={(v) =>
              updateCoa(coa.id, { distinguishability: { ...coa.distinguishability, reserves: v } })
            }
          />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 3: CONOPS & Task Organization
// =============================================================================

const ConopsTab: React.FC<{
  state: CoaDevelopmentState;
  onChange: (state: CoaDevelopmentState) => void;
  activeCoaId: string;
  setActiveCoaId: (id: string) => void;
}> = ({ state, onChange, activeCoaId, setActiveCoaId }) => {
  const coa = state.coas.find(c => c.id === activeCoaId);

  const updateCoa = (updates: Partial<CourseOfAction>) => {
    if (!coa) return;
    onChange({ ...state, coas: state.coas.map(c => (c.id === coa.id ? { ...c, ...updates } : c)) });
  };

  if (!coa) {
    return <p className="text-xs text-slate-400 p-8 text-center">Add a COA first.</p>;
  }

  const addEffort = () => {
    const item: CoaEffort = {
      id: `eff-${Date.now()}`,
      phase: '',
      type: 'main',
      component: '',
      purpose: '',
      supportedBy: '',
    };
    updateCoa({ efforts: [...coa.efforts, item] });
  };

  const addComponentTask = () => {
    const item: ComponentTask = {
      id: `ctask-${Date.now()}`,
      component: '',
      jointFunction: JOINT_FUNCTIONS[0],
      task: '',
      location: '',
      purpose: '',
      lineOfEffort: '',
    };
    updateCoa({ componentTasks: [...coa.componentTasks, item] });
  };

  const addDecisionPoint = () => {
    const item: CoaDecisionPoint = {
      id: `dp-${Date.now()}`,
      name: '',
      description: '',
      linkedCcirId: '',
      latestDecisionDtg: '',
      decisionAuthority: 'JFC',
      triggerCriteria: '',
    };
    updateCoa({ decisionPoints: [...coa.decisionPoints, item] });
  };

  const addTaskOrg = () => {
    const item: TaskOrgEntry = {
      id: `torg-${Date.now()}`,
      component: '',
      forcesAssigned: '',
      commandRelationship: 'OPCON',
      phase: '',
    };
    updateCoa({ taskOrg: [...coa.taskOrg, item] });
  };

  const addRisk = () => {
    const item: CoaRisk = {
      id: `crisk-${Date.now()}`,
      type: 'mission',
      description: '',
      probability: 'medium',
      consequence: 'medium',
      mitigation: '',
    };
    updateCoa({ risks: [...coa.risks, item] });
  };

  return (
    <div className="space-y-5">
      <CoaSelector coas={state.coas} activeId={activeCoaId} onSelect={setActiveCoaId} />

      {/* 13 CONOPS elements */}
      <SectionCard
        title={`${coa.designator} — Initial CONOPS`}
        subtitle="Each COA typically has an associated initial CONOPS with a narrative and sketch covering these 13 elements."
        doctrineRef="JP 5-0, IV-30"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CONOPS_ELEMENTS.map((el, idx) => (
            <div key={el.id}>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 flex items-start gap-1.5">
                <span className="text-joint-400 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                <span className="leading-tight">{el.label}</span>
              </label>
              <textarea
                value={coa.conops[el.key as keyof CoaConops]}
                onChange={(e) =>
                  updateCoa({ conops: { ...coa.conops, [el.key]: e.target.value } })
                }
                rows={2}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-200/80 leading-relaxed">
            No COA is complete without a proper sustainment plan, and feasibility cannot be determined without a
            deployment concept describing how the force will respond to a contested environment.
            <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-34/IV-35</span>
          </p>
        </div>
      </SectionCard>

      {/* Main & supporting efforts by phase */}
      <SectionCard
        title="Main & Supporting Efforts by Phase"
        subtitle="Identify the purposes of these efforts and the key supported/supporting relationships within phases."
        doctrineRef="JP 5-0, IV-33"
      >
        <div className="space-y-2">
          {coa.efforts.map((eff) => (
            <div key={eff.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-2 items-center flex-wrap">
              <LineInput
                value={eff.phase}
                onChange={(v) => updateCoa({ efforts: coa.efforts.map(e => e.id === eff.id ? { ...e, phase: v } : e) })}
                placeholder="Phase"
                className="w-24"
              />
              <select
                value={eff.type}
                onChange={(e) => updateCoa({ efforts: coa.efforts.map(x => x.id === eff.id ? { ...x, type: e.target.value as 'main' | 'supporting' } : x) })}
                className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                  eff.type === 'main'
                    ? 'border-joint-700 text-joint-300'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <option value="main">MAIN EFFORT</option>
                <option value="supporting">SUPPORTING</option>
              </select>
              <LineInput
                value={eff.component}
                onChange={(v) => updateCoa({ efforts: coa.efforts.map(e => e.id === eff.id ? { ...e, component: v } : e) })}
                placeholder="Component (NAVFOR, AFFOR...)"
                className="w-44"
              />
              <LineInput
                value={eff.purpose}
                onChange={(v) => updateCoa({ efforts: coa.efforts.map(e => e.id === eff.id ? { ...e, purpose: v } : e) })}
                placeholder="Purpose of the effort"
                className="flex-1 min-w-[160px]"
              />
              <button
                onClick={() => updateCoa({ efforts: coa.efforts.filter(e => e.id !== eff.id) })}
                className="text-slate-500 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <AddRowButton onClick={addEffort} label="Add Effort" />
        </div>
      </SectionCard>

      {/* Component tasks framed by joint function */}
      <SectionCard
        title="Component Missions & Tasks"
        subtitle="Who, what, and where — think of component tasks in terms of the joint functions. A designated LOO/LOE helps identify these tasks."
        doctrineRef="JP 5-0, IV-33"
      >
        <div className="space-y-2">
          {coa.componentTasks.map((ct) => (
            <div key={ct.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <LineInput
                  value={ct.component}
                  onChange={(v) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, component: v } : x) })}
                  placeholder="Component"
                  className="w-36"
                />
                <select
                  value={ct.jointFunction}
                  onChange={(e) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, jointFunction: e.target.value } : x) })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-joint-300 font-mono focus:outline-none focus:border-joint-500"
                >
                  {JOINT_FUNCTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <LineInput
                  value={ct.lineOfEffort}
                  onChange={(v) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, lineOfEffort: v } : x) })}
                  placeholder="LOO / LOE"
                  className="w-32"
                />
                <button
                  onClick={() => updateCoa({ componentTasks: coa.componentTasks.filter(x => x.id !== ct.id) })}
                  className="text-slate-500 hover:text-red-400 ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <LineInput
                  value={ct.task}
                  onChange={(v) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, task: v } : x) })}
                  placeholder="Task (what)"
                  className="flex-1 min-w-[180px]"
                />
                <LineInput
                  value={ct.location}
                  onChange={(v) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, location: v } : x) })}
                  placeholder="Location (where)"
                  className="w-40"
                />
                <LineInput
                  value={ct.purpose}
                  onChange={(v) => updateCoa({ componentTasks: coa.componentTasks.map(x => x.id === ct.id ? { ...x, purpose: v } : x) })}
                  placeholder="Purpose (why)"
                  className="flex-1 min-w-[180px]"
                />
              </div>
            </div>
          ))}
          <AddRowButton onClick={addComponentTask} label="Add Component Task" />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task organization & command relationships */}
        <SectionCard
          title="Outline Task Organization"
          subtitle="Determine appropriate command relationships and the degree of authority delegated to each subordinate command."
          doctrineRef="JP 5-0, IV-34"
        >
          <div className="space-y-2">
            {coa.taskOrg.map((to) => (
              <div key={to.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-2 items-center flex-wrap">
                <LineInput
                  value={to.component}
                  onChange={(v) => updateCoa({ taskOrg: coa.taskOrg.map(x => x.id === to.id ? { ...x, component: v } : x) })}
                  placeholder="Command / component"
                  className="w-36"
                />
                <select
                  value={to.commandRelationship}
                  onChange={(e) => updateCoa({ taskOrg: coa.taskOrg.map(x => x.id === to.id ? { ...x, commandRelationship: e.target.value as TaskOrgEntry['commandRelationship'] } : x) })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                >
                  {['COCOM', 'OPCON', 'TACON', 'ADCON', 'Supported', 'Supporting', 'Direct Support'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <LineInput
                  value={to.forcesAssigned}
                  onChange={(v) => updateCoa({ taskOrg: coa.taskOrg.map(x => x.id === to.id ? { ...x, forcesAssigned: v } : x) })}
                  placeholder="Forces assigned"
                  className="flex-1 min-w-[140px]"
                />
                <LineInput
                  value={to.phase}
                  onChange={(v) => updateCoa({ taskOrg: coa.taskOrg.map(x => x.id === to.id ? { ...x, phase: v } : x) })}
                  placeholder="Phase"
                  className="w-20"
                />
                <button
                  onClick={() => updateCoa({ taskOrg: coa.taskOrg.filter(x => x.id !== to.id) })}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <AddRowButton onClick={addTaskOrg} label="Add Task Org Entry" />
          </div>
        </SectionCard>

        {/* Decision points */}
        <SectionCard
          title="Decision Points & Associated CCIRs"
          subtitle="The commander needs to know when to make a critical decision or when an objective is achieved — including decisions required from outside the command."
          doctrineRef="JP 5-0, IV-33"
        >
          <div className="space-y-2">
            {coa.decisionPoints.map((dp) => (
              <div key={dp.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <LineInput
                    value={dp.name}
                    onChange={(v) => updateCoa({ decisionPoints: coa.decisionPoints.map(x => x.id === dp.id ? { ...x, name: v } : x) })}
                    placeholder="DP name"
                    className="w-32"
                  />
                  <select
                    value={dp.decisionAuthority}
                    onChange={(e) => updateCoa({ decisionPoints: coa.decisionPoints.map(x => x.id === dp.id ? { ...x, decisionAuthority: e.target.value as CoaDecisionPoint['decisionAuthority'] } : x) })}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                  >
                    {['JFC', 'CCDR', 'SecDef', 'President', 'Other'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <LineInput
                    value={dp.latestDecisionDtg}
                    onChange={(v) => updateCoa({ decisionPoints: coa.decisionPoints.map(x => x.id === dp.id ? { ...x, latestDecisionDtg: v } : x) })}
                    placeholder="Latest DTG"
                    className="w-28"
                  />
                  <button
                    onClick={() => updateCoa({ decisionPoints: coa.decisionPoints.filter(x => x.id !== dp.id) })}
                    className="text-slate-500 hover:text-red-400 ml-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <LineInput
                  value={dp.triggerCriteria}
                  onChange={(v) => updateCoa({ decisionPoints: coa.decisionPoints.map(x => x.id === dp.id ? { ...x, triggerCriteria: v } : x) })}
                  placeholder="Trigger criteria / linked CCIR"
                  className="w-full"
                />
              </div>
            ))}
            <AddRowButton onClick={addDecisionPoint} label="Add Decision Point" />
          </div>
        </SectionCard>
      </div>

      {/* COA risk identification */}
      <SectionCard
        title={`${coa.designator} — Risk Identification`}
        subtitle="Risk assessment and risk identification are key outputs of Step 3."
        doctrineRef="JP 5-0, Fig IV-9"
      >
        <div className="space-y-2">
          {coa.risks.map((r) => (
            <div key={r.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-2 items-center flex-wrap">
              <select
                value={r.type}
                onChange={(e) => updateCoa({ risks: coa.risks.map(x => x.id === r.id ? { ...x, type: e.target.value as 'mission' | 'force' } : x) })}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-joint-500"
              >
                <option value="mission">RISK-TO-MISSION</option>
                <option value="force">RISK-TO-FORCE</option>
              </select>
              <LineInput
                value={r.description}
                onChange={(v) => updateCoa({ risks: coa.risks.map(x => x.id === r.id ? { ...x, description: v } : x) })}
                placeholder="Risk description"
                className="flex-1 min-w-[180px]"
              />
              {(['probability', 'consequence'] as const).map(dim => (
                <select
                  key={dim}
                  value={r[dim]}
                  onChange={(e) => updateCoa({ risks: coa.risks.map(x => x.id === r.id ? { ...x, [dim]: e.target.value as 'low' | 'medium' | 'high' } : x) })}
                  className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                    r[dim] === 'high'
                      ? 'border-red-800 text-red-400'
                      : r[dim] === 'medium'
                      ? 'border-amber-800 text-amber-400'
                      : 'border-emerald-800 text-emerald-400'
                  }`}
                >
                  <option value="low">{dim === 'probability' ? 'PROB' : 'CONS'}: LOW</option>
                  <option value="medium">{dim === 'probability' ? 'PROB' : 'CONS'}: MED</option>
                  <option value="high">{dim === 'probability' ? 'PROB' : 'CONS'}: HIGH</option>
                </select>
              ))}
              <LineInput
                value={r.mitigation}
                onChange={(v) => updateCoa({ risks: coa.risks.map(x => x.id === r.id ? { ...x, mitigation: v } : x) })}
                placeholder="Mitigation"
                className="flex-1 min-w-[160px]"
              />
              <button
                onClick={() => updateCoa({ risks: coa.risks.filter(x => x.id !== r.id) })}
                className="text-slate-500 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <AddRowButton onClick={addRisk} label="Add Risk" />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 4: Validity Test
// =============================================================================

const ValidityTab: React.FC<{
  state: CoaDevelopmentState;
  onChange: (state: CoaDevelopmentState) => void;
  activeCoaId: string;
  setActiveCoaId: (id: string) => void;
}> = ({ state, onChange, activeCoaId, setActiveCoaId }) => {
  const coa = state.coas.find(c => c.id === activeCoaId);
  const [expanded, setExpanded] = useState<string | null>('suitable');

  const setValidity = (key: CoaValidityKey, updates: Partial<{ status: 'untested' | 'pass' | 'fail'; rationale: string }>) => {
    if (!coa) return;
    onChange({
      ...state,
      coas: state.coas.map(c =>
        c.id === coa.id
          ? { ...c, validity: { ...c.validity, [key]: { ...c.validity[key], ...updates } } }
          : c
      ),
    });
  };

  if (!coa) return <p className="text-xs text-slate-400 p-8 text-center">Add a COA first.</p>;

  const failedCount = Object.values(coa.validity).filter(v => v.status === 'fail').length;
  const passedCount = Object.values(coa.validity).filter(v => v.status === 'pass').length;

  return (
    <div className="space-y-5">
      <CoaSelector coas={state.coas} activeId={activeCoaId} onSelect={setActiveCoaId} />

      <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
        failedCount > 0
          ? 'bg-red-950/30 border-red-800/60'
          : passedCount === 5
          ? 'bg-emerald-950/30 border-emerald-800/60'
          : 'bg-slate-900/40 border-slate-800/60'
      }`}>
        {failedCount > 0 ? (
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        ) : passedCount === 5 ? (
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-joint-400 mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-[11px] text-slate-200 font-semibold">
            {failedCount > 0
              ? `${coa.designator} fails ${failedCount} of 5 validity criteria — reject or revise before COA analysis.`
              : passedCount === 5
              ? `${coa.designator} is valid: suitable, feasible, acceptable, distinguishable, and complete.`
              : `${coa.designator}: ${passedCount} of 5 criteria tested and passed.`}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            All COAs selected for analysis are valid. The staff should reject COA alternatives that do not meet all
            five criteria. Feasibility and acceptability tests here are preliminary — they are confirmed during COA
            analysis (Step 4).
            <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-37</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {COA_VALIDITY_CRITERIA.map((crit) => {
          const check = coa.validity[crit.key as CoaValidityKey];
          const isOpen = expanded === crit.key;
          return (
            <div
              key={crit.key}
              className={`rounded-lg border transition ${
                check.status === 'fail'
                  ? 'border-red-800/60 bg-red-950/20'
                  : check.status === 'pass'
                  ? 'border-emerald-800/60 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="p-4 flex items-start justify-between gap-4">
                <button
                  onClick={() => setExpanded(isOpen ? null : crit.key)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className="text-sm font-bold text-white">{crit.label}</span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {crit.tests.length} tests
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 ml-5">{crit.definition}</p>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {(['pass', 'fail'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setValidity(crit.key as CoaValidityKey, { status: check.status === status ? 'untested' : status })}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition ${
                        check.status === status
                          ? status === 'pass'
                            ? 'bg-emerald-600 border-emerald-500 text-slate-950'
                            : 'bg-red-600 border-red-500 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 ml-5 space-y-2">
                  {crit.tests.map((test, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="text-joint-400 font-mono text-[9px] mt-0.5">
                        {String.fromCharCode(97 + idx)}.
                      </span>
                      <span className="leading-relaxed">{test}</span>
                    </div>
                  ))}
                  <textarea
                    value={check.rationale}
                    onChange={(e) => setValidity(crit.key as CoaValidityKey, { rationale: e.target.value })}
                    placeholder={`Rationale for the ${crit.label.toLowerCase()} determination...`}
                    rows={2}
                    className="w-full mt-2 bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed resize-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Distinguishability comparison matrix across all COAs */}
      <SectionCard
        title="Distinguishability Matrix"
        subtitle="Side-by-side comparison across the six factors. Identical entries mean the COAs are not sufficiently distinguishable."
        doctrineRef="JP 5-0, IV-38"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-3 font-mono text-[10px] text-slate-500 uppercase whitespace-nowrap">
                  Factor
                </th>
                {state.coas.map(c => (
                  <th key={c.id} className="text-left py-2 px-3 font-mono text-[10px] text-joint-300 whitespace-nowrap">
                    {c.designator}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COA_DISTINGUISHABILITY_FACTORS.map(factor => {
                const values = state.coas.map(c => {
                  const d = c.distinguishability;
                  switch (factor.key) {
                    case 'main_effort': return d.mainEffort;
                    case 'scheme': return d.scheme;
                    case 'sequencing': return d.sequencing;
                    case 'mechanism': return d.mechanism;
                    case 'task_org': return d.taskOrg;
                    case 'reserves': return d.reserves;
                    default: return '';
                  }
                });
                const nonEmpty = values.filter(v => v.trim());
                const allIdentical =
                  nonEmpty.length === values.length &&
                  values.length > 1 &&
                  new Set(values.map(v => v.trim().toLowerCase())).size === 1;

                return (
                  <tr key={factor.key} className="border-b border-slate-900">
                    <td className="py-2 pr-3 text-slate-400 align-top">
                      <div className="flex items-center gap-1.5">
                        {allIdentical && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span>{factor.label}</span>
                      </div>
                    </td>
                    {values.map((v, i) => (
                      <td
                        key={i}
                        className={`py-2 px-3 align-top ${allIdentical ? 'text-amber-400/80' : 'text-slate-200'}`}
                      >
                        {v.trim() || <span className="text-slate-700">—</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 5: COA Development Brief & JFC Guidance
// =============================================================================

const BriefTab: React.FC<{
  state: CoaDevelopmentState;
  onChange: (state: CoaDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const preparedCount = state.briefSections.filter(s => s.prepared).length;

  const toggleApproved = (coaId: string) => {
    const current = state.jfcGuidance.approvedCoaIds;
    const next = current.includes(coaId)
      ? current.filter(id => id !== coaId)
      : [...current, coaId];
    onChange({ ...state, jfcGuidance: { ...state.jfcGuidance, approvedCoaIds: next } });
  };

  return (
    <div className="space-y-5">
      {/* Sub-task tracker */}
      <SectionCard
        title="COA Development Techniques & Procedures"
        subtitle={`${Object.values(state.subTaskCompletion).filter(Boolean).length} of ${COA_DEV_SUBTASKS.length} staff sub-tasks complete.`}
        doctrineRef="JP 5-0, IV-31 to IV-39"
      >
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {COA_DEV_SUBTASKS.map(task => (
            <label
              key={task.id}
              className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.subTaskCompletion[task.id]}
                onChange={(e) =>
                  onChange({
                    ...state,
                    subTaskCompletion: { ...state.subTaskCompletion, [task.id]: e.target.checked },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono text-slate-600">{task.ref}</span>
                  <span className={`text-[11px] font-medium ${state.subTaskCompletion[task.id] ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.label}
                  </span>
                  <span className="text-[9px] font-mono text-joint-400 bg-joint-950/60 px-1.5 py-0.5 rounded border border-joint-900">
                    {task.responsible}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{task.description}</p>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Brief sections */}
      <SectionCard
        title="COA Development Briefing"
        subtitle={`${preparedCount} of ${state.briefSections.length} sections prepared.`}
        doctrineRef="JP 5-0, Fig IV-11"
      >
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {state.briefSections.map((sec, idx) => (
            <div
              key={sec.id}
              className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800"
            >
              <input
                type="checkbox"
                checked={sec.prepared}
                onChange={(e) =>
                  onChange({
                    ...state,
                    briefSections: state.briefSections.map((s, i) =>
                      i === idx ? { ...s, prepared: e.target.checked } : s
                    ),
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-[11px] leading-tight ${sec.prepared ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {sec.section}
                </span>
              </div>
              <span className="text-[9px] font-mono text-joint-400 whitespace-nowrap shrink-0">
                {sec.owner}
              </span>
              <LineInput
                value={sec.presenter}
                onChange={(v) =>
                  onChange({
                    ...state,
                    briefSections: state.briefSections.map((s, i) =>
                      i === idx ? { ...s, presenter: v } : s
                    ),
                  })
                }
                placeholder="Presenter"
                className="w-28 shrink-0"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Staff supportability estimates per COA */}
      <SectionCard
        title="Staff Estimates of Supportability by COA"
        subtitle="The staff continues to conduct staff estimates of supportability for each COA."
        doctrineRef="JP 5-0, IV-39"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-3 font-mono text-[10px] text-slate-500 uppercase">Directorate</th>
                {state.coas.map(c => (
                  <th key={c.id} className="text-left py-2 px-3 font-mono text-[10px] text-joint-300 whitespace-nowrap">
                    {c.designator}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAFF_DIRECTORATES.map(dir => (
                <tr key={dir} className="border-b border-slate-900">
                  <td className="py-1.5 pr-3 text-slate-300 font-mono text-[10px]">{dir}</td>
                  {state.coas.map(c => {
                    const entry = state.supportability.find(s => s.directorate === dir && s.coaId === c.id);
                    const value = entry?.supportable || 'not_assessed';
                    return (
                      <td key={c.id} className="py-1.5 px-3">
                        <select
                          value={value}
                          onChange={(e) =>
                            onChange({
                              ...state,
                              supportability: state.supportability.some(s => s.directorate === dir && s.coaId === c.id)
                                ? state.supportability.map(s =>
                                    s.directorate === dir && s.coaId === c.id
                                      ? { ...s, supportable: e.target.value as typeof s.supportable }
                                      : s
                                  )
                                : [
                                    ...state.supportability,
                                    {
                                      directorate: dir,
                                      coaId: c.id,
                                      supportable: e.target.value as 'yes' | 'no' | 'with_mitigation' | 'not_assessed',
                                      shortfalls: '',
                                    },
                                  ],
                            })
                          }
                          className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                            value === 'yes'
                              ? 'border-emerald-800 text-emerald-400'
                              : value === 'no'
                              ? 'border-red-800 text-red-400'
                              : value === 'with_mitigation'
                              ? 'border-amber-800 text-amber-400'
                              : 'border-slate-700 text-slate-500'
                          }`}
                        >
                          <option value="not_assessed">NOT ASSESSED</option>
                          <option value="yes">SUPPORTABLE</option>
                          <option value="with_mitigation">W/ MITIGATION</option>
                          <option value="no">NOT SUPPORTABLE</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* JFC guidance */}
      <SectionCard
        title="JFC Guidance on COAs"
        subtitle="The commander approves COAs for further analysis, directs revisions or combinations, and sets the enemy COA priority for wargaming."
        doctrineRef="JP 5-0, IV-39"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-2">
              COAs approved for further analysis (Step 4)
            </label>
            <div className="flex flex-wrap gap-2">
              {state.coas.map(c => {
                const approved = state.jfcGuidance.approvedCoaIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleApproved(c.id)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition flex items-center gap-1.5 ${
                      approved
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {approved && <Check className="w-3 h-3" />}
                    {c.designator}
                    {c.name && <span className="text-slate-500">— {c.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-2">
              Enemy COA priority for wargaming
            </label>
            <div className="flex gap-2">
              {([
                { key: 'mlcoa', label: 'Most Likely (MLCOA)' },
                { key: 'mdcoa', label: 'Most Dangerous (MDCOA)' },
                { key: 'both', label: 'Both' },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  onClick={() =>
                    onChange({
                      ...state,
                      jfcGuidance: { ...state.jfcGuidance, wargamePriorityEnemyCoa: opt.key },
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition ${
                    state.jfcGuidance.wargamePriorityEnemyCoa === opt.key
                      ? 'bg-joint-950 border-joint-500 text-joint-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field
              label="Directed revisions / combinations / additional COAs"
              value={state.jfcGuidance.revisionDirection}
              onChange={(v) =>
                onChange({ ...state, jfcGuidance: { ...state.jfcGuidance, revisionDirection: v } })
              }
              rows={4}
            />
            <Field
              label="Additional commander's guidance"
              value={state.jfcGuidance.additionalGuidance}
              onChange={(v) =>
                onChange({ ...state, jfcGuidance: { ...state.jfcGuidance, additionalGuidance: v } })
              }
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] font-mono text-slate-400">COA Dev Brief DTG</label>
            <LineInput
              value={state.jfcGuidance.briefDtg}
              onChange={(v) => onChange({ ...state, jfcGuidance: { ...state.jfcGuidance, briefDtg: v } })}
              placeholder="DDHHMMZ MON YY"
              className="w-44"
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

export const CoaDevelopment: React.FC<CoaDevelopmentProps> = ({
  scenario,
  state,
  onStateChange,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('inputs');
  const [generating, setGenerating] = useState(false);
  const [activeCoaId, setActiveCoaId] = useState<string>(state.coas[0]?.id || '');

  // Keep the COA selection valid if COAs are added or removed.
  const resolvedCoaId = useMemo(() => {
    if (state.coas.some(c => c.id === activeCoaId)) return activeCoaId;
    return state.coas[0]?.id || '';
  }, [state.coas, activeCoaId]);

  const validCount = state.coas.filter(c =>
    Object.values(c.validity).every(v => v.status === 'pass')
  ).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 3 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Chapter IV, para 4.d</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-joint-400" />
              Course of Action Development
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Develop distinct, valid COAs for Operation {scenario.operationName} — each suitable, feasible,
              acceptable, distinguishable, and complete — with a concept narrative, sketch, and initial CONOPS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 900); }}
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

        {/* COA status strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">{state.coas.length}</div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">COAs Developed</div>
          </div>
          <div className="p-2.5 bg-emerald-950/30 rounded border border-emerald-900/60 text-center">
            <div className="text-lg font-mono font-bold text-emerald-400">{validCount}</div>
            <div className="text-[9px] text-emerald-500 uppercase font-mono">Validity Confirmed</div>
          </div>
          <div className="p-2.5 bg-joint-950/50 rounded border border-joint-800 text-center">
            <div className="text-lg font-mono font-bold text-joint-300">
              {state.jfcGuidance.approvedCoaIds.length}
            </div>
            <div className="text-[9px] text-joint-400 uppercase font-mono">JFC Approved</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {Object.values(state.subTaskCompletion).filter(Boolean).length}
              <span className="text-slate-600 text-xs">/{COA_DEV_SUBTASKS.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Sub-Tasks Complete</div>
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
        {activeTab === 'inputs' && (
          <InputsTab scenario={scenario} state={state} onChange={onStateChange} />
        )}
        {activeTab === 'coas' && (
          <CoaStatementsTab
            scenario={scenario}
            state={state}
            onChange={onStateChange}
            activeCoaId={resolvedCoaId}
            setActiveCoaId={setActiveCoaId}
          />
        )}
        {activeTab === 'conops' && (
          <ConopsTab
            state={state}
            onChange={onStateChange}
            activeCoaId={resolvedCoaId}
            setActiveCoaId={setActiveCoaId}
          />
        )}
        {activeTab === 'validity' && (
          <ValidityTab
            state={state}
            onChange={onStateChange}
            activeCoaId={resolvedCoaId}
            setActiveCoaId={setActiveCoaId}
          />
        )}
        {activeTab === 'brief' && <BriefTab state={state} onChange={onStateChange} />}
      </div>
    </div>
  );
};
