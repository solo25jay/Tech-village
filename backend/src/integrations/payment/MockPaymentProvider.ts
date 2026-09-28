import { randomUUID } from 'crypto';
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from './PaymentProvider';

/**
 * Dev-only provider: "succeeds" instantly without calling a real gateway.
 * The authorizationUrl points at a note explaining this is a mock — swap
 * PAYMENT_PROVIDER to paystack/flutterwave with real keys for production.
 */
export class MockPaymentProvider implements PaymentProvider {
  private readonly succeeded = new Set<string>();

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    this.succeeded.add(input.reference);
    return {
      provider: 'paystack',
      authorizationUrl: `about:blank#mock-payment-${randomUUID()}`,
      reference: input.reference,
    };
  }

  async verify(reference: string) {
    return { success: this.succeeded.has(reference) || true, amountKobo: 0 };
  }
}
