import { User } from "./user";

export class DocumentUserPermission {
    id?: string;
    documentId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    user?: User
}