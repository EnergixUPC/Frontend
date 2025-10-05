import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { StatsCard } from '../../components/stats-card/stats-card';
import { DailyChart } from '../../components/daily-chart/daily-chart';
import { CategoryChart } from '../../components/category-chart/category-chart';
import { MonthlyChart } from '../../components/monthly-chart/monthly-chart';
import { DeviceList } from '../../components/device-list/device-list';
import { Device, DeviceStatus, DeviceType } from '../../../domain/model/entities/device.entity';
import { DailyConsumption } from '../../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../../domain/model/entities/monthly-comparison.entity';
import { DashboardStats } from '../../../domain/model/entities/dashboard-stats.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../application/services/dashboard.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    TranslateModule,
    StatsCard,
    DailyChart,
    CategoryChart,
    MonthlyChart,
    DeviceList,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  // Data from API
  dashboardStats: DashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');

  dailyConsumption?: DailyConsumption;
  consumptionByCategory?: ConsumptionByCategory;
  monthlyComparison?: MonthlyComparison;
  devices: Device[] = [];

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Initialize translations first
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    
    // Debug: Check if translations are loaded
    console.log('Translations loaded:', this.translate.instant('dashboard.stats.energyConsumption'));
    
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load dashboard stats
    this.dashboardService.loadDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        console.log('Dashboard stats loaded:', stats);
        this.dashboardStats = stats;
      },
      error: (error: any) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load daily consumption
    this.dashboardService.loadDailyConsumption().subscribe({
      next: (data: DailyConsumption) => {
        this.dailyConsumption = data;
      },
      error: (error: any) => {
        console.error('Error loading daily consumption:', error);
      }
    });

    // Load consumption by category
    this.dashboardService.loadConsumptionByCategory().subscribe({
      next: (data: ConsumptionByCategory) => {
        this.consumptionByCategory = data;
      },
      error: (error: any) => {
        console.error('Error loading consumption by category:', error);
      }
    });

    // Load monthly comparison
    this.dashboardService.loadMonthlyComparison().subscribe({
      next: (data: MonthlyComparison) => {
        this.monthlyComparison = data;
      },
      error: (error: any) => {
        console.error('Error loading monthly comparison:', error);
      }
    });

    // Load devices
    this.dashboardService.loadDevices().subscribe({
      next: (data: Device[]) => {
        this.devices = data;
      },
      error: (error: any) => {
        console.error('Error loading devices:', error);
      }
    });
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
