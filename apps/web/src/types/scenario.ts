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
  uploadedDocuments: Array<{
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }>;
}
