import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DeviceConsumption } from '../../../domain/model/entities/device-consumption.entity';
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
  @Input() deviceConsumptions?: Record<string, DeviceConsumption[]>;
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

    const grouped = this.groupConsumptionsByDevice();
    if (grouped.deviceTotals.length === 0 || grouped.series.labels.length === 0) {
      this.clearChartData();
      return;
    }

    this.cartesianChartType = this.chartStyle === 'area' ? 'line' : 'bar';
    this.cartesianChartOptions = this.getCartesianOptions();
    this.pieChartOptions = this.getPieOptions();

    if (this.chartStyle === 'pie') {
      this.applyPieData(grouped.deviceTotals, grouped.deviceTotals.map(device => device.total));
    } else {
      this.applyTimeSeriesData(grouped.series);
    }

    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
    }, 0);
  }

  private applyTimeSeriesData(series: ChartSeries): void {
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

  private applyPieData(deviceTotals: Array<{ label: string; total: number }>, data: number[]): void {
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

  private groupConsumptionsByDevice(): { series: ChartSeries; deviceTotals: Array<{ label: string; total: number }> } {
    const records = this.buildRecords();
    if (records.length === 0) {
      return { series: { labels: [], values: [] }, deviceTotals: [] };
    }

    const { labels, values } = this.buildSeries(records);
    const totalsByDevice: Record<string, number> = {};

    records.forEach(record => {
      totalsByDevice[record.deviceLabel] = (totalsByDevice[record.deviceLabel] || 0) + record.consumption;
    });

    const deviceTotals = Object.entries(totalsByDevice)
      .map(([label, total]) => ({ label, total }))
      .filter(item => item.total > 0);

    return { series: { labels, values }, deviceTotals };
  }

  private buildRecords(): ConsumptionRecord[] {
    if (!this.devices || this.devices.length === 0) {
      return [];
    }

    const range = this.buildDateRange();
    if (range.length === 0) {
      return [];
    }

    const deviceRecords: ConsumptionRecord[] = [];

    this.devices.forEach(device => {
      const entries = (this.deviceConsumptions?.[device.id] || [])
        .filter(entry => entry.period === 'daily' && !!entry.createdAt)
        .map(entry => ({
          deviceId: device.id,
          deviceLabel: this.getDeviceLabel(device),
          dateKey: this.toDateKey(new Date(entry.createdAt)),
          consumption: entry.consumption
        }))
        .filter(entry => range.includes(entry.dateKey));

      deviceRecords.push(...entries);
    });

    return deviceRecords;
  }

  private buildSeries(records: ConsumptionRecord[]): ChartSeries {
    const range = this.buildDateRange();
    if (range.length === 0) {
      return { labels: [], values: [] };
    }

    const totalsByDate: Record<string, number> = {};
    records.forEach(record => {
      totalsByDate[record.dateKey] = (totalsByDate[record.dateKey] || 0) + record.consumption;
    });

    const earliest = this.getEarliestDateKey(records);
    const filteredRange = earliest
      ? range.filter(dateKey => dateKey >= earliest)
      : range;

    const labels = filteredRange.map(dateKey => this.formatLabel(dateKey));
    const values = filteredRange.map(dateKey => totalsByDate[dateKey] || 0);

    return { labels, values };
  }

  private buildDateRange(): string[] {
    const today = new Date();
    if (this.period === 'weekly') {
      return this.buildRecentDates(today, 7);
    }

    return this.buildMonthDates(today);
  }

  private buildRecentDates(reference: Date, days: number): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() - i);
      dates.push(this.toDateKey(date));
    }
    return dates;
  }

  private buildMonthDates(reference: Date): string[] {
    const dates: string[] = [];
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const today = reference.getDate();

    for (let day = 1; day <= today; day++) {
      dates.push(this.toDateKey(new Date(year, month, day)));
    }

    return dates;
  }

  private getEarliestDateKey(records: ConsumptionRecord[]): string | null {
    if (records.length === 0) {
      return null;
    }

    return records.reduce((earliest, record) =>
      record.dateKey < earliest ? record.dateKey : earliest
    , records[0].dateKey);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatLabel(dateKey: string): string {
    const [year, month, day] = dateKey.split('-').map(value => parseInt(value, 10));
    const date = new Date(year, month - 1, day);

    if (this.period === 'weekly') {
      const dayKey = this.getWeekdayKey(date.getDay());
      return this.translate.instant(`reports.weeklyChart.days.${dayKey}`);
    }

    return `${day}`;
  }

  private getWeekdayKey(dayIndex: number): string {
    const keys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return keys[dayIndex] || 'MON';
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

interface ConsumptionRecord {
  deviceId: string;
  deviceLabel: string;
  dateKey: string;
  consumption: number;
}

interface ChartSeries {
  labels: string[];
  values: number[];
}
