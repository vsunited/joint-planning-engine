'use client';

import React from 'react';

/**
 * Classification banner.
 *
 * This bar previously claimed a "DISA COMPLIANT BOUNDARY". Nothing backed
 * that. The application is a static build served from a commercial cloud, it
 * holds no authorization to operate, and the capability sheet handed to the
 * same evaluator says so in as many words. A banner asserting an accreditation
 * the one-pager disclaims is the kind of contradiction that costs a room's
 * confidence in everything else on the screen.
 *
 * The markings themselves were wrong in three further ways, each of which this
 * audience reads fluently:
 *
 *   - FOUO was superseded by CUI under DoDI 5200.48. "UNCLASSIFIED // FOUO"
 *     reads as markings written from memory rather than from the instruction.
 *   - "REL TO" is a dissemination control for classified material. CUI takes
 *     limited dissemination controls, so "CUI // REL TO USA, FVEY" is not a
 *     construction that exists.
 *   - The bar announced CONTROLLED UNCLASSIFIED INFORMATION permanently, even
 *     while the centre of the same bar read UNCLASSIFIED.
 *
 * What replaces them is narrow and true: the marking the planner selected, and
 * a standing reminder of what this build actually is. Stating the limitation
 * plainly is what makes the rest of the screen credible.
 */

interface ClassificationBarProps {
  level?: 'UNCLASSIFIED' | 'CUI';
}

export const ClassificationBar: React.FC<ClassificationBarProps> = ({ level = 'UNCLASSIFIED' }) => {
  const isCUI = level === 'CUI';

  return (
    <div
      className={`w-full py-1 px-4 text-xs font-bold tracking-widest uppercase select-none transition-colors border-b ${
        isCUI
          ? /* CUI banners are purple. The maroon used here reads as SECRET. */
            'bg-[#4b0082] text-purple-50 border-purple-900'
          : 'bg-[#15803d] text-emerald-50 border-emerald-600/80 shadow-inner'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <span className="opacity-70 font-mono text-[10px] hidden sm:inline normal-case tracking-normal">
          Prototype — not accredited, no ATO
        </span>
        <span className="tracking-[0.2em] font-mono">{isCUI ? 'CUI' : 'UNCLASSIFIED'}</span>
        <span className="opacity-70 font-mono text-[10px] hidden sm:inline normal-case tracking-normal">
          Marking is set by the planner
        </span>
      </div>
    </div>
  );
};
