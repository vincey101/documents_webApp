import { Role } from "./role";
import { User } from "./user";

export class DocumentPermission {
    id?: string;
    documentId: string;
    userId?: string;
    roleId?: string;
    startDate: Date;
    endDate: Date;
    user?: User;
    role?: Role;
    type:string;
}