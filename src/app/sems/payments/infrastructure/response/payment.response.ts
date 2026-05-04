export interface CheckoutSessionResponse {
  id: string;
  url: string;
  amount: number;
}

export interface PaymentResponse {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentIntentId: string;
  description: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentResponse[];
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

