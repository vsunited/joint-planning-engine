/**
 * Planning assistant contract.
 *
 * Deliberately provider-agnostic. Planning data is CUI, so it cannot be sent to
 * a commercial API even on a connected network — the shipped adapter targets
 * local inference inside the air gap. The interface leaves room for other
 * providers without the rest of the app knowing which is in use, mirroring
 * `IAuthService` in packages/shared/src/auth.ts.
 */

/** A task extracted from a higher-HQ order. */
export interface ExtractedTask {
  description: string;
  classification: 'specified' | 'implied';
  isEssential: boolean;
  source: string;
  rationale: string;
}

/** A drafted course of action, shaped to the app's own COA types. */
export interface DraftedCoa {
  name: string;
  narrative: string;
  statement: {
    who: string;
    what: string;
    where: string;
    when: string;
    decisionPoints: string;
    how: string;
    why: string;
    assessment: string;
    intelConcept: string;
  };
  conops: {
    operationalArea: string;
    objectives: string;
    essentialTasks: string;
    forcesCapabilities: string;
    integratedTimeline: string;
    taskOrganization: string;
    operationalConcept: string;
    sustainmentConcept: string;
    commSync: string;
    risk: string;
    requiredDecisions: string;
    deploymentConcept: string;
    mainSupportingEfforts: string;
  };
  distinguishability: {
    mainEffort: string;
    scheme: string;
    sequencing: 'simultaneous' | 'sequential' | 'combination';
    mechanism: string;
    taskOrg: string;
    reserves: string;
  };
}

/** One criterion's verdict from the validity critique. */
export interface CritiqueVerdict {
  status: 'pass' | 'fail';
  rationale: string;
  /** Which of the criterion's doctrinal sub-tests the COA does not satisfy. */
  failedSubTests: string[];
}

/** Critique keyed by the five doctrinal validity criteria. */
export interface CoaCritique {
  suitable: CritiqueVerdict;
  feasible: CritiqueVerdict;
  acceptable: CritiqueVerdict;
  distinguishable: CritiqueVerdict;
  complete: CritiqueVerdict;
  overall: string;
}

/** Operational context passed to every call, so output is situated. */
export interface AssistantContext {
  jtfName: string;
  operationName: string;
  higherHq: string;
  aorRegion: string;
  classification: string;
  missionStatement?: string;
  commandersIntent?: string;
  enemyMlcoa?: string;
  enemyMdcoa?: string;
  enemyCog?: string;
  essentialTasks?: string[];
  /** Designators of COAs that already exist, so a draft is distinguishable. */
  existingCoaSummaries?: string[];
}

export interface AssistantConfig {
  /** OpenAI-compatible base URL, e.g. http://localhost:11434/v1 */
  baseUrl: string;
  model: string;
  /**
   * Vision-capable model, used to transcribe scanned documents and images.
   * Separate from `model` because text and vision are rarely the same weights.
   */
  visionModel: string;
  temperature: number;
  /** Milliseconds before a request is abandoned. Local models can be slow. */
  timeoutMs: number;
}

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  baseUrl: 'http://localhost:11434/v1',
  model: 'llama3.1:8b',
  visionModel: 'qwen3-vl:8b',
  temperature: 0.2,
  /*
   * Generous by default. An 8B model on Apple silicon runs roughly 30-43s for a
   * task extraction, and a COA draft is several times that output — it emits
   * nine statement fields plus thirteen CONOPS elements in one response.
   */
  timeoutMs: 300000,
};

export interface AvailabilityResult {
  reachable: boolean;
  /** Models the endpoint reports, when it can be asked. */
  models: string[];
  detail: string;
}

/** Thrown for any assistant failure, with a message fit to show a planner. */
export class AssistantError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AssistantError';
  }
}

export interface IPlanningAssistant {
  getConfig(): AssistantConfig;
  checkAvailability(): Promise<AvailabilityResult>;
  extractTasks(orderText: string, ctx: AssistantContext): Promise<ExtractedTask[]>;
  /** Transcribes page images from a scanned document into text. */
  transcribeImages(images: string[], ctx: AssistantContext): Promise<string>;
  draftCoa(guidance: string, ctx: AssistantContext): Promise<DraftedCoa>;
  critiqueCoa(coaText: string, ctx: AssistantContext): Promise<CoaCritique>;
}
