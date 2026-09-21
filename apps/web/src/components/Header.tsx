'use client';

import React from 'react';
import { Shield, Sparkles, UserCheck, Bell, Settings2, FolderPlus } from 'lucide-react';
import { OperationalScenario } from '@/types/scenario';

interface HeaderProps {
  scenario: OperationalScenario;
  onOpenScenarioModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  onOpenScenarioModal,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Context */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-joint-600/30 via-slate-900 to-slate-950 border border-joint-500/40 flex items-center justify-center shadow-lg shadow-joint-950/60">
            <Shield className="w-5 h-5 text-joint-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white font-mono">
                JOINT PLANNING ENGINE
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-700/60 font-semibold shadow-sm">
                JOINT STAFF JP 5-0
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span className="text-slate-200 font-semibold">{scenario.jtfName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/90 font-sans font-medium">Operation {scenario.operationName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 text-[10px]">{scenario.higherHq}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Operational Helpers & Officer Profile */}
        <div className="flex items-center gap-3">
          {/* Scenario Config Button */}
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-joint-950/80 hover:bg-joint-900/80 text-joint-200 border border-joint-700/70 hover:border-joint-500 transition shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5 text-joint-400" />
            <span className="text-xs font-semibold font-mono">Scenario Setup</span>
          </button>

          {/* AI Doctrine Engine Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-joint-400 animate-pulse" />
            <div className="text-left">
              
            </div>
          </div>

          {/* Quick Notifications */}
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition">
            <Bell className="w-4 h-4" />
          </button>

          {/* Officer Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-joint-950 border border-joint-700/60 flex items-center justify-center text-xs font-bold text-joint-300 shadow-inner">
              {scenario.commandingOfficer.split(' ')[0] || 'O4'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                {scenario.commandingOfficer}
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{scenario.officerRole}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
