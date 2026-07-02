import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardResource } from '../../../infrastructure/resources/dashboard.resource';
import { ReceiptValidationResponse } from '../../../infrastructure/response/dashboard.response';

/**
 * US21: Validar precisión de datos del EMS.
 * El usuario ingresa manualmente el monto de su recibo eléctrico real y lo compara
 * contra la factura estimada por la plataforma (consumo x tarifa referencial).
 */
@Component({
  selector: 'app-validate-consumption',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './validate-consumption.html',
  styleUrl: './validate-consumption.css'
})
export class ValidateConsumption {
  billAmount: number | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  result: ReceiptValidationResponse | null = null;

  constructor(
    private dashboardResource: DashboardResource,
    private cdr: ChangeDetectorRef
  ) {}

  submit(): void {
    if (this.billAmount === null || this.billAmount <= 0) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.result = null;

    this.dashboardResource.validateReceipt(this.billAmount).subscribe({
      next: (response) => {
        this.result = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error validating receipt', err);
        this.errorMessage = 'validateConsumption.error';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reset(): void {
    this.billAmount = null;
    this.result = null;
    this.errorMessage = null;
  }
}
