export class FileRequest {
  id?: string;
  subject: string;
  email?: string;
  maxDocument: number;
  sizeInMb: number;
  linkExpiryTime?: Date;
  password: string;
  isLinkExpired?: boolean;
  hasPassword?: boolean;
  fileExtension?: number[];
  baseUrl: string;
}
