'use client';

import React from 'react';

interface ClassificationBarProps {
  level?: 'UNCLASSIFIED' | 'CUI';
}

export const ClassificationBar: React.FC<ClassificationBarProps> = ({ level = 'UNCLASSIFIED' }) => {
  const isCUI = level === 'CUI';

  return (
    <div
      className={`w-full text-center py-1 px-4 text-xs font-bold tracking-widest uppercase select-none transition-colors border-b ${
        isCUI
          ? 'bg-[#500000] text-purple-100 border-[#700000]'
          : 'bg-[#15803d] text-emerald-50 border-emerald-600/80 shadow-inner'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <span className="opacity-75 font-mono text-[10px] hidden sm:inline">CONTROLLED UNCLASSIFIED INFORMATION</span>
        <span className="tracking-[0.2em] font-mono">
          {isCUI ? 'CUI // REL TO USA, FVEY' : 'UNCLASSIFIED // FOUO'}
        </span>
        <span className="opacity-75 font-mono text-[10px] hidden sm:inline">DISA COMPLIANT BOUNDARY</span>
      </div>
    </div>
  );
};
