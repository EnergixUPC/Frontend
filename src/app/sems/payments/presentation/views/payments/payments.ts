import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../../../application/services/payment.service';
import { DashboardStore } from '../../../../energy-management/application/state/dashboard.store';
import { Payment } from '../../../domain/model/entities/payment.entity';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class Payments implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  loading = false;
  estimatedBill = 0;
  paymentHistory: Payment[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private dashboardStore: DashboardStore,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.paymentForm = this.fb.group({
      amount: [{ value: 0, disabled: false }, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Get estimated bill from dashboard
    this.dashboardStore.dashboardState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.stats) {
          this.estimatedBill = state.stats.estimatedBill;
          this.paymentForm.patchValue({ amount: this.estimatedBill });
        }
      });

    // Load payment history
    this.loadPaymentHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPaymentHistory(): void {
    const userStr = localStorage.getItem('sems_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.paymentService.getPaymentHistory(user.id).subscribe({
        next: (payments) => {
          this.paymentHistory = payments;
        },
        error: (error) => {
          console.error('Error loading payment history:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid && !this.loading) {
      this.loading = true;
      const amount = this.paymentForm.value.amount;

      // Convert amount to cents for Stripe (assuming the amount is in dollars)
      const amountInCents = Math.round(amount * 100);

      this.paymentService.createCheckoutSession(amountInCents).subscribe({
        next: (session) => {
          this.loading = false;
          this.showSuccess(this.translate.instant('payments.messages.redirecting'));

          // Automatically open the payment URL
          this.paymentService.openPaymentUrl(session.url);

          // Optionally reload payment history after a delay
          setTimeout(() => {
            this.loadPaymentHistory();
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating checkout session:', error);
          this.showError(this.translate.instant('payments.messages.error'));
        }
      });
    }
  }

  useEstimatedBill(): void {
    this.paymentForm.patchValue({ amount: this.estimatedBill });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, this.translate.instant('payments.messages.close'), {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, this.translate.instant('payments.messages.close'), {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  }
}

