import type { IngestStatus } from '@/lib/ingest';

/**
 * A document a planner has uploaded.
 *
 * Carries the extracted text, not just display metadata, so an order uploaded
 * once in scenario setup can be reused by the Step 2 task extractor without
 * being uploaded again — and so the status badge reflects what actually
 * happened to the file.
 */
export interface UploadedDocument {
  name: string;
  /** Human-readable size, e.g. "4.20 MB". */
  size: string;
  type: string;
  uploadedAt: string;
  /** Extracted text. Empty when the document still needs transcription. */
  text: string;
  charCount: number;
  status: IngestStatus;
  pageCount?: number;
  detail?: string;
  /** Page images awaiting transcription, as data URIs. */
  images?: string[];
}

export interface OperationalScenario {
  jtfName: string;
  operationName: string;
  commandingOfficer: string;
  officerRole: string;
  serviceBranch: string;
  operationalEchelon: string;
  higherHq: string;
  aorRegion: string;
  classification: 'UNCLASSIFIED' | 'CUI';
  uploadedDocuments: UploadedDocument[];
}
