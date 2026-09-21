/**
 * Document ingestion types.
 *
 * Everything runs in the browser. The app is a static export and the air gap
 * rules out cloud parsing or OCR, so each format is handled by a client-side
 * parser loaded on demand.
 */

export type IngestStatus =
  /** Text was extracted directly from the file. */
  | 'parsed'
  /** No text layer; page images are ready for a vision model. */
  | 'needs_vision'
  /** Text was recovered by transcribing images with a vision model. */
  | 'vision_parsed'
  /** Format not supported. */
  | 'unsupported'
  /** Parsing threw. */
  | 'failed';

export interface IngestedDocument {
  name: string;
  /** Bytes. */
  size: number;
  mime: string;
  ingestedAt: string;
  text: string;
  charCount: number;
  status: IngestStatus;
  pageCount?: number;
  /** Plain explanation, shown to the planner when something needs saying. */
  detail?: string;
  /**
   * Page images as data URIs. Populated only when the document carries no
   * text layer, so a vision model can transcribe it.
   */
  images?: string[];
}

export interface IngestProgress {
  stage: 'reading' | 'parsing' | 'rendering' | 'transcribing' | 'done';
  /** 0-1 where known. */
  fraction?: number;
  detail?: string;
}

export type ProgressFn = (p: IngestProgress) => void;

/** Caps to keep a huge upload from locking the tab or the model. */
export const INGEST_LIMITS = {
  /** Pages rendered for vision. A whole scanned OPLAN would take hours. */
  maxVisionPages: 8,
  /** Rendering scale for vision. Legible to a model without being enormous. */
  visionScale: 2.0,
  /** Characters kept from a single document. */
  maxChars: 200000,
};

export function supportedExtensions(): string[] {
  return ['.txt', '.md', '.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg', '.webp'];
}

export function acceptAttribute(): string {
  return supportedExtensions().join(',');
}
