import crypto from 'crypto';
import { ApiError } from '@common/ApiError';
import { paymentsRepository } from './payments.repository';
import { createPaymentProvider } from '@integrations/payment/paymentProviderFactory';
import { prisma } from '@database/prisma';

const paymentProvider = createPaymentProvider();

function generateReference() {
  return `TV-PAY-${crypto.randomBytes(8).toString('hex')}`;
}

export const paymentsService = {
  async initiate(
    userId: string,
    input: { purpose: string; referenceId?: string; amountKobo: number; currency?: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const reference = generateReference();
    const currency = input.currency ?? 'NGN';

    // The service only ever talks to the PaymentProvider interface — which
    // gateway actually runs (Paystack, Flutterwave, or the dev mock) is
    // decided once, in paymentProviderFactory, based on env config.
    const result = await paymentProvider.initiate({
      amountKobo: input.amountKobo,
      currency,
      email: user.email,
      reference,
      metadata: { userId, purpose: input.purpose, referenceId: input.referenceId },
    });

    await paymentsRepository.create({
      userId,
      purpose: input.purpose,
      referenceId: input.referenceId,
      amountKobo: input.amountKobo,
      currency,
      provider: result.provider,
      providerReference: result.reference,
    });

    return { authorizationUrl: result.authorizationUrl, reference: result.reference };
  },

  async verify(reference: string) {
    const payment = await paymentsRepository.findByReference(reference);
    if (!payment) throw ApiError.notFound('Payment not found');

    const result = await paymentProvider.verify(reference);
    const status = result.success ? 'SUCCESS' : 'FAILED';
    await paymentsRepository.updateStatus(reference, status);

    return { status, amountKobo: result.amountKobo };
  },

  listMyPayments(userId: string) {
    return paymentsRepository.listForUser(userId);
  },

  listAll() {
    return paymentsRepository.listAll();
  },

  async getRevenueSummary() {
    const result = await paymentsRepository.sumSuccessfulRevenue();
    return { totalRevenueKobo: result._sum.amountKobo ?? 0 };
  },
};
