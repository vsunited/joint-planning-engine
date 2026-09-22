import { AssistantError, ExtractedTask, DraftedCoa, CoaCritique, CritiqueVerdict } from './types';
import { COA_VALIDITY_CRITERIA } from '@jpe/shared';
import type { FieldSpec, PopulatedField } from './types';

/**
 * Parsing and validation for model output.
 *
 * Small local models are inconsistent about JSON — they wrap it in prose, fence
 * it, or emit a near-miss shape. Rather than depend on a strict-schema feature
 * only some runtimes support, output is parsed and validated here, and the
 * caller is given a precise complaint it can send back as a repair request.
 */

/** Pulls a JSON object out of a response that may be fenced or padded. */
export function extractJson(raw: string): unknown {
  const text = (raw || '').trim();
  if (!text) throw new AssistantError('The model returned an empty response.');

  const candidates: string[] = [];

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidates.push(fence[1]);

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));

  candidates.push(text);

  for (const c of candidates) {
    try {
      return JSON.parse(c.trim());
    } catch {
      // try the next candidate
    }
  }
  throw new AssistantError('The model did not return valid JSON.');
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Normalises an object's keys so decorated variants still match.
 *
 * Models frequently echo prompt formatting into the key itself — "01. who" or
 * "[who]" rather than "who" — which is a presentation quirk, not a refusal.
 * Stripping leading numbering and punctuation recovers otherwise good output.
 */
