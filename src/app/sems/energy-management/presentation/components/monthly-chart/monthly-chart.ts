import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MonthlyComparison } from '../../../domain/model/entities/monthly-comparison.entity';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './monthly-chart.html',
  styleUrl: './monthly-chart.css'
})
export class MonthlyChart implements OnChanges {
  @Input() monthlyComparison?: MonthlyComparison;

  maxValue: number = 100;

  constructor(private translate: TranslateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyComparison'] && this.monthlyComparison) {
      this.calculateMaxValue();
    }
  }

  calculateMaxValue(): void {
    if (!this.monthlyComparison) return;

    const values = this.monthlyComparison.months.map(m => m.consumption);
    this.maxValue = Math.max(...values, 100);
  }

  getBarHeight(value: number): string {
    const percentage = (value / this.maxValue) * 100;
    return `${percentage}%`;
  }

  isCurrentMonth(month: string): boolean {
    return this.monthlyComparison?.currentMonth === month;
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  get monthlyComparisonLabel(): string {
    return this.translate.instant('dashboard.charts.monthlyComparison');
  }

  get comparisonLabel(): string {
    return this.translate.instant('dashboard.charts.comparison');
  }

  getMonthTranslation(monthAbbr: string): string {
    // Remove any trailing dots if present (e.g., "Jan.")
    const cleanAbbr = monthAbbr.replace('.', '');
    return this.translate.instant(`dashboard.months.${cleanAbbr}`);
  }
}
