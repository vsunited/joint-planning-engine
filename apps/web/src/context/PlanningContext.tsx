'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { OperationalScenario } from '@/types/scenario';
import { emit, isRecording } from '@/lib/telemetry/probe';
import { diffState } from '@/lib/telemetry/diff';
import {
  PlanningInitiationState,
  MissionAnalysisState,
  CoaDevelopmentState,
  CoaAnalysisState,
  CoaComparisonState,
  CoaApprovalState,
  PlanOrderDevelopmentState,
} from '@/types/planning';

/**
 * The full planning workspace: the operational scenario plus one state slice
 * per JPP step.
 *
 * Steps read each other's output — Step 4 needs Step 3's COAs, Step 5 needs
 * Steps 2–4, Step 6 needs Steps 2–5 — which previously meant threading a
 * growing set of props through `page.tsx`. Holding it here lets each module
 * pull exactly what it needs.
 */
export interface PlanningState {
  scenario: OperationalScenario;
  planningInit: PlanningInitiationState;
  missionAnalysis: MissionAnalysisState;
  coaDevelopment: CoaDevelopmentState;
  coaAnalysis: CoaAnalysisState;
  coaComparison: CoaComparisonState;
  coaApproval: CoaApprovalState;
  planOrderDevelopment: PlanOrderDevelopmentState;
}

interface PlanningContextValue extends PlanningState {
  setScenario: (value: OperationalScenario) => void;
  setPlanningInit: (value: PlanningInitiationState) => void;
  setMissionAnalysis: (value: MissionAnalysisState) => void;
  setCoaDevelopment: (value: CoaDevelopmentState) => void;
  setCoaAnalysis: (value: CoaAnalysisState) => void;
  setCoaComparison: (value: CoaComparisonState) => void;
  setCoaApproval: (value: CoaApprovalState) => void;
  setPlanOrderDevelopment: (value: PlanOrderDevelopmentState) => void;
}

const PlanningContext = createContext<PlanningContextValue | null>(null);

/**
 * `initialState` is built by the caller rather than constructed here, so this
 * module never imports the step components. Those components import
 * `usePlanning`, and importing their factories back would create a cycle.
 */
export const PlanningProvider: React.FC<{
  initialState: PlanningState;
  children: React.ReactNode;
}> = ({ initialState, children }) => {
  const [state, setState] = useState<PlanningState>(initialState);

  /*
   * A mirror of state, updated synchronously inside `apply`.
   *
   * Trial telemetry needs the previous value of a slice to work out which
   * field changed. Reading it from `state` would hand back a stale value when
   * two setters fire in the same tick, and diffing inside the setState updater
   * would double-count under StrictMode, which re-invokes updaters. `apply` is
   * only ever called from event handlers, so mirroring here is exact.
   */
  const mirror = useRef<PlanningState>(initialState);

  /**
   * The single write path for every step.
   *
   * All seven step modules mutate through here, which is what lets the trial
   * harness instrument field edits across the whole application at one point
   * instead of in each component. When no trial is running `isRecording()` is
   * false and this costs one comparison.
   */
  const apply = useCallback(
    <K extends keyof PlanningState>(key: K, value: PlanningState[K]) => {
      const prev = mirror.current[key];
      if (prev === value) return;

      if (isRecording()) {
        diffState(prev, value, key as string).forEach(change =>
          emit('field.edit', { path: change.path, len: change.len })
        );
      }

      mirror.current = { ...mirror.current, [key]: value };
      setState(s => ({ ...s, [key]: value }));
    },
    []
  );

  const setScenario = useCallback(
    (value: OperationalScenario) => apply('scenario', value),
    [apply]
  );
  const setPlanningInit = useCallback(
    (value: PlanningInitiationState) => apply('planningInit', value),
    [apply]
  );
  const setMissionAnalysis = useCallback(
    (value: MissionAnalysisState) => apply('missionAnalysis', value),
    [apply]
  );
  const setCoaDevelopment = useCallback(
    (value: CoaDevelopmentState) => apply('coaDevelopment', value),
    [apply]
  );
  const setCoaAnalysis = useCallback(
    (value: CoaAnalysisState) => apply('coaAnalysis', value),
    [apply]
  );
  const setCoaComparison = useCallback(
    (value: CoaComparisonState) => apply('coaComparison', value),
    [apply]
  );
  const setCoaApproval = useCallback(
    (value: CoaApprovalState) => apply('coaApproval', value),
    [apply]
  );
  const setPlanOrderDevelopment = useCallback(
    (value: PlanOrderDevelopmentState) => apply('planOrderDevelopment', value),
    [apply]
  );

  const value = useMemo<PlanningContextValue>(
    () => ({
      ...state,
      setScenario,
      setPlanningInit,
      setMissionAnalysis,
      setCoaDevelopment,
      setCoaAnalysis,
      setCoaComparison,
      setCoaApproval,
      setPlanOrderDevelopment,
    }),
    [
      state,
      setScenario,
      setPlanningInit,
      setMissionAnalysis,
      setCoaDevelopment,
      setCoaAnalysis,
      setCoaComparison,
      setCoaApproval,
      setPlanOrderDevelopment,
    ]
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
};

/** Access the planning workspace. Throws outside a `PlanningProvider`. */
export function usePlanning(): PlanningContextValue {
  const ctx = useContext(PlanningContext);
  if (!ctx) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return ctx;
}