function normaliseKeys(src: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.entries(src || {}).forEach(([k, v]) => {
    const clean = k
      .replace(/^[\s\d]*[.)\-:]?\s*/, '')
      .replace(/[\[\]"']/g, '')
      .trim();
    if (clean && !(clean in out)) out[clean] = v;
    out[k] = out[k] ?? v;
  });
  return out;
}

/** Validation failure carrying a message suitable for a repair prompt. */
export class ShapeError extends Error {}

export function validateTasks(data: unknown): ExtractedTask[] {
  const root = data as Record<string, unknown>;
  const list = Array.isArray(root?.tasks) ? root.tasks : Array.isArray(data) ? data : null;
  if (!list) throw new ShapeError('Expected an object with a "tasks" array.');

  const tasks: ExtractedTask[] = [];
  list.forEach((item: unknown) => {
    const t = item as Record<string, unknown>;
    const description = str(t?.description);
    if (!description) return;
    const cls = str(t?.classification).toLowerCase();
    tasks.push({
      description,
      classification: cls === 'specified' ? 'specified' : 'implied',
      isEssential: t?.isEssential === true,
      source: str(t?.source),
      rationale: str(t?.rationale),
    });
  });

  if (!tasks.length) {
    throw new ShapeError('No tasks had a non-empty "description" field.');
  }

  /*
   * Deduplicate deterministically rather than trusting the instruction.
   * Small local models routinely emit the same task twice — once as specified
   * and again as implied — however firmly the prompt forbids it. Observed
   * repeatedly with 3B-class models during testing.
   *
   * Specified beats implied for the same task: an explicitly assigned task is
   * not also a deduced one. Essential survives either way.
   */
  const byText = new Map<string, ExtractedTask>();
  tasks.forEach(t => {
    const key = t.description.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const existing = byText.get(key);
    if (!existing) {
      byText.set(key, t);
      return;
    }
    byText.set(key, {
      ...existing,
      classification:
        existing.classification === 'specified' || t.classification === 'specified'
          ? 'specified'
          : 'implied',
      isEssential: existing.isEssential || t.isEssential,
      source: existing.source || t.source,
      rationale: existing.rationale || t.rationale,
    });
  });

  return Array.from(byText.values());
}

export function validateDraftedCoa(data: unknown): DraftedCoa {
  const d = data as Record<string, any>;
  if (!d || typeof d !== 'object') throw new ShapeError('Expected a JSON object.');

  const statementKeys = [
    'who', 'what', 'where', 'when', 'decisionPoints',
    'how', 'why', 'assessment', 'intelConcept',
  ] as const;
  const conopsKeys = [
    'operationalArea', 'objectives', 'essentialTasks', 'forcesCapabilities',
    'integratedTimeline', 'taskOrganization', 'operationalConcept',
    'sustainmentConcept', 'commSync', 'risk', 'requiredDecisions',
    'deploymentConcept', 'mainSupportingEfforts',
  ] as const;

  const statementSrc = normaliseKeys((d.statement || {}) as Record<string, unknown>);
  const conopsSrc = normaliseKeys((d.conops || {}) as Record<string, unknown>);
  const distSrc = normaliseKeys((d.distinguishability || {}) as Record<string, unknown>);

  const filledStatement = statementKeys.filter(k => str(statementSrc[k])).length;
  if (filledStatement === 0) {
    throw new ShapeError(
      'The "statement" object was missing or empty. It must answer all nine questions.'
    );
  }

  const statement = {} as DraftedCoa['statement'];
  statementKeys.forEach(k => { statement[k] = str(statementSrc[k]); });

  const conops = {} as DraftedCoa['conops'];
  conopsKeys.forEach(k => { conops[k] = str(conopsSrc[k]); });

  const seq = str(distSrc.sequencing).toLowerCase();
  return {
    name: str(d.name),
    narrative: str(d.narrative),
    statement,
    conops,
    distinguishability: {
      mainEffort: str(distSrc.mainEffort),
      scheme: str(distSrc.scheme),
      sequencing:
        seq === 'sequential' ? 'sequential' : seq === 'combination' ? 'combination' : 'simultaneous',
      mechanism: str(distSrc.mechanism),
      taskOrg: str(distSrc.taskOrg),
      reserves: str(distSrc.reserves),
    },
  };
}

export function validateCritique(data: unknown): CoaCritique {
  const d = data as Record<string, any>;
  if (!d || typeof d !== 'object') throw new ShapeError('Expected a JSON object.');

  const keys = COA_VALIDITY_CRITERIA.map(c => c.key);
  const missing = keys.filter(k => !d[k] || typeof d[k] !== 'object');
  if (missing.length) {
    throw new ShapeError(
      `Missing a verdict object for: ${missing.join(', ')}. All five criteria are required.`
    );
  }

  const verdict = (src: Record<string, unknown>): CritiqueVerdict => ({
    status: str(src.status).toLowerCase() === 'fail' ? 'fail' : 'pass',
    rationale: str(src.rationale),
    failedSubTests: Array.isArray(src.failedSubTests)
      ? (src.failedSubTests as unknown[]).map(str).filter(Boolean)
      : [],
  });

  return {
    suitable: verdict(d.suitable),
    feasible: verdict(d.feasible),
    acceptable: verdict(d.acceptable),
    distinguishable: verdict(d.distinguishable),
    complete: verdict(d.complete),
    overall: str(d.overall),
  };
}


/**
 * Validates a population response against the fields that were asked for.
 *
 * Fields the model omitted are dropped rather than invented, and fields it
 * volunteered that nobody asked for are discarded — an 8B model will cheerfully
 * add a key it thinks belongs, and a planner reviewing a worksheet should not
 * have to work out which boxes were real.
 */
export function validatePopulation(raw: unknown, fields: FieldSpec[]): PopulatedField[] {
  const obj = normaliseKeys((raw as Record<string, unknown>) ?? {});
  const inner = (obj.fields ?? obj.result ?? obj) as Record<string, unknown>;
  const src = normaliseKeys(inner ?? {});

  const out: PopulatedField[] = [];
  fields.forEach(spec => {
    const entry = src[spec.key];
    if (entry === undefined || entry === null) return;

    /* The model may answer with a bare value or with {value, evidence}. */
    const bag = (
      typeof entry === 'object' && !Array.isArray(entry) ? normaliseKeys(entry as Record<string, unknown>) : { value: entry }
    ) as Record<string, unknown>;

    const rawValue = bag.value ?? entry;
    const evidence = typeof bag.evidence === 'string' ? bag.evidence.trim() : '';

    if (spec.kind === 'list') {
      const list = (Array.isArray(rawValue) ? rawValue : String(rawValue ?? '').split(/\n+/))
        .map(v => (typeof v === 'string' ? v : String((v as { description?: string })?.description ?? '')))
        .map(v => v.replace(/^[-*\u2022\s]*(?:\d+[.)]\s*)?/, '').trim())
        .filter(Boolean);
      if (list.length) out.push({ key: spec.key, value: list, evidence });
      return;
    }

    /*
     * A model asked for prose will sometimes answer with an array anyway —
     * forces allocated and command relationships both read naturally as lists.
     * Joining on a space welds the entries into one run-on sentence
     * ("...for strikes CDR CJTF-SEA retains OPCON..."), so they are kept as
     * separate lines, which reads correctly both on screen and in an export.
     */
    const text = Array.isArray(rawValue)
      ? rawValue.map(v => String(v ?? '').trim()).filter(Boolean).join('\n')
      : String(rawValue ?? '').trim();
    if (text) out.push({ key: spec.key, value: text, evidence });
  });

  return out;
}
