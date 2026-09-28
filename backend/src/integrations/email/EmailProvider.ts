export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  variables?: Record<string, string>;
}

/** Every email provider (SendGrid, Postmark, SES, console/dev) implements this. */
export interface EmailProvider {
  send(input: SendEmailInput): Promise<{ providerMessageId: string }>;
}
