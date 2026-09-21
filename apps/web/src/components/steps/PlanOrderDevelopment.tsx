'use client';

import React, { useMemo, useState } from 'react';
import {
  CONOPS_REQUIREMENTS,
  PLAN_DEVELOPMENT_ACTIVITIES,
  PLAN_REVIEW_CRITERIA,
  IPR_CONFIRMATION_ITEMS,
  IPR_OUTCOMES,
  ORDER_PRODUCT_TYPES,
  TPFDD_FORCE_CATEGORIES,
  STAFF_DIRECTORATES,
} from '@jpe/shared';
import {
  FileText,
  Presentation,
  Plus,
  X,
  Check,
  Info,
  AlertTriangle,
  ShieldAlert,
  Wand2,
  Network,
  Truck,
  ClipboardList,
  Stamp,
} from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';
import { usePlanning } from '@/context/PlanningContext';
import {
  PlanOrderDevelopmentState,
  RefinedConops,
  PlanDevelopmentActivity,
  TpfddEntry,
  PlanShortfall,
  SupportingPlan,
  ActivityStatus,
  OrderProductType,
} from '@/types/planning';

// =============================================================================
// Default State Factory
// =============================================================================

export function createDefaultPlanOrderDevelopmentState(
  scenario: OperationalScenario
): PlanOrderDevelopmentState {
  return {
    conops: {
      commandersIntent: '',
      centralApproach: '',
      schemeOfManeuver: '',
      conditions: '',
      cogFocus: '',
      tempo: '',
      campaignVisualization: '',
      objectiveLinkage: '',
      isCampaign: false,
    },
    activities: PLAN_DEVELOPMENT_ACTIVITIES.map(a => ({
      id: a.id,
      status: 'not_started' as ActivityStatus,
      lead: '',
      notes: '',
    })),
    tpfdd: [],
    shortfalls: [],
    supportingPlans: [],
    ipr: {
      outcome: 'not_held',
      heldDtg: '',
      confirmationItems: IPR_CONFIRMATION_ITEMS.reduce((acc, i) => {
        acc[i.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      frictionPoints: '',
      guidanceForRefinement: '',
    },
    order: {
      type: 'OPORD',
      number: '',
      title: `Operation ${scenario.operationName}`,
      effectiveDtg: '',
      reviewCriteria: PLAN_REVIEW_CRITERIA.reduce((acc, c) => {
        acc[c.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      documentationNotes: '',
    },
    notes: '',
  };
}

// =============================================================================
// Props
// =============================================================================

interface PlanOrderDevelopmentProps {
  onOpenExportModal: () => void;
}

type TabId = 'conops' | 'activities' | 'tpfdd' | 'shortfalls' | 'review';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'conops', label: 'CONOPS', icon: Network },
  { id: 'activities', label: 'Plan Development', icon: ClipboardList },
  { id: 'tpfdd', label: 'Force Flow', icon: Truck },
  { id: 'shortfalls', label: 'Shortfalls & Support', icon: AlertTriangle },
  { id: 'review', label: 'Review & Order', icon: Stamp },
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
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">{label}</label>
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

const StatusSelect: React.FC<{
  value: ActivityStatus;
  onChange: (v: ActivityStatus) => void;
}> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as ActivityStatus)}
    className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
      value === 'complete'
        ? 'border-emerald-800 text-emerald-400'
        : value === 'in_progress'
        ? 'border-amber-800 text-amber-400'
        : 'border-slate-700 text-slate-500'
    }`}
  >
    <option value="not_started">NOT STARTED</option>
    <option value="in_progress">IN PROGRESS</option>
    <option value="complete">COMPLETE</option>
  </select>
);

// =============================================================================
// Tab 1: CONOPS
// =============================================================================

const ConopsTab: React.FC<{
  state: PlanOrderDevelopmentState;
  onChange: (s: PlanOrderDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const { coaApproval, coaDevelopment, missionAnalysis } = usePlanning();

  const approvedCoas = useMemo(
    () => coaDevelopment.coas.filter(c => coaApproval.decision.selectedCoaIds.includes(c.id)),
    [coaDevelopment.coas, coaApproval.decision.selectedCoaIds]
  );

  const setConops = (updates: Partial<RefinedConops>) =>
    onChange({ ...state, conops: { ...state.conops, ...updates } });

  /** Seeds the CONOPS from the approved COA and the Step 6 estimate. */
  const seedFromApproved = () => {
    const coa = approvedCoas[0];
    if (!coa) return;
    setConops({
      commandersIntent:
        state.conops.commandersIntent ||
        coaApproval.estimate.refinedIntent ||
        missionAnalysis.commanderIntent,
      centralApproach: state.conops.centralApproach || coa.conops.operationalConcept || coa.narrative,
      schemeOfManeuver: state.conops.schemeOfManeuver || coa.distinguishability.scheme,
      conditions: state.conops.conditions || coa.statement.when,
      cogFocus:
        state.conops.cogFocus ||
        [coaDevelopment.cog.enemyCriticalVulnerabilities, coaDevelopment.cog.friendlyCriticalVulnerabilities]
          .filter(Boolean)
          .join(' | '),
      objectiveLinkage: state.conops.objectiveLinkage || coa.conops.objectives,
    });
  };

  const filled = CONOPS_REQUIREMENTS.filter(
    r => (state.conops[r.key as keyof RefinedConops] as string || '').trim()
  ).length;

  return (
    <div className="space-y-5">
      {approvedCoas.length === 0 ? (
        <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-900/50 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-amber-200 font-semibold">No approved COA</p>
            <p className="text-[10px] text-amber-200/75 mt-1 leading-relaxed">
              Plan development expands the <strong>approved</strong> COA by refining its initial
              CONOPS. Record the commander&apos;s decision in Step 6 first.
              <span className="font-mono text-amber-500/70 ml-1">JP 5-0, IV-58</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-emerald-200/85 leading-relaxed">
            Expanding{' '}
            <strong>
              {approvedCoas.map(c => c.designator + (c.name ? ` — ${c.name}` : '')).join(', ')}
            </strong>
            , approved in Step 6. The CONOPS is the centerpiece of the plan or OPORD.
          </p>
        </div>
      )}

      <SectionCard
        title="Refined CONOPS"
        subtitle={`${filled} of ${CONOPS_REQUIREMENTS.length} doctrinal requirements addressed. Written in sufficient detail that subordinate and supporting commanders understand their mission and tasks and can develop supporting plans.`}
        doctrineRef="JP 5-0, IV-58 / IV-59"
      >
        {approvedCoas.length > 0 && filled === 0 && (
          <button
            onClick={seedFromApproved}
            className="mb-4 w-full py-2.5 rounded-lg border border-dashed border-joint-700 bg-joint-950/30 text-[11px] font-mono text-joint-200 hover:bg-joint-950/60 transition flex items-center justify-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Seed from the approved COA and commander&apos;s estimate
          </button>
        )}

        <div className="space-y-4">
          {CONOPS_REQUIREMENTS.map((r, idx) => (
            <div key={r.id}>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 flex items-start gap-1.5">
                <span className="text-joint-400 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                <span className="leading-tight">{r.label}</span>
              </label>
              <textarea
                value={(state.conops[r.key as keyof RefinedConops] as string) || ''}
                onChange={(e) => setConops({ [r.key]: e.target.value } as Partial<RefinedConops>)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-joint-500 leading-relaxed transition resize-none"
              />
            </div>
          ))}
        </div>

        <label className="mt-4 flex items-start gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-joint-900 transition">
          <input
            type="checkbox"
            checked={state.conops.isCampaign}
            onChange={(e) => setConops({ isCampaign: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
          />
          <span className="text-[11px] text-slate-200 leading-relaxed">
            Outline the CONOPS as a <strong>campaign</strong> — the scope, complexity, and duration
            warrant execution via a series of related operations
            <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-59</span>
          </span>
        </label>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 2: Plan Development Activities
// =============================================================================

const ActivitiesTab: React.FC<{
  state: PlanOrderDevelopmentState;
  onChange: (s: PlanOrderDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const update = (id: string, updates: Partial<PlanDevelopmentActivity>) =>
    onChange({
      ...state,
      activities: state.activities.map(a => (a.id === id ? { ...a, ...updates } : a)),
    });

  const complete = state.activities.filter(a => a.status === 'complete').length;

  return (
    <div className="space-y-5">
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          These activities typically occur in a <strong>concurrent, collaborative, and iterative
          fashion rather than sequentially</strong>, depending largely on the planning time
          available. As in COA development, planners discover and eliminate shortfalls and conflicts
          within their command and with other CCMDs.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-60</span>
        </p>
      </div>

      <SectionCard
        title="Plan Development Activities"
        subtitle={`${complete} of ${state.activities.length} complete.`}
        doctrineRef="JP 5-0, Fig IV-17"
      >
        <div className="space-y-2">
          {PLAN_DEVELOPMENT_ACTIVITIES.map(def => {
            const a = state.activities.find(x => x.id === def.id);
            if (!a) return null;
            return (
              <div
                key={def.id}
                className={`p-3 rounded-lg border ${
                  a.status === 'complete'
                    ? 'border-emerald-900/50 bg-emerald-950/10'
                    : 'border-slate-700/60 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-semibold ${
                      a.status === 'complete' ? 'text-slate-400' : 'text-white'
                    }`}
                  >
                    {def.label}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={a.lead}
                      onChange={(e) => update(def.id, { lead: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                    >
                      <option value="">— lead —</option>
                      {STAFF_DIRECTORATES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <StatusSelect value={a.status} onChange={(v) => update(def.id, { status: v })} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {def.description}
                </p>
                <LineInput
                  value={a.notes}
                  onChange={(v) => update(def.id, { notes: v })}
                  placeholder="Notes"
                  className="w-full mt-2"
                />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 3: Force Flow (TPFDD)
// =============================================================================

const TpfddTab: React.FC<{
  state: PlanOrderDevelopmentState;
  onChange: (s: PlanOrderDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const add = () => {
    const item: TpfddEntry = {
      id: `tp-${Date.now()}`,
      unit: '',
      category: TPFDD_FORCE_CATEGORIES[0],
      origin: '',
      destination: '',
      requiredDeliveryDate: '',
      notes: '',
    };
    onChange({ ...state, tpfdd: [...state.tpfdd, item] });
  };

  const update = (id: string, updates: Partial<TpfddEntry>) =>
    onChange({ ...state, tpfdd: state.tpfdd.map(t => (t.id === id ? { ...t, ...updates } : t)) });

  return (
    <div className="space-y-5">
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-joint-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          The TPFDD is the link between the CONOPS and force planning. Sequencing forces into the
          operational area this way preserves unit integrity, force mobility, and force visibility,
          and the ability to transition rapidly to branches or sequels. Supported CCDRs capture the
          sequencing as the commander&apos;s <strong>required delivery dates</strong>.
          <span className="font-mono text-slate-600 ml-1">JP 5-0, IV-59</span>
        </p>
      </div>

      <SectionCard
        title="Time-Phased Force and Deployment Data"
        subtitle={`${state.tpfdd.length} force entries.`}
        doctrineRef="JP 5-0, IV-59"
      >
        <div className="space-y-2">
          {state.tpfdd.map(t => (
            <div key={t.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <LineInput
                  value={t.unit}
                  onChange={(v) => update(t.id, { unit: v })}
                  placeholder="Unit / force element"
                  className="flex-1 min-w-[160px]"
                />
                <select
                  value={t.category}
                  onChange={(e) => update(t.id, { category: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-joint-300 focus:outline-none focus:border-joint-500"
                >
                  {TPFDD_FORCE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={() => onChange({ ...state, tpfdd: state.tpfdd.filter(x => x.id !== t.id) })}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <LineInput
                  value={t.origin}
                  onChange={(v) => update(t.id, { origin: v })}
                  placeholder="Origin"
                  className="flex-1 min-w-[120px]"
                />
                <LineInput
                  value={t.destination}
                  onChange={(v) => update(t.id, { destination: v })}
                  placeholder="Destination (POD)"
                  className="flex-1 min-w-[120px]"
                />
                <LineInput
                  value={t.requiredDeliveryDate}
                  onChange={(v) => update(t.id, { requiredDeliveryDate: v })}
                  placeholder="Required delivery date"
                  className="w-44"
                />
              </div>
            </div>
          ))}
          <AddRowButton onClick={add} label="Add Force Entry" />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 4: Shortfalls & Supporting Plans
// =============================================================================

const ShortfallsTab: React.FC<{
  state: PlanOrderDevelopmentState;
  onChange: (s: PlanOrderDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const addShortfall = () => {
    const item: PlanShortfall = {
      id: `sf-${Date.now()}`,
      description: '',
      activityId: PLAN_DEVELOPMENT_ACTIVITIES[0].id,
      severity: 'medium',
      resolution: '',
      resolved: false,
    };
    onChange({ ...state, shortfalls: [...state.shortfalls, item] });
  };

  const addPlan = () => {
    const item: SupportingPlan = {
      id: `sp-${Date.now()}`,
      command: '',
      planName: '',
      status: 'not_started',
      dueDtg: '',
    };
    onChange({ ...state, supportingPlans: [...state.supportingPlans, item] });
  };

  const open = state.shortfalls.filter(s => !s.resolved).length;

  return (
    <div className="space-y-5">
      <SectionCard
        title="Shortfall Register"
        subtitle={`${open} open. Planners discover and eliminate shortfalls and conflicts within their command and with other CCMDs.`}
        doctrineRef="JP 5-0, IV-60"
      >
        <div className="space-y-2">
          {state.shortfalls.map(s => (
            <div
              key={s.id}
              className={`p-2.5 rounded-lg border space-y-2 ${
                s.resolved
                  ? 'border-emerald-900/50 bg-emerald-950/10'
                  : 'border-slate-700/60 bg-slate-900/60'
              }`}
            >
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="checkbox"
                  checked={s.resolved}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id ? { ...x, resolved: e.target.checked } : x
                      ),
                    })
                  }
                  className="rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
                  title="Resolved"
                />
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
                  placeholder="Shortfall or conflict"
                  className="flex-1 min-w-[170px]"
                />
                <select
                  value={s.activityId}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id ? { ...x, activityId: e.target.value } : x
                      ),
                    })
                  }
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-joint-500"
                >
                  {PLAN_DEVELOPMENT_ACTIVITIES.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
                <select
                  value={s.severity}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      shortfalls: state.shortfalls.map(x =>
                        x.id === s.id
                          ? { ...x, severity: e.target.value as 'low' | 'medium' | 'high' }
                          : x
                      ),
                    })
                  }
                  className={`bg-slate-950 border rounded px-2 py-1 text-[10px] font-mono focus:outline-none ${
                    s.severity === 'high'
                      ? 'border-red-800 text-red-400'
                      : s.severity === 'medium'
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
              <LineInput
                value={s.resolution}
                onChange={(v) =>
                  onChange({
                    ...state,
                    shortfalls: state.shortfalls.map(x =>
                      x.id === s.id ? { ...x, resolution: v } : x
                    ),
                  })
                }
                placeholder="Resolution / sourcing action"
                className="w-full"
              />
            </div>
          ))}
          <AddRowButton onClick={addShortfall} label="Add Shortfall" />
        </div>
      </SectionCard>

      <SectionCard
        title="Supporting Plans"
        subtitle="Subordinate and supporting commands develop plans supporting the approved CONOPS."
        doctrineRef="JP 5-0, Fig IV-17"
      >
        <div className="space-y-2">
          {state.supportingPlans.map(p => (
            <div key={p.id} className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg flex gap-2 items-center flex-wrap">
              <LineInput
                value={p.command}
                onChange={(v) =>
                  onChange({
                    ...state,
                    supportingPlans: state.supportingPlans.map(x =>
                      x.id === p.id ? { ...x, command: v } : x
                    ),
                  })
                }
                placeholder="Command"
                className="w-40"
              />
              <LineInput
                value={p.planName}
                onChange={(v) =>
                  onChange({
                    ...state,
                    supportingPlans: state.supportingPlans.map(x =>
                      x.id === p.id ? { ...x, planName: v } : x
                    ),
                  })
                }
                placeholder="Supporting plan"
                className="flex-1 min-w-[150px]"
              />
              <LineInput
                value={p.dueDtg}
                onChange={(v) =>
                  onChange({
                    ...state,
                    supportingPlans: state.supportingPlans.map(x =>
                      x.id === p.id ? { ...x, dueDtg: v } : x
                    ),
                  })
                }
                placeholder="Due DTG"
                className="w-32"
              />
              <StatusSelect
                value={p.status}
                onChange={(v) =>
                  onChange({
                    ...state,
                    supportingPlans: state.supportingPlans.map(x =>
                      x.id === p.id ? { ...x, status: v } : x
                    ),
                  })
                }
              />
              <button
                onClick={() =>
                  onChange({
                    ...state,
                    supportingPlans: state.supportingPlans.filter(x => x.id !== p.id),
                  })
                }
                className="text-slate-500 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <AddRowButton onClick={addPlan} label="Add Supporting Plan" />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Tab 5: Review & Order
// =============================================================================

const ReviewTab: React.FC<{
  state: PlanOrderDevelopmentState;
  onChange: (s: PlanOrderDevelopmentState) => void;
}> = ({ state, onChange }) => {
  const setIpr = (updates: Partial<PlanOrderDevelopmentState['ipr']>) =>
    onChange({ ...state, ipr: { ...state.ipr, ...updates } });
  const setOrder = (updates: Partial<PlanOrderDevelopmentState['order']>) =>
    onChange({ ...state, order: { ...state.order, ...updates } });

  const productDef = ORDER_PRODUCT_TYPES.find(p => p.key === state.order.type);

  return (
    <div className="space-y-5">
      <SectionCard
        title="In-Progress Review"
        subtitle="Conducted with SecDef or a designated representative to confirm the basis of the plan."
        doctrineRef="JP 5-0, IV-59 to IV-60"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {IPR_OUTCOMES.map(o => (
            <button
              key={o.key}
              onClick={() => setIpr({ outcome: o.key as PlanOrderDevelopmentState['ipr']['outcome'] })}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition ${
                state.ipr.outcome === o.key
                  ? o.key === 'endorsed'
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : o.key === 'friction'
                    ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                    : 'bg-slate-800 border-slate-600 text-slate-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {IPR_CONFIRMATION_ITEMS.map(i => (
            <label
              key={i.id}
              className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.ipr.confirmationItems[i.id]}
                onChange={(e) =>
                  setIpr({
                    confirmationItems: {
                      ...state.ipr.confirmationItems,
                      [i.id]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[10px] leading-relaxed ${
                  state.ipr.confirmationItems[i.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {i.label}
              </span>
            </label>
          ))}
        </div>

        {state.ipr.outcome === 'friction' && (
          <div className="mt-3 space-y-3">
            <Field
              label="Friction points acknowledged"
              value={state.ipr.frictionPoints}
              onChange={(v) => setIpr({ frictionPoints: v })}
            />
            <Field
              label="Guidance to shape continued planning"
              value={state.ipr.guidanceForRefinement}
              onChange={(v) => setIpr({ guidanceForRefinement: v })}
            />
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <label className="text-[11px] font-mono text-slate-400">IPR held</label>
          <LineInput
            value={state.ipr.heldDtg}
            onChange={(v) => setIpr({ heldDtg: v })}
            placeholder="DDHHMMZ MON YY"
            className="w-40"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Order Document"
        subtitle="Planning results in a plan documented in the format of an order."
        doctrineRef="JP 5-0, IV-58 / CJCSM 3130.03"
      >
        <div className="flex flex-wrap gap-2">
          {ORDER_PRODUCT_TYPES.map(p => (
            <button
              key={p.key}
              onClick={() => setOrder({ type: p.key as OrderProductType })}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition ${
                state.order.type === p.key
                  ? 'bg-joint-950 border-joint-500 text-joint-200 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-joint-800'
              }`}
            >
              {p.key}
            </button>
          ))}
        </div>
        {productDef && (
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{productDef.description}</p>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Number</label>
            <LineInput
              value={state.order.number}
              onChange={(v) => setOrder({ number: v })}
              placeholder="e.g., 26-04"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Title</label>
            <LineInput
              value={state.order.title}
              onChange={(v) => setOrder({ title: v })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Effective DTG</label>
            <LineInput
              value={state.order.effectiveDtg}
              onChange={(v) => setOrder({ effectiveDtg: v })}
              placeholder="DDHHMMZ MON YY"
              className="w-full"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Plan Review Criteria"
        subtitle="The CJCS reviews the supported commander's plan against these."
        doctrineRef="JP 5-0, IV-59"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {PLAN_REVIEW_CRITERIA.map(c => (
            <label
              key={c.id}
              className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-joint-900 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!state.order.reviewCriteria[c.id]}
                onChange={(e) =>
                  setOrder({
                    reviewCriteria: { ...state.order.reviewCriteria, [c.id]: e.target.checked },
                  })
                }
                className="rounded border-slate-700 text-joint-500 bg-slate-950 focus:ring-0"
              />
              <span
                className={`text-[11px] ${
                  state.order.reviewCriteria[c.id] ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {c.label}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <Field
            label="Documentation notes"
            value={state.order.documentationNotes}
            onChange={(v) => setOrder({ documentationNotes: v })}
            placeholder="Annexes required, distribution, classification handling..."
          />
        </div>
      </SectionCard>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const PlanOrderDevelopment: React.FC<PlanOrderDevelopmentProps> = ({
  onOpenExportModal,
}) => {
  const {
    scenario,
    planOrderDevelopment: state,
    setPlanOrderDevelopment: onStateChange,
    coaApproval,
    coaDevelopment,
  } = usePlanning();

  const [activeTab, setActiveTab] = useState<TabId>('conops');

  const conopsFilled = CONOPS_REQUIREMENTS.filter(
    r => ((state.conops[r.key as keyof RefinedConops] as string) || '').trim()
  ).length;
  const activitiesComplete = state.activities.filter(a => a.status === 'complete').length;
  const openShortfalls = state.shortfalls.filter(s => !s.resolved).length;
  const approvedCount = coaDevelopment.coas.filter(c =>
    coaApproval.decision.selectedCoaIds.includes(c.id)
  ).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="bg-gradient-to-r from-slate-900 via-joint-950/30 to-slate-950 p-6 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                STEP 7 OF 7
              </span>
              <span className="text-slate-400 text-xs font-mono">JP 5-0 Ch IV, para 4.h</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-joint-400" />
              Plan or Order Development
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Expand the approved COA for Operation {scenario.operationName} into a detailed plan or
              order by refining its initial CONOPS — the centerpiece of the plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
          <div className="p-2.5 bg-joint-950/50 rounded border border-joint-800 text-center">
            <div className="text-lg font-mono font-bold text-joint-300">
              {conopsFilled}
              <span className="text-slate-600 text-xs">/{CONOPS_REQUIREMENTS.length}</span>
            </div>
            <div className="text-[9px] text-joint-400 uppercase font-mono">CONOPS Elements</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">
              {activitiesComplete}
              <span className="text-slate-600 text-xs">/{state.activities.length}</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Activities Complete</div>
          </div>
          <div
            className={`p-2.5 rounded border text-center ${
              openShortfalls > 0
                ? 'bg-amber-950/30 border-amber-900/60'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div
              className={`text-lg font-mono font-bold ${
                openShortfalls > 0 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {openShortfalls}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Open Shortfalls</div>
          </div>
          <div
            className={`p-2.5 rounded border text-center ${
              approvedCount > 0
                ? 'bg-emerald-950/30 border-emerald-900/60'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div
              className={`text-lg font-mono font-bold ${
                approvedCount > 0 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {state.order.type}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Product</div>
          </div>
        </div>

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
        {activeTab === 'conops' && <ConopsTab state={state} onChange={onStateChange} />}
        {activeTab === 'activities' && <ActivitiesTab state={state} onChange={onStateChange} />}
        {activeTab === 'tpfdd' && <TpfddTab state={state} onChange={onStateChange} />}
        {activeTab === 'shortfalls' && <ShortfallsTab state={state} onChange={onStateChange} />}
        {activeTab === 'review' && <ReviewTab state={state} onChange={onStateChange} />}
      </div>
    </div>
  );
};
