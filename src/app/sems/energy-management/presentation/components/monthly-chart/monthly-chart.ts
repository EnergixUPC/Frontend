import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MonthlyComparison, MonthlyData } from '../../../domain/model/entities/monthly-comparison.entity';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './monthly-chart.html',
  styleUrl: './monthly-chart.css'
})
export class MonthlyChart implements OnInit, OnChanges {
  @Input() monthlyComparison?: MonthlyComparison;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    datasets: [{
      data: [],
      label: '',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: []
    }],
    labels: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            // FIX: Validate that value is not null
            if (value === null || value === undefined) {
              return `${context.label}: 0 kWh`;
            }
            return `${context.label}: ${value.toFixed(1)} kWh`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#666'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#666',
          callback: (value) => {
            // FIX: Validate that value is not null
            if (typeof value === 'number') {
              return `${value} kWh`;
            }
            return value;
          }
        }
      }
    }
  };

  public barChartType: 'bar' = 'bar';

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    console.log('MonthlyChart - ngOnInit');
    this.updateChartData();

    // Suscribirse a cambios de idioma
    this.translate.onLangChange.subscribe(() => {
      this.updateChartData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyComparison']) {
      console.log('MonthlyChart - Monthly comparison input changed');
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    console.log('MonthlyChart - Generating monthly consumption data');

    // CHANGE: Generate only 3 months (current + 2 previous)
    const monthlyData: MonthlyData[] = this.generateMonthlyData();

    console.log('MonthlyChart - Using demo monthly data:', monthlyData);

    // Obtener mes actual para resaltar
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'short' }).replace('.', '');

    // Colores: verde para meses anteriores, azul oscuro para el mes actual
    const colors = monthlyData.map(m =>
      m.month.toLowerCase() === currentMonth.toLowerCase() ? '#1976d2' : '#4CAF50'
    );

    const hoverColors = monthlyData.map(m =>
      m.month.toLowerCase() === currentMonth.toLowerCase() ? '#0d47a1' : '#388E3C'
    );

    this.barChartData = {
      datasets: [{
        data: monthlyData.map(m => m.consumption),
        label: this.translate.instant('dashboard.charts.monthlyConsumption'),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: hoverColors
      }],
      labels: monthlyData.map(m => this.getMonthTranslation(m.month))
    };

    console.log('MonthlyChart - Chart data updated');
    console.log('  - Data points:', monthlyData.length);
    console.log('  - Sample values:', monthlyData.map(m => `${m.month}: ${m.consumption.toFixed(1)}`));

    // Force chart update
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('MonthlyChart - Chart rendered');
      }
    }, 100);
  }

  private generateMonthlyData(): MonthlyData[] {
    // CHANGE: Generate only 3 months (current + 2 previous)
    const now = new Date();
    const monthlyData: MonthlyData[] = [];

    // Consumo base con variaciones realistas para 3 meses
    const baseConsumptions = [185, 88, 95, 102]; // [2 months ago, 1 month ago, current month]

    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthAbbr = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');

      monthlyData.push({
        month: monthAbbr,
        year: date.getFullYear(),
        consumption: baseConsumptions[3 - i]
      });
    }

    return monthlyData;
  }

  private getMonthTranslation(monthAbbr: string): string {
    // Mapping Spanish abbreviations to translation keys
    const monthMap: { [key: string]: string } = {
      'ene': 'january',
      'feb': 'february',
      'mar': 'march',
      'abr': 'april',
      'may': 'may',
      'jun': 'june',
      'jul': 'july',
      'ago': 'august',
      'sep': 'september',
      'oct': 'october',
      'nov': 'november',
      'dic': 'december'
    };

    const cleanAbbr = monthAbbr.toLowerCase().replace('.', '');
    const monthKey = monthMap[cleanAbbr] || cleanAbbr;

    return this.translate.instant(`dashboard.months.${monthKey}`);
  }

  hasChartData(): boolean {
    const hasData = this.barChartData.datasets[0].data.length > 0;
    console.log('MonthlyChart - hasChartData:', hasData);
    return hasData;
  }

  get monthlyComparisonLabel(): string {
    return this.translate.instant('dashboard.charts.monthlyComparison');
  }

  get comparisonLabel(): string {
    return this.translate.instant('dashboard.charts.comparison');
  }
}
