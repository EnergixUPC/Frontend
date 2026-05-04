import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import {
  CheckoutSessionResponse,
  PaymentResponse,
  PaymentHistoryResponse,
  PaymentIntentResponse
} from '../response/payment.response';
import {
  CreateCheckoutSessionRequest,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest
} from '../request/payment.request';

@Injectable({
  providedIn: 'root'
})
export class PaymentResource {
  private readonly baseUrl = environment.stripeapiurl;

  constructor(private readonly http: HttpClient) { }

  createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.baseUrl}/api/create-checkout-session`,
      request.toJson()
    );
  }

  getPaymentHistory(userId: string): Observable<PaymentHistoryResponse> {
    return this.http.get<PaymentHistoryResponse>(
      `${this.baseUrl}/api/payments/history/${userId}`
    );
  }

  getPaymentById(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${this.baseUrl}/api/payments/${paymentId}`
    );
  }

  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.baseUrl}/api/payments/create-intent`,
      request.toJson()
    );
  }

  confirmPayment(request: ConfirmPaymentRequest): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/payments/confirm`,
      request.toJson()
    );
  }
}

