import { env } from '@config/env';
import type { EmailProvider } from './EmailProvider';
import { ConsoleEmailProvider } from './ConsoleEmailProvider';

// Add real providers here as they're implemented (SendGridEmailProvider,
// PostmarkEmailProvider, SesEmailProvider). Nothing outside this file
// should know which provider is active.
export function createEmailProvider(): EmailProvider {
  switch (env.emailProvider) {
    case 'console':
    default:
      return new ConsoleEmailProvider();
  }
}
