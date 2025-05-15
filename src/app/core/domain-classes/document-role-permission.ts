import { Role } from "./role";

export class DocumentRolePermission {
    id?: string;
    documentId: string;
    roleId: string;
    startDate: Date;
    endDate: Date;
    role?: Role
}