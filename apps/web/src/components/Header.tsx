'use client';

import React from 'react';
import { Shield, Sparkles, UserCheck, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  userRank?: string;
  userName?: string;
  userRole?: string;
  echelon?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userRank = 'MAJ',
  userName = 'D. Hess',
  userRole = 'Lead J5 Planner',
  echelon = 'JTF-Horn of Africa / J5 Plans',
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white font-mono">
                JOINT PLANNING ENGINE
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                JP 5-0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{echelon}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/90 font-sans font-medium">Operation Sentinel Resolve</span>
            </p>
          </div>
        </div>

        {/* Right Side: Operational Helpers & Officer Profile */}
        <div className="flex items-center gap-4">
          {/* AI Doctrine Engine Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950/60 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] font-mono font-semibold text-slate-300 flex items-center gap-1">
                Vertex AI Grounding
              </div>
              <div className="text-[9px] text-emerald-400/90 font-mono">JP 5-0 / JP 3-0 Synthesizer</div>
            </div>
          </div>

          {/* Quick Notifications */}
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition">
            <Bell className="w-4 h-4" />
          </button>

          {/* Officer Profile Badge (Tailored for O3-O7) */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {userRank}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                {userRank} {userName}
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{userRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};
