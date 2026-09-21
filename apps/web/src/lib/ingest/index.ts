import { IngestedDocument, IngestStatus, ProgressFn, supportedExtensions } from './types';

export type { IngestedDocument, IngestStatus, IngestProgress } from './types';
export { supportedExtensions, acceptAttribute, INGEST_LIMITS } from './types';

function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
}

/**
 * Reads a planner's document and returns its text.
 *
 * Dispatches on extension, then MIME as a fallback, because files arriving
 * from a share drive or email often have an empty or wrong MIME type. Every
 * parser is dynamically imported, so a format's cost is only paid when a file
 * of that type is actually opened.
 */
export async function ingestFile(
  file: File,
  onProgress?: ProgressFn
): Promise<IngestedDocument> {
  const base: IngestedDocument = {
    name: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream',
    ingestedAt: new Date().toISOString(),
    text: '',
    charCount: 0,
    status: 'unsupported',
  };

  const ext = extensionOf(file.name);
  const mime = (file.type || '').toLowerCase();

  try {
    onProgress?.({ stage: 'reading', detail: file.name });

    let result: Partial<IngestedDocument>;

    if (ext === '.txt' || ext === '.md' || mime.startsWith('text/')) {
      const { ingestText } = await import('./text');
      result = await ingestText(file);
    } else if (ext === '.pdf' || mime === 'application/pdf') {
      const { ingestPdf } = await import('./pdf');
      result = await ingestPdf(file, onProgress);
    } else if (
      ext === '.docx' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      onProgress?.({ stage: 'parsing', detail: 'Reading Word document' });
      const { ingestDocx } = await import('./docx');
      result = await ingestDocx(file);
    } else if (
      ext === '.pptx' ||
      mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      onProgress?.({ stage: 'parsing', detail: 'Reading slides' });
      const { ingestPptx } = await import('./pptx');
      result = await ingestPptx(file);
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext) || mime.startsWith('image/')) {
      onProgress?.({ stage: 'reading', detail: 'Loading image' });
      const { ingestImage } = await import('./image');
      result = await ingestImage(file);
    } else if (ext === '.doc' || ext === '.ppt') {
      result = {
        status: 'unsupported',
        detail:
          `${ext} is the legacy binary Office format. Re-save it as ` +
          `${ext === '.doc' ? '.docx' : '.pptx'} and upload again.`,
      };
    } else {
      result = {
        status: 'unsupported',
        detail: `Unsupported file type. Supported: ${supportedExtensions().join(', ')}`,
      };
    }

    onProgress?.({ stage: 'done' });
    return { ...base, ...result };
  } catch (err) {
    onProgress?.({ stage: 'done' });
    return {
      ...base,
      status: 'failed',
      detail: err instanceof Error ? err.message : 'The file could not be read.',
    };
  }
}

/** Human-readable label for a status badge. */
export function statusLabel(status: IngestStatus): string {
  switch (status) {
    case 'parsed':
      return 'PARSED';
    case 'vision_parsed':
      return 'TRANSCRIBED';
    case 'needs_vision':
      return 'NEEDS VISION';
    case 'unsupported':
      return 'UNSUPPORTED';
    case 'failed':
      return 'FAILED';
  }
}
