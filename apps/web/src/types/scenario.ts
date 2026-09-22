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

/**
 * What is being planned, as distinct from who is planning it.
 *
 * The headquarters, its level and the command that established it are fixed
 * per installation and live in the planning echelon, not here — see
 * `@/lib/echelon`. A scenario changes between operations; the staff does not.
 */
export interface OperationalScenario {
  operationName: string;
  commandingOfficer: string;
  officerRole: string;
  serviceBranch: string;
  aorRegion: string;
  classification: 'UNCLASSIFIED' | 'CUI';
  uploadedDocuments: UploadedDocument[];
}
