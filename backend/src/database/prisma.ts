import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance. Repositories depend on this, never on
// `new PrismaClient()` scattered across the codebase.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
