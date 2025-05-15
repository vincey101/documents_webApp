import { Client } from './client';
import { DocumentRolePermission } from './document-role-permission';
import { DocumentUserPermission } from './document-user-permission';
import { DocumentMetaData } from './documentMetaData';
import { DocumentVersion } from './documentVersion';

export interface DocumentInfo {
  id?: string;
  name?: string;
  url?: string;
  description?: string;
  createdDate?: Date;
  createdBy?: string;
  categoryId?: string;
  categoryName?: string;
  documentSource?: string;
  extension?: string;
  isVersion?: boolean;
  viewerType?: string;
  expiredDate?: Date;
  isAllowDownload?: boolean;
  documentVersions?: DocumentVersion[];
  documentMetaDatas?: DocumentMetaData[];
  documentRolePermissions?: DocumentRolePermission[];
  documentUserPermissions?: DocumentUserPermission[];
  fileData?: any;
  location?: string;
  deletedBy?: string;
  isIndexed?: boolean;
  isIndexable?: boolean;
  clientId?: string;
  client?: Client;
  statusId?: string;
  statusName?: string;
  updatedByName?: string;
  modifiedDate?: Date;
  companyName?: string;
}
