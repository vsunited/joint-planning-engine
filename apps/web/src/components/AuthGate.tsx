'use client';

import React, { useEffect, useState } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { authService, isAuthorizedEmail } from '@/lib/authService';

/**
 * Route guard.
 *
 * Every page renders behind this, including the trial console. That console
 * carries only a clock and two fictional directives, but the application it
 * belongs to is access-controlled, and one open route on an otherwise closed
 * site is the sort of inconsistency nobody intends and everybody finds.
 *
 * Authorisation is asked of `isAuthorizedEmail` rather than compared here, so
 * the list of who may sign in lives in exactly one place.
 *
 * Local development bypasses the gate. Firebase Auth needs a real project and
 * a popup, and requiring both to run `pnpm dev` would mean every developer
 * working around the guard instead of through it.
 */
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged(user => {
      setIsAuthenticated(isAuthorizedEmail(user?.email));
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex min-h-screen bg-[#090d13] items-center justify-center">
        <div className="w-8 h-8 border-2 border-joint-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
};
