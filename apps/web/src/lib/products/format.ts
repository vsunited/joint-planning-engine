import { OperationalScenario } from '@/types/scenario';

/** Placeholder for anything the staff has not recorded yet. */
export const NOT_RECORDED = '— not recorded —';

/** Returns `value` if it has content, otherwise the placeholder. */
export function orNone(value: string | undefined | null): string {
  const v = (value || '').trim();
  return v || NOT_RECORDED;
}

export function h1(text: string): string {
  return `# ${text}`;
}

export function h2(text: string): string {
  return `## ${text}`;
}

export function h3(text: string): string {
  return `### ${text}`;
}

/** `**Label:** value` on one line. */
export function kv(label: string, value: string | undefined | null): string {
  return `**${label}:** ${orNone(value)}`;
}

/** A bullet list, or the placeholder when empty. */
export function bullets(items: (string | undefined | null)[]): string {
  const clean = items.map(i => (i || '').trim()).filter(Boolean);
  if (!clean.length) return NOT_RECORDED;
  return clean.map(i => `- ${i}`).join('\n');
}

/** A numbered list, or the placeholder when empty. */
export function numbered(items: (string | undefined | null)[]): string {
  const clean = items.map(i => (i || '').trim()).filter(Boolean);
  if (!clean.length) return NOT_RECORDED;
  return clean.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
}

/** A markdown table, or the placeholder when there are no rows. */
export function table(headers: string[], rows: string[][]): string {
  if (!rows.length) return NOT_RECORDED;
  const esc = (c: string) => (c || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.map(esc).join(' | ')} |`),
  ].join('\n');
}

/** A titled block. Omitted entirely when `body` is empty. */
export function section(title: string, body: string): string {
  return `${h2(title)}\n\n${body.trim() || NOT_RECORDED}`;
}

/** Joins blocks with blank lines between them. */
export function blocks(...parts: (string | null | undefined)[]): string {
  return parts.map(p => (p || '').trim()).filter(Boolean).join('\n\n');
}

/**
 * Wraps a product in its classification marking. Staff products carry the
 * marking top and bottom, so text pasted elsewhere keeps it.
 */
export function classified(
  scenario: OperationalScenario,
  title: string,
  doctrineRef: string,
  body: string
): string {
  const mark = scenario.classification;
  const header = [
    mark,
    '',
    h1(title),
    '',
    kv('Operation', scenario.operationName),
    kv('Headquarters', `${scenario.jtfName} (${scenario.higherHq})`),
    kv('Operational area', scenario.aorRegion),
    kv('Prepared by', `${scenario.commandingOfficer}, ${scenario.officerRole}`),
    kv('Doctrinal reference', doctrineRef),
    kv('Generated', new Date().toISOString().replace('T', ' ').slice(0, 16) + 'Z'),
    '',
    '---',
  ].join('\n');

  return `${header}\n\n${body.trim()}\n\n---\n\n${mark}\n`;
}

/** Percentage-style progress line, e.g. "4 of 9 complete". */
export function progress(done: number, total: number, noun = 'complete'): string {
  return `${done} of ${total} ${noun}`;
}
