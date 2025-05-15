export interface DocumentView {
  documentId: string;
  extension: string;
  name: string;
  isVersion: boolean;
  isFromPublicPreview: boolean;
  isPreviewDownloadEnabled: boolean;
  linkPassword?: string;
  id?: string;
  isFromFileRequest: boolean;
}
