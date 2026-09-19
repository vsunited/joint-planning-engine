'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { OperationalScenario } from '@/types/scenario';
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

  const setScenario = useCallback(
    (scenario: OperationalScenario) => setState(s => ({ ...s, scenario })),
    []
  );
  const setPlanningInit = useCallback(
    (planningInit: PlanningInitiationState) => setState(s => ({ ...s, planningInit })),
    []
  );
  const setMissionAnalysis = useCallback(
    (missionAnalysis: MissionAnalysisState) => setState(s => ({ ...s, missionAnalysis })),
    []
  );
  const setCoaDevelopment = useCallback(
    (coaDevelopment: CoaDevelopmentState) => setState(s => ({ ...s, coaDevelopment })),
    []
  );
  const setCoaAnalysis = useCallback(
    (coaAnalysis: CoaAnalysisState) => setState(s => ({ ...s, coaAnalysis })),
    []
  );
  const setCoaComparison = useCallback(
    (coaComparison: CoaComparisonState) => setState(s => ({ ...s, coaComparison })),
    []
  );
  const setCoaApproval = useCallback(
    (coaApproval: CoaApprovalState) => setState(s => ({ ...s, coaApproval })),
    []
  );

  const setPlanOrderDevelopment = useCallback(
    (planOrderDevelopment: PlanOrderDevelopmentState) =>
      setState(s => ({ ...s, planOrderDevelopment })),
    []
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
