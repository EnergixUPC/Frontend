import { Provider } from '@angular/core';
import { PaymentRepository } from '../../domain/model/repositories/payment.repository';
import { PaymentRepositoryImpl } from './payment-repository.impl';

export const PAYMENT_REPOSITORY_PROVIDER: Provider = {
  provide: PaymentRepository,
  useClass: PaymentRepositoryImpl
};

