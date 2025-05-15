export class EmailSMTPSetting {
  id?: string;
  host: string;
  userName: string;
  password: string;
  encryption: string;
  fromEmail: string;
  fromName: string;
  port: number;
  isDefault: boolean;
}
