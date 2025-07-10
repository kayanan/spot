export interface EmailModel {
  to: string;
  from?: string;
  subject: string;
  html?: string;
}
