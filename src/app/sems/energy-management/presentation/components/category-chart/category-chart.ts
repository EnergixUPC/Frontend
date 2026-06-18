import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Device } from '../../../domain/model/device.entity';

interface CategoryData {
  category: string;
  consumption: number;
  color: string;
}

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './category-chart.html',
  styleUrl: './category-chart.css'
})
export class CategoryChart implements OnInit, OnChanges {
  @Input() devices?: Device[];
  @Input() categoryData?: any[];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2,
      borderColor: '#fff'
    }],
    labels: []
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toFixed(2)} kWh (${percentage}%)`;
          }
        }
      }
    }
  };

  public doughnutChartType: 'doughnut' = 'doughnut';

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    console.log('CategoryChart - ngOnInit');
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devices'] || changes['categoryData']) {
      console.log('CategoryChart - Input changed');
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (this.categoryData && this.categoryData.length > 0) {
      this.doughnutChartData = {
        datasets: [{
          data: this.categoryData.map(c => c.value || c.consumption || 0),
          backgroundColor: this.categoryData.map(c => c.color || '#2196F3'),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8
        }],
        labels: this.categoryData.map(c => c.name || c.category || '')
      };
    } else {
      // Always use static example data (PC, Mobile, TV) if no data
      const demoData: CategoryData[] = [
        {
          category: this.translate.instant('dashboard.categories.computer'),
          consumption: 8.5, // kWh/semana
          color: '#2196F3' // Azul
        },
        {
          category: this.translate.instant('dashboard.categories.phone'),
          consumption: 2.1, // kWh/semana
          color: '#4CAF50' // Verde
        },
        {
          category: this.translate.instant('dashboard.categories.tv'),
          consumption: 10.9, // kWh/semana
          color: '#FF9800' // Naranja
        }
      ];

      this.doughnutChartData = {
        datasets: [{
          data: demoData.map(c => c.consumption),
          backgroundColor: demoData.map(c => c.color),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8
        }],
        labels: demoData.map(c => c.category)
      };
    }

    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('CategoryChart - Chart rendered');
      }
    }, 100);
  }

  hasChartData(): boolean {
    const hasData = this.doughnutChartData.datasets[0].data.length > 0;
    console.log('CategoryChart - hasChartData:', hasData);
    return hasData;
  }

  get categoryConsumptionLabel(): string {
    return this.translate.instant('dashboard.charts.categoryConsumption');
  }
}
