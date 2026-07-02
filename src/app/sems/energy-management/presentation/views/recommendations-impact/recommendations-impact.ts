import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportResource } from '../../../infrastructure/resources/report.resource';
import { CompareConsumptionResponse } from '../../../infrastructure/response/report.response';

type RangeOption = 'week' | 'month';

/**
 * US22: Medir impacto de recomendaciones personalizadas.
 * Usa el comparador de periodos ya existente (GET /reports/compare) como proxy del
 * impacto de las recomendaciones aplicadas: no hay hoy un registro de "recomendación
 * aplicada" para atribución directa, así que se compara el consumo total actual contra
 * el periodo inmediatamente anterior.
 */
@Component({
  selector: 'app-recommendations-impact',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recommendations-impact.html',
  styleUrl: './recommendations-impact.css'
})
export class RecommendationsImpact implements OnInit {
  range: RangeOption = 'week';
  isLoading = false;
  errorMessage: string | null = null;
  result: CompareConsumptionResponse | null = null;

  constructor(
    private reportResource: ReportResource,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onRangeChange(range: RangeOption): void {
    this.range = range;
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.result = null;

    const days = this.range === 'week' ? 7 : 30;
    const today = new Date();
    const currentEnd = this.toIso(today);
    const currentStart = this.toIso(this.addDays(today, -(days - 1)));
    const previousEnd = this.toIso(this.addDays(today, -days));
    const previousStart = this.toIso(this.addDays(today, -(2 * days - 1)));

    this.reportResource
      .getCompare(previousStart, previousEnd, currentStart, currentEnd)
      .subscribe({
        next: (response) => {
          this.result = response;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error comparing periods', err);
          this.errorMessage = 'recommendationsImpact.error';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // El backend calcula difference/percentageDifference como (period1 - period2).
  // Aquí period1 = periodo anterior y period2 = periodo actual, así que un valor
  // positivo significa que el consumo actual es menor que el anterior (reducción).
  get reduced(): boolean {
    return !!this.result && (this.result.percentageDifference ?? 0) > 0;
  }

  get reductionPct(): number {
    return this.result ? Math.abs(this.result.percentageDifference) : 0;
  }

  private toIso(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
