import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { PaymentRepositoryImpl } from '../../infrastructure/repositories/payment-repository.impl';
import { CheckoutSession } from '../../domain/model/entities/checkout-session.entity';
import { Payment } from '../../domain/model/entities/payment.entity';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepositoryImpl
  ) { }

  createCheckoutSession(amount: number): Observable<CheckoutSession> {
    console.log('Creating checkout session for amount:', amount);
    return this.paymentRepository.createCheckoutSession(amount).pipe(
      tap(session => {
        console.log('Checkout session created:', session);
      }),
      catchError(error => {
        console.error('Error creating checkout session:', error);
        throw error;
      })
    );
  }

  getPaymentHistory(userId: string): Observable<Payment[]> {
    console.log('Fetching payment history for user:', userId);
    return this.paymentRepository.getPaymentHistory(userId).pipe(
      tap(payments => {
        console.log('Payment history loaded:', payments);
      }),
      catchError(error => {
        console.error('Error loading payment history:', error);
        throw error;
      })
    );
  }

  getPaymentById(paymentId: string): Observable<Payment> {
    return this.paymentRepository.getPaymentById(paymentId).pipe(
      catchError(error => {
        console.error('Error loading payment:', error);
        throw error;
      })
    );
  }

  createPaymentIntent(userId: string, amount: number, currency: string, description: string): Observable<any> {
    return this.paymentRepository.createPaymentIntent(userId, amount, currency, description).pipe(
      catchError(error => {
        console.error('Error creating payment intent:', error);
        throw error;
      })
    );
  }

  confirmPayment(paymentIntentId: string, userId: string): Observable<any> {
    return this.paymentRepository.confirmPayment(paymentIntentId, userId).pipe(
      catchError(error => {
        console.error('Error confirming payment:', error);
        throw error;
      })
    );
  }

  openPaymentUrl(url: string): void {
    window.open(url, '_blank');
  }
}

