import { env } from '@config/env';
import type { PaymentProvider } from './PaymentProvider';
import { PaystackPaymentProvider } from './PaystackPaymentProvider';
import { FlutterwavePaymentProvider } from './FlutterwavePaymentProvider';
import { MockPaymentProvider } from './MockPaymentProvider';

export function createPaymentProvider(): PaymentProvider {
  if (env.paymentProvider === 'paystack' && env.paystackSecretKey) {
    return new PaystackPaymentProvider(env.paystackSecretKey);
  }
  if (env.paymentProvider === 'flutterwave' && env.flutterwaveSecretKey) {
    return new FlutterwavePaymentProvider(env.flutterwaveSecretKey);
  }
  // No API key configured — fall back to the mock so local dev still works.
  return new MockPaymentProvider();
}
