import { DocumentRolePermission } from "./document-role-permission";
import { DocumentUserPermission } from "./document-user-permission";
import { DocumentMetaData } from "./documentMetaData";
import { DocumentVersion } from "./documentVersion";

export class FileRequestDocumentApprove {
      id?: string;
      fileRequestId?: string;
      fileRequestDocumentId?: string;
      name?: string;
      url?: string;
      description?: string;
      createdDate?: Date;
      createdBy?: string;
      categoryId?: string;
      statusId?: string;
      documentStatus?: string;
      clientId?: string;
      client? : string;
      storageSettingId?: string;
      categoryName?: string;
      documentSource?: string;
      extension?: string;
      isVersion?: boolean;
      viewerType?: string;
      expiredDate?: Date;
      isAllowDownload?: boolean;
      documentVersions?: DocumentVersion[];
      documentMetaDatas?: DocumentMetaData[];
      documentUserPermissions?: DocumentUserPermission[];
      documentRolePermissions?: DocumentRolePermission[];
      files?: string;
      isAddedPageIndxing?: boolean;
      isIndexable?: boolean
      isMoreThan15MinutesFromLocal?: boolean;
      isSignatureExists?: boolean;
      signBy?: string;
      signByDate?: Date;
      documentNumber?: string;
  }
  