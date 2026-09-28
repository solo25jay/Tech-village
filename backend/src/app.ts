import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@config/env';
import { authRouter } from '@modules/auth/auth.routes';
import { usersRouter } from '@modules/users/users.routes';
import { learningRouter } from '@modules/learning/learning.routes';
import { adminLearningRouter } from '@modules/learning/admin-learning.routes';
import { productivityRouter } from '@modules/productivity/productivity.routes';
import { mentorshipRouter } from '@modules/mentorship/mentorship.routes';
import { mentorRouter } from '@modules/mentorship/mentor.routes';
import { adminMentorshipRouter } from '@modules/mentorship/admin-mentorship.routes';
import { eventsRouter } from '@modules/events/events.routes';
import { hostEventsRouter } from '@modules/events/host-events.routes';
import { communityRouter } from '@modules/community/community.routes';
import { adminCommunityRouter } from '@modules/community/admin-community.routes';
import { credentialsRouter } from '@modules/credentials/credentials.routes';
import { adminCredentialsRouter } from '@modules/credentials/admin-credentials.routes';
import { publicCredentialsRouter } from '@modules/credentials/public-credentials.routes';
import { jobsRouter } from '@modules/jobs/jobs.routes';
import { companyRouter } from '@modules/jobs/company.routes';
import { paymentsRouter } from '@modules/payments/payments.routes';
import { adminPaymentsRouter } from '@modules/payments/admin-payments.routes';
import { adminUsersRouter } from '@modules/admin-users/admin-users.routes';
import { auditRouter } from '@modules/audit/audit.routes';
import { emailsRouter } from '@modules/emails/emails.routes';
import { reportsRouter } from '@modules/reports/reports.routes';
import { settingsRouter } from '@modules/settings/settings.routes';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Modules are mounted under /api/v1 so future breaking changes can live
  // at /api/v2 without disturbing the current frontend.
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/learning', learningRouter);
  app.use('/api/v1/admin/learning', adminLearningRouter);
  app.use('/api/v1/productivity', productivityRouter);
  app.use('/api/v1/mentorship', mentorshipRouter);
  app.use('/api/v1/mentor', mentorRouter);
  app.use('/api/v1/admin/mentors', adminMentorshipRouter);
  app.use('/api/v1/events', eventsRouter);
  app.use('/api/v1/host/events', hostEventsRouter);
  app.use('/api/v1/community', communityRouter);
  app.use('/api/v1/admin/community', adminCommunityRouter);
  app.use('/api/v1/credentials', credentialsRouter);
  app.use('/api/v1/admin/credentials', adminCredentialsRouter);
  // Public — no auth. Certificate verification is meant to be checkable by
  // anyone (employers, etc.), per spec section 26.
  app.use('/api/v1/public', publicCredentialsRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/company', companyRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/admin/payments', adminPaymentsRouter);
  app.use('/api/v1/admin/users', adminUsersRouter);
  app.use('/api/v1/admin/audit-logs', auditRouter);
  app.use('/api/v1/admin/emails', emailsRouter);
  app.use('/api/v1/admin/reports', reportsRouter);
  app.use('/api/v1/admin/settings', settingsRouter);
  // Future modules mount the same way:
  // app.use('/api/v1/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
