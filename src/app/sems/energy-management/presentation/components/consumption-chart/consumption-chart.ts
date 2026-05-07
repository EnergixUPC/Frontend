import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Device } from '../../../domain/model/device.entity';

type ChartStyle = 'bar' | 'pie' | 'area';
type Period = 'weekly' | 'monthly';

@Component({
  selector: 'app-consumption-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './consumption-chart.html',
  styleUrl: './consumption-chart.css'
})
export class ConsumptionChart implements OnInit, OnChanges {
  @Input() devices?: Device[];
  @Input() deviceConsumptions?: Record<string, DeviceConsumptionSummary>;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartStyle: ChartStyle = 'bar';
  period: Period = 'weekly';
  cartesianChartType: 'bar' | 'line' = 'bar';
  pieChartType: 'pie' = 'pie';

  cartesianChartData: ChartData<'bar' | 'line'> = {
    datasets: [],
    labels: []
  };

  pieChartData: ChartData<'pie'> = {
    datasets: [],
    labels: []
  };

  cartesianChartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.updateChartData();

    this.translate.onLangChange.subscribe(() => {
      this.updateChartData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devices'] || changes['deviceConsumptions']) {
      this.updateChartData();
    }
  }

  setChartStyle(style: ChartStyle): void {
    if (this.chartStyle !== style) {
      this.chartStyle = style;
      this.updateChartData();
    }
  }

  setPeriod(period: Period): void {
    if (this.period !== period) {
      this.period = period;
      this.updateChartData();
    }
  }

  hasChartData(): boolean {
    if (this.chartStyle === 'pie') {
      const dataset = this.pieChartData.datasets[0]?.data as number[] | undefined;
      return !!dataset && dataset.length > 0;
    }

    const dataset = this.cartesianChartData.datasets[0]?.data as number[] | undefined;
    return !!dataset && dataset.length > 0;
  }

  get chartTitle(): string {
    return this.translate.instant('dashboard.charts.deviceConsumption');
  }

  get periodLabel(): string {
    return this.translate.instant('dashboard.charts.period');
  }

  get chartTypeLabel(): string {
    return this.translate.instant('dashboard.charts.chartType');
  }

  get weeklyLabel(): string {
    return this.translate.instant('dashboard.charts.weekly');
  }

  get monthlyLabel(): string {
    return this.translate.instant('dashboard.charts.monthly');
  }

  get barsLabel(): string {
    return this.translate.instant('dashboard.charts.bars');
  }

  get pieLabel(): string {
    return this.translate.instant('dashboard.charts.pie');
  }

  get areaLabel(): string {
    return this.translate.instant('dashboard.charts.area');
  }

