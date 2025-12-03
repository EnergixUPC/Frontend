import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Device } from '../../../domain/model/device.entity';

interface HourlyConsumption {
  hour: string;
  consumption: number;
}

@Component({
  selector: 'app-daily-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './daily-chart.html',
  styleUrl: './daily-chart.css'
})
export class DailyChart implements OnInit, OnChanges {
  @Input() devices?: Device[];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [{
      data: [],
      label: 'Consumption (kWh)',
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#4caf50',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }],
    labels: []
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return '';
            }
            return `${context.dataset.label}: ${value.toFixed(3)} kWh`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'kWh',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            if (typeof value === 'number') {
              return value.toFixed(2);
            }
            return value;
          }
        }
      }
    }
  };

  public lineChartType: 'line' = 'line';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    console.log('📊 DailyChart - ngOnInit');
    // Inicializar con datos vacíos
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devices']) {
      const currentDevices = changes['devices'].currentValue;
      const previousDevices = changes['devices'].previousValue;

      console.log('📊 DailyChart - Devices input changed:');
      console.log('  - Previous devices:', previousDevices?.length || 0);
      console.log('  - Current devices:', currentDevices?.length || 0);

      if (currentDevices && currentDevices.length > 0) {
        console.log('  - First device:', currentDevices[0]);
        this.updateChartData();
      } else {
        console.warn('⚠️ DailyChart - No devices received');
        this.clearChartData();
      }
    }
  }

  private updateChartData(): void {
    console.log('📈 DailyChart - Generating realistic daily consumption data');

    if (!this.devices || this.devices.length === 0) {
      console.log('⚠️ DailyChart - No devices available');
      this.clearChartData();
      return;
    }

    // Calcular consumo total diario de dispositivos
    const totalDailyConsumption = this.calculateTotalDailyConsumption();
    console.log('💡 DailyChart - Total daily consumption:', totalDailyConsumption.toFixed(3), 'kWh');

    if (totalDailyConsumption === 0) {
      console.warn('⚠️ DailyChart - Total consumption is 0, using fallback data');
      // Usar datos de fallback si el consumo es 0
      this.generateFallbackData();
      return;
    }

    // Generar patrón de consumo por hora (24 horas)
    const hourlyData = this.generateHourlyConsumptionPattern(totalDailyConsumption);

    // Actualizar datos del gráfico
    this.lineChartData = {
      datasets: [{
        data: hourlyData.map(h => h.consumption),
        label: this.translate.instant('dashboard.charts.consumption'),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4caf50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }],
      labels: hourlyData.map(h => h.hour)
    };

    console.log('✅ DailyChart - Chart data updated:');
    console.log('  - Data points:', hourlyData.length);
    console.log('  - Sample values:', hourlyData.slice(0, 3).map(h => h.consumption.toFixed(3)));

    // Forzar actualización del gráfico
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('✅ DailyChart - Chart updated successfully');
      }
    }, 100);
  }

  private calculateTotalDailyConsumption(): number {
    if (!this.devices) return 0;

    return this.devices.reduce((total, device) => {
      let weeklyConsumption = 0;

      // Obtener consumo semanal
      if (device.energyConsumptionValue && device.energyConsumptionValue > 0) {
        weeklyConsumption = device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        weeklyConsumption = match ? parseFloat(match[1]) : 0;
      } else {
        weeklyConsumption = this.getEstimatedConsumption(device);
      }

      // Convertir a consumo diario
      const dailyConsumption = weeklyConsumption / 7;

      console.log(`📱 DailyChart - Device "${device.name}": ${dailyConsumption.toFixed(3)} kWh/day (weekly: ${weeklyConsumption.toFixed(3)} kWh)`);

      return total + dailyConsumption;
    }, 0);
  }

  private generateHourlyConsumptionPattern(totalDailyConsumption: number): HourlyConsumption[] {
    const hourlyData: HourlyConsumption[] = [];

    // Patrón de consumo realista por hora (suma debe ser ≈ totalDailyConsumption)
    const consumptionPattern = [
      0.02, 0.015, 0.01, 0.01, 0.015, 0.03,  // 00:00 - 05:00 (bajo consumo nocturno)
      0.08, 0.12, 0.10, 0.07, 0.05, 0.06,    // 06:00 - 11:00 (pico matutino)
      0.07, 0.05, 0.04, 0.03, 0.04, 0.05,    // 12:00 - 17:00 (mediodía)
      0.09, 0.12, 0.10, 0.08, 0.05, 0.03     // 18:00 - 23:00 (pico vespertino)
    ];

    // Normalizar patrón para que sume exactamente el consumo total
    const patternSum = consumptionPattern.reduce((sum, val) => sum + val, 0);
    const scaleFactor = totalDailyConsumption / patternSum;

    console.log('📐 DailyChart - Pattern normalization:');
    console.log('  - Pattern sum:', patternSum.toFixed(3));
    console.log('  - Scale factor:', scaleFactor.toFixed(3));

    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const consumption = consumptionPattern[hour] * scaleFactor;

      hourlyData.push({
        hour: hourStr,
        consumption: consumption
      });
    }

    return hourlyData;
  }

  private generateFallbackData(): void {
    console.log('📊 DailyChart - Generating fallback demo data');

    const hourlyData: HourlyConsumption[] = [];
    const baseConsumption = 5.0; // 5 kWh diarios de ejemplo

    const consumptionPattern = [
      0.02, 0.015, 0.01, 0.01, 0.015, 0.03,
      0.08, 0.12, 0.10, 0.07, 0.05, 0.06,
      0.07, 0.05, 0.04, 0.03, 0.04, 0.05,
      0.09, 0.12, 0.10, 0.08, 0.05, 0.03
    ];

    const patternSum = consumptionPattern.reduce((sum, val) => sum + val, 0);
    const scaleFactor = baseConsumption / patternSum;

    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const consumption = consumptionPattern[hour] * scaleFactor;

      hourlyData.push({
        hour: hourStr,
        consumption: consumption
      });
    }

    this.lineChartData = {
      datasets: [{
        data: hourlyData.map(h => h.consumption),
        label: this.translate.instant('dashboard.charts.consumption'),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4caf50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }],
      labels: hourlyData.map(h => h.hour)
    };

    setTimeout(() => {
      this.chart?.update();
    }, 100);
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

  private clearChartData(): void {
    console.log('🧹 DailyChart - Clearing chart data');

    this.lineChartData = {
      datasets: [{
        data: [],
        label: this.translate.instant('dashboard.charts.consumption'),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }],
      labels: []
    };

    setTimeout(() => {
      this.chart?.update();
    }, 100);
  }

  hasChartData(): boolean {
    const hasData = this.lineChartData.datasets[0].data.length > 0;
    console.log('🔍 DailyChart - hasChartData:', hasData);
    return hasData;
  }

  get dailyConsumptionLabel(): string {
    return this.translate.instant('dashboard.charts.dailyConsumption');
  }
}
