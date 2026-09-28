import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProvider } from './PaymentProvider';

/** Real Flutterwave integration. Requires FLUTTERWAVE_SECRET_KEY. */
export class FlutterwavePaymentProvider implements PaymentProvider {
  constructor(private readonly secretKey: string) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: input.amountKobo / 100,
        currency: input.currency,
        customer: { email: input.email },
        meta: input.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Flutterwave initialize failed: ${response.status}`);
    }

    const data = (await response.json()) as { data: { link: string } };

    return {
      provider: 'flutterwave',
      authorizationUrl: data.data.link,
      reference: input.reference,
    };
  }

  async verify(reference: string) {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );

    if (!response.ok) {
      throw new Error(`Flutterwave verify failed: ${response.status}`);
    }

    const data = (await response.json()) as { data: { status: string; amount: number } };

    return { success: data.data.status === 'successful', amountKobo: Math.round(data.data.amount * 100) };
  }
}
