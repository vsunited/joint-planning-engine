'use client';

import type { PlanningState } from '@/context/PlanningContext';
import type { UploadedDocument } from '@/types/scenario';

/**
 * Saving and reopening a plan.
 *
 * Planning state lived only in memory, so a browser reload destroyed the
 * staff's work. That is unacceptable in a tool meant to be used under time
 * pressure, and it quietly made "continuity" an unsupportable claim.
 *
 * A plan file is ordinary JSON written to the planner's own disk. Nothing is
 * uploaded, which keeps the plan inside the boundary it was created in — the
 * same property the rest of the product depends on.
 */

/**
 * Bumped when the shape changes incompatibly.
 *
 * A file from a future version is refused rather than half-read: loading an
 * unknown shape would populate some fields, silently drop others, and leave a
 * planner working from a plan they believe is complete.
 */
export const PLAN_FORMAT_VERSION = 1;

export interface PlanFile {
  format: 'jpe.plan';
  version: number;
  savedAt: string;
  /** Carried for the header and so a reader knows what they have. */
  meta: {
    operationName: string;
    designation: string;
    establishedBy: string;
    classification: string;
  };
  state: PlanningState;
}

/**
 * Page images are dropped.
 *
 * They are base64 renders of scanned pages, often several megabytes, and they
 * exist only until a vision model has transcribed them. Keeping them would
 * bloat every plan file and overflow browser storage for no benefit once the
 * text has been extracted.
 */
function stripImages(docs: UploadedDocument[]): UploadedDocument[] {
  return docs.map(d => {
    if (!d.images?.length) return d;
    const { images, ...rest } = d;
    return {
      ...rest,
      detail: d.text
        ? d.detail
        : 'Page images are not saved with a plan. Re-upload this document to transcribe it.',
    };
  });
}

export function toPlanFile(state: PlanningState): PlanFile {
  return {
    format: 'jpe.plan',
    version: PLAN_FORMAT_VERSION,
    savedAt: new Date().toISOString(),
    meta: {
      operationName: state.scenario.operationName,
      designation: state.echelon.designation,
      establishedBy: state.echelon.establishedBy,
      classification: state.scenario.classification,
    },
    /*
     * Slices are picked explicitly rather than spread. Callers hand this the
     * planning context, which also carries the setter functions; relying on
     * JSON dropping them would work by accident and break the moment a
     * serialisable field were added alongside them.
     */
    state: {
      scenario: {
        ...state.scenario,
        uploadedDocuments: stripImages(state.scenario.uploadedDocuments),
      },
      echelon: state.echelon,
      planningInit: state.planningInit,
      missionAnalysis: state.missionAnalysis,
      coaDevelopment: state.coaDevelopment,
      coaAnalysis: state.coaAnalysis,
      coaComparison: state.coaComparison,
      coaApproval: state.coaApproval,
      planOrderDevelopment: state.planOrderDevelopment,
    },
  };
}

export interface PlanLoadResult {
  state: PlanningState;
  warnings: string[];
}

const SLICES: (keyof PlanningState)[] = [
  'scenario',
  'echelon',
  'planningInit',
  'missionAnalysis',
  'coaDevelopment',
  'coaAnalysis',
  'coaComparison',
  'coaApproval',
  'planOrderDevelopment',
];

/**
 * Reads a plan file onto a known-good baseline.
 *
 * Each slice is taken from the file only if present, so a file written before
 * a step existed opens with that step empty rather than undefined — which
 * would crash the module that renders it. Anything missing is reported rather
 * than passed over, because a planner is entitled to know their plan came back
 * incomplete.
 */
export function fromPlanFile(raw: unknown, baseline: PlanningState): PlanLoadResult {
  const file = raw as Partial<PlanFile>;
  if (!file || file.format !== 'jpe.plan') {
    throw new Error('That file is not a Joint Planning Engine plan.');
  }
  if (typeof file.version !== 'number') {
    throw new Error('That plan file has no version and cannot be read safely.');
  }
  if (file.version > PLAN_FORMAT_VERSION) {
    throw new Error(
      `That plan was saved by a newer version of the application (format ${file.version}). ` +
        'Update before opening it.'
    );
  }
  if (!file.state || typeof file.state !== 'object') {
    throw new Error('That plan file contains no planning data.');
  }

  const incoming = file.state as Partial<PlanningState>;
  const warnings: string[] = [];
  const state = { ...baseline };

  SLICES.forEach(key => {
    const value = incoming[key];
    if (value && typeof value === 'object') {
      (state as Record<string, unknown>)[key] = value;
    } else {
      warnings.push(key);
    }
  });

  return {
    state,
    warnings: warnings.length
      ? [`Not present in the file and left empty: ${warnings.join(', ')}.`]
      : [],
  };
}

/** A filename a planner can recognise in a folder six weeks later. */
export function planFilename(state: PlanningState): string {
  const safe = (s: string) => (s || 'plan').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const stamp = new Date().toISOString().slice(0, 10);
  return `${safe(state.echelon.designation)}-${safe(state.scenario.operationName)}-${stamp}.jpeplan.json`;
}
