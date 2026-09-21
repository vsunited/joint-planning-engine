/**
 * Field-level diffing.
 *
 * Every step's state flows through the eight setters on PlanningContext, so
 * diffing there instruments all seven steps at a single point rather than
 * touching each step component. Threading the steps through a context earlier
 * is what makes this cheap.
 *
 * Returns dotted paths and resulting lengths only — never values. See the note
 * on CUI in ./types.
 */

export interface FieldChange {
  path: string;
  /** Length of the new value: characters for a string, entries for an array. */
  len: number;
}

const MAX_DEPTH = 6;
const MAX_CHANGES = 40;

export function diffState(prev: unknown, next: unknown, root: string): FieldChange[] {
  const out: FieldChange[] = [];
  walk(prev, next, root, 0, out);
  return out;
}

function walk(
  a: unknown,
  b: unknown,
  path: string,
  depth: number,
  out: FieldChange[]
): void {
  if (a === b || out.length >= MAX_CHANGES || depth > MAX_DEPTH) return;

  if (Array.isArray(b)) {
    const prev = Array.isArray(a) ? a : [];
    /*
     * An add or a remove is the event worth recording. Walking into a shifted
     * array would otherwise report every index after the change as edited.
     */
    if (prev.length !== b.length) {
      out.push({ path, len: b.length });
      return;
    }
    b.forEach((item, i) => walk(prev[i], item, `${path}[${i}]`, depth + 1, out));
    return;
  }

  if (b && typeof b === 'object') {
    const prev = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
    Object.entries(b as Record<string, unknown>).forEach(([k, v]) =>
      walk(prev[k], v, path ? `${path}.${k}` : k, depth + 1, out)
    );
    return;
  }

  out.push({ path, len: measure(b) });
}

function measure(v: unknown): number {
  if (typeof v === 'string') return v.length;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return 1;
  return 0;
}
