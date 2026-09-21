import {
  AssistantConfig,
  AssistantContext,
  AssistantError,
  AvailabilityResult,
  CoaCritique,
  DraftedCoa,
  ExtractedTask,
  IPlanningAssistant,
  DEFAULT_ASSISTANT_CONFIG,
} from './types';
import {
  ROLE_PREAMBLE,
  TASK_RULES,
  contextBlock,
  conopsElements,
  distinguishabilityFactors,
  statementQuestions,
  validityRubric,
} from './doctrine';
import {
  extractJson,
  validateCritique,
  validateDraftedCoa,
  validateTasks,
  ShapeError,
} from './validate';

/**
 * Assistant backed by any OpenAI-compatible chat endpoint.
 *
 * Targeting the OpenAI shape rather than a vendor-specific API means the same
 * adapter drives Ollama, llama.cpp, LM Studio or vLLM — so an air-gapped
 * install is not locked to one runtime.
 */
export class OpenAiCompatibleAssistant implements IPlanningAssistant {
  private config: AssistantConfig;

  constructor(config: Partial<AssistantConfig> = {}) {
    this.config = { ...DEFAULT_ASSISTANT_CONFIG, ...config };
  }

  getConfig(): AssistantConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<AssistantConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private base(): string {
    return this.config.baseUrl.replace(/\/+$/, '');
  }

