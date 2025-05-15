import { FileRequestStatus } from './file-request.enum';
import { FileRequestDocument } from './file-request-document';
export class FileRequestInfo {
    id?: string;
    subject: string;
    email?: string;
    maxDocument: number;
    sizeInMb: number;
    linkExpiryTime?: Date;
    password: string;
    isLinkExpired?: boolean;
    hasPassword?: boolean;
    allowExtension?: string;
    fileRequestStatus: FileRequestStatus;
    createdDate: Date;
    createdByName: string;
    fileRequestDocuments: FileRequestDocument[];
  }
  