  private updateChartData(): void {
    if (!this.devices || this.devices.length === 0) {
      this.clearChartData();
      return;
    }

    const deviceTotals = this.devices
      .map(device => {
        const weekly = this.getWeeklyConsumption(device);
        const monthly = this.getMonthlyConsumption(device, weekly);
        return {
          label: this.getDeviceLabel(device),
          weekly,
          monthly
        };
      })
      .filter(device => device.weekly > 0 || device.monthly > 0);

    const totalWeekly = deviceTotals.reduce((sum, device) => sum + device.weekly, 0);
    const totalMonthly = deviceTotals.reduce((sum, device) => sum + device.monthly, 0);
    const periodTotal = this.period === 'monthly' ? totalMonthly : totalWeekly;

    if (periodTotal <= 0) {
      this.clearChartData();
      return;
    }

    this.cartesianChartType = this.chartStyle === 'area' ? 'line' : 'bar';
    this.cartesianChartOptions = this.getCartesianOptions();
    this.pieChartOptions = this.getPieOptions();

    if (this.chartStyle === 'pie') {
      const periodValues = deviceTotals.map(device =>
        this.period === 'monthly' ? device.monthly : device.weekly
      );
      this.applyPieData(deviceTotals, periodValues);
    } else {
      this.applyTimeSeriesData(periodTotal);
    }

    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
    }, 0);
  }

  private applyTimeSeriesData(totalWeekly: number): void {
    const periodTotal = this.period === 'monthly' ? totalWeekly * 4 : totalWeekly;
    const series = this.period === 'monthly'
      ? this.buildMonthlySeries(periodTotal)
      : this.buildWeeklySeries(periodTotal);

    const colors = this.chartStyle === 'bar'
      ? this.buildPalette(series.values.length)
      : ['#1976d2'];

    this.cartesianChartData = {
      labels: series.labels,
      datasets: [{
        data: series.values,
        label: this.translate.instant('dashboard.charts.consumption'),
        backgroundColor: this.chartStyle === 'bar' ? colors : 'rgba(25, 118, 210, 0.15)',
        borderColor: this.chartStyle === 'bar' ? colors : '#1976d2',
        borderWidth: 2,
        fill: this.chartStyle === 'area',
        tension: 0.35,
        pointRadius: this.chartStyle === 'area' ? 3 : 0,
        pointHoverRadius: this.chartStyle === 'area' ? 5 : 0
      }]
    };
  }

  private applyPieData(
    deviceTotals: Array<{ label: string; weekly: number; monthly: number }>,
    periodValues: number[]
  ): void {
    const data = periodValues;
    const colors = this.buildPalette(data.length);

    if (data.reduce((sum, value) => sum + value, 0) <= 0) {
      this.clearChartData();
      return;
    }

    this.pieChartData = {
      labels: deviceTotals.map(device => device.label),
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  private buildWeeklySeries(totalWeekly: number): { labels: string[]; values: number[] } {
    const dayKeys = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const labels = dayKeys.map(key => this.translate.instant(`reports.weeklyChart.days.${key}`));
    const pattern = [0.12, 0.11, 0.13, 0.14, 0.15, 0.18, 0.17];
    const sumPattern = pattern.reduce((sum, value) => sum + value, 0);
    const values = pattern.map(value => (value / sumPattern) * totalWeekly);

    return { labels, values };
  }

  private buildMonthlySeries(totalMonthly: number): { labels: string[]; values: number[] } {
    const now = new Date();
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    const labels: string[] = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthKeys[date.getMonth()];
      labels.push(this.translate.instant(`dashboard.months.${monthKey}`));
    }

    const factors = [0.95, 1.0, 1.05];
    const sumFactors = factors.reduce((sum, value) => sum + value, 0);
    const values = factors.map(value => (value / sumFactors) * totalMonthly);

    return { labels, values };
  }

  private getCartesianOptions(): ChartOptions<'bar' | 'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 12,
          titleFont: {
            size: 13,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: (context) => {
              const value = context.parsed.y ?? context.parsed;
              if (typeof value !== 'number') {
                return '';
              }
              return `${value.toFixed(2)} kWh`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: this.translate.instant('dashboard.axes.time'),
            font: {
              size: 12,
              weight: 'bold'
            }
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
          title: {
            display: true,
            text: this.translate.instant('dashboard.units.kwh'),
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#666',
            callback: (value) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }
          }
        }
      }
    };
  }

  private getPieOptions(): ChartOptions<'pie'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 14,
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 12,
          titleFont: {
            size: 13,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: (context) => {
              const value = typeof context.parsed === 'number' ? context.parsed : 0;
              return `${context.label}: ${value.toFixed(2)} kWh`;
            }
          }
        }
      }
    };
  }

  private getWeeklyConsumption(device: Device): number {
    const summary = this.deviceConsumptions?.[device.id];
    if (summary?.weekly !== undefined) {
      return summary.weekly;
    }

    if (device.energyConsumptionValue && device.energyConsumptionValue > 0) {
      return device.energyConsumptionValue;
    }

    if (device.energyConsumption) {
      const match = device.energyConsumption.match(/(\d+\.?\d*)/);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return this.getEstimatedConsumption(device);
  }

  private getMonthlyConsumption(device: Device, weeklyFallback: number): number {
    const summary = this.deviceConsumptions?.[device.id];
    if (summary?.monthly !== undefined) {
      return summary.monthly;
    }

    if (weeklyFallback > 0) {
      return weeklyFallback * 4;
    }

    return 0;
  }

  private getEstimatedConsumption(device: Device): number {
    const estimatedWeeklyConsumption: { [key: string]: number } = {
      'Major Appliances': 12.0,
      'Heating & Cooling': 25.0,
      'Electronics': 3.5,
      'Lighting': 2.0,
      'Kitchen Appliances': 5.0,
      'Other': 2.0
    };

    const baseConsumption = estimatedWeeklyConsumption[device.category] || 2.0;
    return device.isActive ? baseConsumption : baseConsumption * 0.1;
  }

  private getDeviceLabel(device: Device): string {
    const trimmedName = device.name?.trim();
    if (trimmedName) {
      return trimmedName;
    }

    if (device.category) {
      return device.category;
    }

    return this.translate.instant('dashboard.devices.title');
  }

  private buildPalette(count: number): string[] {
    const palette = ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#26a69a', '#f06292'];
    return Array.from({ length: count }, (_, index) => palette[index % palette.length]);
  }

  private clearChartData(): void {
    this.cartesianChartData = {
      datasets: [],
      labels: []
    };
    this.pieChartData = {
      datasets: [],
      labels: []
    };
  }
}

interface DeviceConsumptionSummary {
  daily?: number;
  weekly?: number;
  monthly?: number;
}
