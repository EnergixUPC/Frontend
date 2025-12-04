import { Observable } from 'rxjs';
import { Payment } from '../entities/payment.entity';
import { CheckoutSession } from '../entities/checkout-session.entity';

export abstract class PaymentRepository {
  abstract createCheckoutSession(amount: number): Observable<CheckoutSession>;
  abstract getPaymentHistory(userId: string): Observable<Payment[]>;
  abstract getPaymentById(paymentId: string): Observable<Payment>;
  abstract createPaymentIntent(userId: string, amount: number, currency: string, description: string): Observable<any>;
  abstract confirmPayment(paymentIntentId: string, userId: string): Observable<any>;
}

