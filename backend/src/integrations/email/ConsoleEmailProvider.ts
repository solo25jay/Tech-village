import { randomUUID } from 'crypto';
import type { EmailProvider, SendEmailInput } from './EmailProvider';
import { logger } from '@config/logger';

/** Dev-only provider that logs instead of sending. Replace via emailProviderFactory. */
export class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput) {
    logger.info({ to: input.to, subject: input.subject }, 'Email (console provider)');
    return { providerMessageId: randomUUID() };
  }
}
