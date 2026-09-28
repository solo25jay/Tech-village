export interface InitiatePaymentInput {
  amountKobo: number; // smallest currency unit
  currency: string;
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  provider: 'paystack' | 'flutterwave';
  authorizationUrl: string;
  reference: string;
}

/** Course/subscription/mentorship/event payments all go through this interface. */
export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(reference: string): Promise<{ success: boolean; amountKobo: number }>;
}
