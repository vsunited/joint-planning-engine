import { IngestedDocument } from './types';

/**
 * PowerPoint has no mainstream browser parser, but a .pptx is a zip of XML.
 * Slide text lives in <a:t> nodes inside ppt/slides/slideN.xml, so unzip and
 * read them in slide order.
 */
export async function ingestPptx(file: File): Promise<Partial<IngestedDocument>> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideNames = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const num = (s: string) => parseInt(s.match(/slide(\d+)\.xml$/)?.[1] || '0', 10);
      return num(a) - num(b);
    });

  if (!slideNames.length) {
    return {
      text: '',
      charCount: 0,
      status: 'failed',
      detail: 'No slides were found in the presentation.',
    };
  }

  const parts: string[] = [];
  for (let i = 0; i < slideNames.length; i++) {
    const xml = await zip.files[slideNames[i]].async('string');
    // <a:t> holds the rendered text of each run.
    const runs = Array.from(xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)).map(m =>
      m[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
    );
    const slideText = runs.join(' ').replace(/\s+/g, ' ').trim();
    if (slideText) parts.push(`--- Slide ${i + 1} ---\n${slideText}`);
  }

  const text = parts.join('\n\n');
  if (!text) {
    return {
      text: '',
      charCount: 0,
      status: 'needs_vision',
      detail:
        `${slideNames.length} slide(s) found but no text — the slides are probably images. ` +
        'A vision model can transcribe them.',
    };
  }
  return { text, charCount: text.length, status: 'parsed', pageCount: slideNames.length };
}
