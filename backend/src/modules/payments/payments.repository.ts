import { prisma } from '@database/prisma';

export const paymentsRepository = {
  create(data: {
    userId: string;
    purpose: string;
    referenceId?: string;
    amountKobo: number;
    currency: string;
    provider: string;
    providerReference: string;
  }) {
    return prisma.payment.create({ data: data as any });
  },

  findByReference(providerReference: string) {
    return prisma.payment.findUnique({ where: { providerReference } });
  },

  updateStatus(providerReference: string, status: 'SUCCESS' | 'FAILED') {
    return prisma.payment.update({ where: { providerReference }, data: { status } });
  },

  listForUser(userId: string) {
    return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  listAll() {
    return prisma.payment.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  sumSuccessfulRevenue() {
    return prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amountKobo: true },
    });
  },
};
