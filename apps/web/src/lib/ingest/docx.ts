import { IngestedDocument } from './types';

/**
 * Word documents via mammoth, which walks the document XML and returns text.
 * Imported dynamically so it stays out of the initial bundle.
 */
export async function ingestDocx(file: File): Promise<Partial<IngestedDocument>> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = (result.value || '').trim();
  if (!text) {
    return {
      text: '',
      charCount: 0,
      status: 'failed',
      detail: 'The document contained no extractable text.',
    };
  }
  return { text, charCount: text.length, status: 'parsed' };
}
