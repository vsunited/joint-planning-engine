import { IngestedDocument } from './types';

/** Plain text and markdown need no parser. */
export async function ingestText(file: File): Promise<Partial<IngestedDocument>> {
  const text = await file.text();
  return { text, charCount: text.length, status: 'parsed' };
}
