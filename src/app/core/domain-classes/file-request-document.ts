import { FileRequestDocumentStatus } from "./file-request-document-status.enum";

export class FileRequestDocument {
  id?: string;
  name?: string;
  url: string;
  fileRequestDocumentStatus: FileRequestDocumentStatus;
  fileRequestId: string;
  approvedRejectedDate: Date;
  approvedRejectedById: string;
  reason: string; 
  createdDate: Date;
}
