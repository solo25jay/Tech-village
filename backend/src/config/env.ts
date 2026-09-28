import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL', 'postgresql://localhost:5432/tech_village'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Integration providers are named here but never imported directly by
  // business logic — see src/integrations/*. Swapping a provider means
  // changing these values and the provider factory, nothing else.
  emailProvider: process.env.EMAIL_PROVIDER ?? 'console', // console | sendgrid | postmark | ses
  meetingProviderDefault: process.env.MEETING_PROVIDER_DEFAULT ?? 'google_meet',
  paymentProvider: process.env.PAYMENT_PROVIDER ?? 'paystack', // paystack | flutterwave
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY,

  // Community access links — Tech Village never calls the Discord/Telegram
  // APIs directly; it just hands out these admin-configured invite links.
  discordGeneralUrl: process.env.DISCORD_GENERAL_URL ?? 'https://discord.gg/tech-village-general',
  discordProfessionalUrl: process.env.DISCORD_PROFESSIONAL_URL ?? 'https://discord.gg/tech-village-professional',
  telegramGeneralUrl: process.env.TELEGRAM_GENERAL_URL ?? 'https://t.me/tech_village_general',
};
