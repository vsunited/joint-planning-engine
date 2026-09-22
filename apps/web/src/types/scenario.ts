import type { DocumentRole } from '@jpe/shared';
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

  /**
   * What the order's own header says, read on ingest.
   *
   * A planner legitimately uploads plans from other commands — an analogue, an
   * adjacent unit's order, a plan they are writing a supporting plan against.
   * Recording who issued each document and who it was addressed to is what
   * separates those from the one order that actually tasks this staff, instead
   * of treating every one of them as a mismatch.
   */
  issuer?: string;
  addressee?: string;
  /** The header line the above was read from, shown to the planner. */
  headerEvidence?: string;
  /**
   * Whether this is the order that tasks this staff.
   *
   * Exactly one document can be the directive. Only the directive can create
   * specified tasks; everything else can inform the plan but not task it.
   */
  role?: DocumentRole;
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