  async checkAvailability(): Promise<AvailabilityResult> {
    try {
      const res = await this.fetchWithTimeout(`${this.base()}/models`, { method: 'GET' }, 8000);
      if (!res.ok) {
        return { reachable: false, models: [], detail: `Endpoint returned HTTP ${res.status}.` };
      }
      const body = await res.json();
      const models: string[] = Array.isArray(body?.data)
        ? body.data.map((m: { id?: string }) => m?.id).filter(Boolean)
        : [];
      return {
        reachable: true,
        models,
        detail: models.length
          ? `Reachable. ${models.length} model${models.length === 1 ? '' : 's'} available.`
          : 'Reachable, but no models are loaded. Pull a model first.',
      };
    } catch (err) {
      return {
        reachable: false,
        models: [],
        detail:
          'Could not reach the inference endpoint. Check that your local model server is running ' +
          'and that it allows requests from this page.',
      };
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /** One chat completion returning raw assistant text. */
  private async complete(system: string, user: string): Promise<string> {
    if (!this.config.model) {
      throw new AssistantError('No model is selected. Choose one in assistant settings.');
    }
    let res: Response;
    try {
      res = await this.fetchWithTimeout(
        `${this.base()}/chat/completions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.model,
            temperature: this.config.temperature,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
          }),
        },
        this.config.timeoutMs
      );
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        throw new AssistantError(
          `The model did not respond within ${Math.round(this.config.timeoutMs / 1000)}s. ` +
            'Local models can be slow on first load — try again, or choose a smaller model.'
        );
      }
      throw new AssistantError(
        'Could not reach the inference endpoint. Check that your local model server is running.',
        err
      );
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new AssistantError(
        `The inference endpoint returned HTTP ${res.status}. ${detail.slice(0, 200)}`.trim()
      );
    }

    const body = await res.json();
    const content: string = body?.choices?.[0]?.message?.content ?? '';
    if (!content.trim()) throw new AssistantError('The model returned an empty response.');
    return content;
  }

  /**
   * Runs a prompt and validates the result, giving the model exactly one
   * chance to repair a malformed response before failing.
   */
  private async completeValidated<T>(
    system: string,
    user: string,
    validate: (data: unknown) => T
  ): Promise<T> {
    const raw = await this.complete(system, user);
    try {
      return validate(extractJson(raw));
    } catch (err) {
      if (!(err instanceof ShapeError) && !(err instanceof AssistantError)) throw err;

      const repair =
        `${user}\n\n---\nYour previous response could not be used: ${(err as Error).message}\n` +
        `Previous response:\n${raw.slice(0, 2000)}\n\n` +
        `Return the corrected JSON object only. No prose, no code fences.`;
      const retry = await this.complete(system, repair);
      try {
        return validate(extractJson(retry));
      } catch (err2) {
        throw new AssistantError(
          `The model could not produce valid output: ${(err2 as Error).message}`,
          err2
        );
      }
    }
  }

  async extractTasks(orderText: string, ctx: AssistantContext): Promise<ExtractedTask[]> {
    const trimmed = (orderText || '').trim();
    if (!trimmed) throw new AssistantError('No order text was provided.');

    const system = `${ROLE_PREAMBLE}

TASK CLASSIFICATION RULES (JP 5-0, mission analysis):
${TASK_RULES}

OPERATIONAL CONTEXT:
${contextBlock(ctx)}

Return this exact shape:
{"tasks":[{"description":"string","classification":"specified"|"implied","isEssential":boolean,"source":"string — where in the order this came from, or how it was deduced","rationale":"string — one sentence"}]}`;

    const user = `Extract every task assigned to or implied for this headquarters
from the order below.

Work through the order paragraph by paragraph. Each lettered or numbered
sub-task is a separate task — do not merge them. Classify each as specified or
implied, and mark the few that are essential.

Each task appears exactly once. Never list the same task under more than one
classification. Do not include tasks belonging to a higher or adjacent
headquarters.

ORDER TEXT:
"""
${trimmed.slice(0, 24000)}
"""`;

    return this.completeValidated(system, user, validateTasks);
  }

  async draftCoa(guidance: string, ctx: AssistantContext): Promise<DraftedCoa> {
    const system = `${ROLE_PREAMBLE}

A COA statement must answer these nine questions (JP 5-0, IV-37):
${statementQuestions()}

An initial CONOPS covers these thirteen elements (JP 5-0, IV-30):
${conopsElements()}

A COA must be distinguishable from other COAs on these factors (JP 5-0, IV-38):
${distinguishabilityFactors()}

OPERATIONAL CONTEXT:
${contextBlock(ctx)}

Return this exact shape, using the bracketed keys above as JSON field names:
{"name":"short title","narrative":"concept narrative","statement":{nine keys},"conops":{thirteen keys},"distinguishability":{"mainEffort":"","scheme":"","sequencing":"simultaneous"|"sequential"|"combination","mechanism":"","taskOrg":"","reserves":""}}`;

    const user = `Draft one course of action.

It must accomplish the essential tasks listed in the context, and must be
clearly distinguishable from any COA already developed. Where the context does
not tell you something, state the assumption in that field rather than
inventing specifics.

COMMANDER'S GUIDANCE:
"""
${(guidance || 'No additional guidance provided.').slice(0, 8000)}
"""`;

    return this.completeValidated(system, user, validateDraftedCoa);
  }

  async critiqueCoa(coaText: string, ctx: AssistantContext): Promise<CoaCritique> {
    const system = `${ROLE_PREAMBLE}

Assess the COA against the five validity criteria. A COA failing any one of
these is not valid and must be rejected or revised (JP 5-0, IV-37 to IV-39):

${validityRubric()}

OPERATIONAL CONTEXT:
${contextBlock(ctx)}

Return this exact shape:
{"suitable":{"status":"pass"|"fail","rationale":"string","failedSubTests":["string"]},
 "feasible":{...},"acceptable":{...},"distinguishable":{...},"complete":{...},
 "overall":"one paragraph summary for the commander"}

For each criterion, list in failedSubTests the specific lettered sub-tests the
COA does not satisfy. An empty list means every sub-test is satisfied. Judge
only what the COA actually says — absence of required content is a failure of
the "complete" criterion, not an invitation to assume it.`;

    const user = `Critique this course of action.

COURSE OF ACTION:
"""
${(coaText || '').slice(0, 16000)}
"""`;

    return this.completeValidated(system, user, validateCritique);
  }
}
