import { Injectable } from '@angular/core';
import { Payment } from '../../domain/model/entities/payment.entity';
import { CheckoutSession } from '../../domain/model/entities/checkout-session.entity';
import { PaymentResponse, CheckoutSessionResponse } from '../response/payment.response';

@Injectable({
  providedIn: 'root'
})
export class PaymentAssembler {
  toPaymentEntity(response: PaymentResponse): Payment {
    return Payment.fromJson(response);
  }

  toPaymentEntityList(responses: PaymentResponse[]): Payment[] {
    return responses.map(response => this.toPaymentEntity(response));
  }

  toCheckoutSessionEntity(response: CheckoutSessionResponse): CheckoutSession {
    return CheckoutSession.fromJson(response);
  }
}

