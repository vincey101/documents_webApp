export interface DocumentVersion {
  id?: string;
  documentId?: string;
  url?: string;
  createdByUser?: string;
  isCurrentVersion?: boolean;
  fileData?: any;
  extension?: string;
  modifiedDate?: Date;
  location?: string;
}
