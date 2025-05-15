import { FileType } from "./file-type.enum";

export class AllowFileExtension {
  id?: string;
  fileType: FileType;
  extensions: string;
}
