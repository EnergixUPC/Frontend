import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PaymentRepository } from '../../domain/model/repositories/payment.repository';
import { Payment } from '../../domain/model/entities/payment.entity';
import { CheckoutSession } from '../../domain/model/entities/checkout-session.entity';
import { PaymentResource } from '../resources/payment.resource';
import { PaymentAssembler } from '../assemblers/payment.assembler';
import {
  CreateCheckoutSessionRequest,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest
} from '../request/payment.request';

@Injectable({
  providedIn: 'root'
})
export class PaymentRepositoryImpl extends PaymentRepository {
  constructor(
    private readonly paymentResource: PaymentResource,
    private readonly paymentAssembler: PaymentAssembler
  ) {
    super();
  }

  createCheckoutSession(amount: number): Observable<CheckoutSession> {
    const request = new CreateCheckoutSessionRequest(amount);
    return this.paymentResource.createCheckoutSession(request).pipe(
      map(response => this.paymentAssembler.toCheckoutSessionEntity(response))
    );
  }

  getPaymentHistory(userId: string): Observable<Payment[]> {
    return this.paymentResource.getPaymentHistory(userId).pipe(
      map(response => this.paymentAssembler.toPaymentEntityList(response.payments))
    );
  }

  getPaymentById(paymentId: string): Observable<Payment> {
    return this.paymentResource.getPaymentById(paymentId).pipe(
      map(response => this.paymentAssembler.toPaymentEntity(response))
    );
  }

  createPaymentIntent(userId: string, amount: number, currency: string, description: string): Observable<any> {
    const request = new CreatePaymentIntentRequest(userId, amount, currency, description);
    return this.paymentResource.createPaymentIntent(request);
  }

  confirmPayment(paymentIntentId: string, userId: string): Observable<any> {
    const request = new ConfirmPaymentRequest(paymentIntentId, userId);
    return this.paymentResource.confirmPayment(request);
  }
}

