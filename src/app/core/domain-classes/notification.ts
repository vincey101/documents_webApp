import { DocumentInfo } from './document-info';

export class UserNotification {
    id?: string;
    userId?: string;
    message: string;
    createdDate: Date;
    documentName?: string;
    documentId?: string;
    isRead:boolean;
    document?: DocumentInfo
}
