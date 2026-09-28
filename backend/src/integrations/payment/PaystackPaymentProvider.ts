import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from './PaymentProvider';

/**
 * Real Paystack integration. Requires PAYSTACK_SECRET_KEY. Uses the
 * standard fetch API against Paystack's REST endpoints — no SDK dependency,
 * consistent with the rest of the integrations layer.
 */
export class PaystackPaymentProvider implements PaymentProvider {
  constructor(private readonly secretKey: string) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: input.currency,
        reference: input.reference,
        metadata: input.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Paystack initialize failed: ${response.status}`);
    }

    const data = (await response.json()) as { data: { authorization_url: string; reference: string } };

    return {
      provider: 'paystack',
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  }

  async verify(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });

    if (!response.ok) {
      throw new Error(`Paystack verify failed: ${response.status}`);
    }

    const data = (await response.json()) as { data: { status: string; amount: number } };

    return { success: data.data.status === 'success', amountKobo: data.data.amount };
  }
}
