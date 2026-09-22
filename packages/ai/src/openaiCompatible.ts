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
  FieldSpec,
  PopulatedField,
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
  validatePopulation,
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

  /**
   * One vision completion. Images are sent as a content array.
   *
   * Ollama expects `image_url` as a bare data-URI string, while the OpenAI
   * spec uses `{ url }`. Emitting both keeps this portable across Ollama,
   * llama.cpp and vLLM without sniffing which server is on the other end.
   */
  private async completeVision(system: string, prompt: string, images: string[]): Promise<string> {
    if (!this.config.visionModel) {
      throw new AssistantError(
        'No vision model is configured. Set one in assistant settings to read scanned documents.'
      );
    }

    /*
     * Ollama takes `image_url` as a bare data-URI string; the OpenAI spec uses
     * `{ url }`. Try the string form, then fall back to the object form if the
     * server gives nothing back — sending both at once duplicates the image in
     * the prompt and makes the model return an empty transcription.
     */
    const buildContent = (asObject: boolean): unknown[] => [
      { type: 'text', text: prompt },
      ...images.map(src => ({
        type: 'image_url',
        image_url: asObject ? { url: src } : src,
      })),
    ];

    const text = await this.visionRequest(system, buildContent(false));
    if (text.trim()) return text;
    return this.visionRequest(system, buildContent(true));
  }

  /** One vision request with a prepared content array. */
  private async visionRequest(system: string, content: unknown[]): Promise<string> {
    let res: Response;
    try {
      res = await this.fetchWithTimeout(
        `${this.base()}/chat/completions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.visionModel,
            temperature: 0,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content },
            ],
          }),
        },
        this.config.timeoutMs
      );
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        throw new AssistantError(
          'The vision model did not respond in time. Transcribing pages is slow — try fewer ' +
            'pages, or a smaller vision model.'
        );
      }
      throw new AssistantError('Could not reach the inference endpoint.', err);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      if (res.status === 404) {
        throw new AssistantError(
          `The vision model "${this.config.visionModel}" is not available on the endpoint. ` +
            'Pull it first, or set a different model in assistant settings.'
        );
      }
      throw new AssistantError(
        `The inference endpoint returned HTTP ${res.status}. ${detail.slice(0, 200)}`.trim()
      );
    }

    const body = await res.json();
    return body?.choices?.[0]?.message?.content ?? '';
  }

  async populateFields(
    fields: FieldSpec[],
    sourceText: string,
    sourceIsDirective: boolean,
    ctx: AssistantContext
  ): Promise<PopulatedField[]> {
    const trimmed = (sourceText || '').trim();
    if (!trimmed) throw new AssistantError('No source document was provided.');
    if (!fields.length) throw new AssistantError('No fields were requested.');

    const schema = fields
      .map(
        f =>
          `  "${f.key}" — ${f.label}. ${f.guidance}` +
          (f.kind === 'list' ? ' Return an array of strings.' : '')
      )
      .join('\n');

    /*
     * A reference document cannot task this headquarters. Saying so here stops
     * the model lifting another command's taskings into these fields as though
     * they had been issued to us.
     */
    const provenance = sourceIsDirective
      ? `This document is the order that tasks ${ctx.echelon.designation}. Its taskings apply directly.`
      : `This document was NOT issued to ${ctx.echelon.designation}; it is background. Do not ` +
        `present its taskings as ours. Draft only what ${ctx.echelon.designation} would record ` +
        `given that this document exists.`;

    const system = `${ROLE_PREAMBLE}

OPERATIONAL CONTEXT:
${contextBlock(ctx)}

PROVENANCE OF THE SOURCE:
  ${provenance}

Fill only these fields:
${schema}

Return a single JSON object whose keys are the field keys above and whose values
are {"value": <string or array of strings>, "evidence": "a short quote from the
source, or an empty string if you inferred it"}.

Leave a field out entirely rather than guessing. An omitted field costs the
planner nothing; an invented one costs them their trust in every other field.`;

    const user = `Draft the fields above from the document below.

Use the document's own wording where it carries the meaning. Do not pad, do not
restate the field name back as its value, and do not add fields nobody asked for.

SOURCE DOCUMENT:
${trimmed.slice(0, 24000)}`;

    return this.completeValidated(system, user, raw => validatePopulation(raw, fields));
  }

  async transcribeImages(images: string[], ctx: AssistantContext): Promise<string> {
    if (!images.length) throw new AssistantError('No page images were supplied.');

    const system =
      'You transcribe scanned military planning documents. Reproduce the text you can see, ' +
      'preserving paragraph numbering and headings. Do not summarise, interpret, or add ' +
      'commentary. If part of the page is illegible, write [illegible] rather than guessing. ' +
      'Output the transcription only.';

    const pages: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const prompt =
        images.length > 1
          ? `Transcribe page ${i + 1} of ${images.length} of this document.`
          : 'Transcribe the text in this document.';
      const text = (await this.completeVision(system, prompt, [images[i]])).trim();
      if (text) {
        pages.push(images.length > 1 ? `--- Page ${i + 1} ---\n${text}` : text);
      }
    }

    const joined = pages.join('\n\n').trim();
    if (!joined) {
      throw new AssistantError(
        'The vision model returned no text. The scan may be too low quality to read.'
      );
    }
    return joined;
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
