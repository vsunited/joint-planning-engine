import { IngestedDocument, INGEST_LIMITS, ProgressFn } from './types';

/**
 * PDF ingestion.
 *
 * Two cases matter in practice. A PDF produced from Word carries a text layer
 * and extracts cleanly. A PDF that was printed and scanned carries only page
 * images and yields nothing — common for real orders, and the case that must
 * not fail silently. When no text is found the pages are rendered to images so
 * a vision model can transcribe them.
 */

let workerConfigured = false;

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerConfigured) {
    /*
     * Self-hosted worker. pdfjs otherwise reaches for a CDN build, which would
     * silently break the air gap — the app would appear to work anywhere with
     * internet and fail on a closed network.
     */
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerConfigured = true;
  }
  return pdfjs;
}

export async function ingestPdf(
  file: File,
  onProgress?: ProgressFn
): Promise<Partial<IngestedDocument>> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageCount = doc.numPages;

  const pages: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    onProgress?.({
      stage: 'parsing',
      fraction: i / pageCount,
      detail: `Reading page ${i} of ${pageCount}`,
    });
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => (item as { str?: string })?.str ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) pages.push(pageText);
  }

  const text = pages.join('\n\n').slice(0, INGEST_LIMITS.maxChars);

  /*
   * A handful of stray characters is not a text layer. Scanned PDFs often
   * carry a few glyphs from a header stamp or a form field, so require a
   * meaningful amount of text before calling it parsed.
   */
  const MIN_USEFUL_CHARS = 120;
  if (text.length >= MIN_USEFUL_CHARS) {
    return { text, charCount: text.length, status: 'parsed', pageCount };
  }

  // No usable text layer — render pages for a vision model.
  const renderCount = Math.min(pageCount, INGEST_LIMITS.maxVisionPages);
  const images: string[] = [];
  for (let i = 1; i <= renderCount; i++) {
    onProgress?.({
      stage: 'rendering',
      fraction: i / renderCount,
      detail: `Rendering page ${i} of ${renderCount} for transcription`,
    });
    images.push(await renderPage(doc, i));
  }

  const truncated = pageCount > renderCount;
  return {
    text: '',
    charCount: 0,
    status: 'needs_vision',
    pageCount,
    images,
    detail:
      `No text layer found across ${pageCount} page(s) — this looks like a scan. ` +
      `${renderCount} page(s) rendered for transcription` +
      (truncated ? `; the remaining ${pageCount - renderCount} were skipped.` : '.'),
  };
}

/** Renders one page to a PNG data URI. */
async function renderPage(
  doc: { getPage: (n: number) => Promise<any> },
  pageNumber: number
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: INGEST_LIMITS.visionScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  /*
   * pdfjs v6 takes `canvas`. The older `canvasContext` is legacy and, per its
   * own docs, requires `canvas` to be null when used — passing both produces a
   * render that never settles rather than an error.
   */
  const task = page.render({ canvas, viewport });

  /*
   * Guard against a render that hangs. A stalled promise here would leave the
   * upload spinning with nothing to show the planner.
   */
  await Promise.race([
    task.promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        try {
          task.cancel();
        } catch {
          /* cancelling a finished task is not interesting */
        }
        reject(new Error(`Timed out rendering page ${pageNumber}.`));
      }, 30000)
    ),
  ]);

  return canvas.toDataURL('image/png');
}
