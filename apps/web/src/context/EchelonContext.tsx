'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PlanningEchelon } from '@jpe/shared';
import { DEFAULT_ECHELON, loadEchelon, saveEchelon } from '@/lib/echelon';

/**
 * Provides the planning echelon to every module.
 *
 * Read-only to consumers apart from the setup dialog: modules ask which
 * headquarters they are planning for, they never decide it.
 */
interface EchelonContextValue {
  echelon: PlanningEchelon;
  locked: boolean;
  /** Persists and locks. */
  confirm: (value: PlanningEchelon) => void;
  /** Reopens for editing; the caller is responsible for warning first. */
  unlock: () => void;
}

const EchelonContext = createContext<EchelonContextValue | null>(null);

export const EchelonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [echelon, setEchelon] = useState<PlanningEchelon>(DEFAULT_ECHELON);

  /* localStorage is not available during the static export's prerender. */
  useEffect(() => setEchelon(loadEchelon()), []);

  const confirm = useCallback((value: PlanningEchelon) => {
    const locked = { ...value, lockedAt: new Date().toISOString() };
    saveEchelon(locked);
    setEchelon(locked);
  }, []);

  const unlock = useCallback(() => {
    setEchelon(prev => {
      const next = { ...prev };
      delete next.lockedAt;
      saveEchelon(next);
      return next;
    });
  }, []);

  const value = useMemo<EchelonContextValue>(
    () => ({ echelon, locked: !!echelon.lockedAt, confirm, unlock }),
    [echelon, confirm, unlock]
  );

  return <EchelonContext.Provider value={value}>{children}</EchelonContext.Provider>;
};

export function useEchelon(): EchelonContextValue {
  const ctx = useContext(EchelonContext);
  if (!ctx) throw new Error('useEchelon must be used inside an EchelonProvider.');
  return ctx;
}
