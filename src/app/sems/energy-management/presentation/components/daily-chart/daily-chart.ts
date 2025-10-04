import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { DailyConsumption } from '../../../domain/model/entities/daily-consumption.entity';

@Component({
  selector: 'app-daily-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './daily-chart.html',
  styleUrl: './daily-chart.css'
})
export class DailyChart implements OnChanges {
  @Input() dailyConsumption?: DailyConsumption;
  
  chartData: any[] = [];
  maxValue: number = 10;
  linePoints: string = '';
  areaPoints: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dailyConsumption'] && this.dailyConsumption) {
      this.prepareChartData();
    }
  }

  prepareChartData(): void {
    if (!this.dailyConsumption) return;

    this.chartData = this.dailyConsumption.dataPoints;
    this.maxValue = Math.max(...this.chartData.map(d => d.value), 10);
    this.calculatePoints();
  }

  calculatePoints(): void {
    if (this.chartData.length === 0) return;

    const points = this.chartData.map((d, i) => {
      const x = i * 800 / (this.chartData.length - 1);
      const y = 300 - (d.value / this.maxValue) * 300;
      return `${x},${y}`;
    });

    this.linePoints = points.join(' ');
    this.areaPoints = `0,300 ${points.join(' ')} 800,300`;
  }

  getBarHeight(value: number): string {
    const percentage = (value / this.maxValue) * 100;
    return `${percentage}%`;
  }

  formatTime(time: string): string {
    return time;
  }
}
