import { Category } from './category';
import { Client } from './client';
import { DocumentInfo } from './document-info';

export interface DocumentCategory {
  document: DocumentInfo;
  categories: Category[];
  clients: Client[];
}
