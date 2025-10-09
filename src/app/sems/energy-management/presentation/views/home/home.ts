import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { StatsCard } from '../../components/stats-card/stats-card';
import { DailyChart } from '../../components/daily-chart/daily-chart';
import { CategoryChart } from '../../components/category-chart/category-chart';
import { MonthlyChart } from '../../components/monthly-chart/monthly-chart';
import { DeviceList } from '../../components/device-list/device-list';
import { Device, DeviceStatus, DeviceType } from '../../../domain/model/device.entity';
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
export class Home implements OnInit, OnDestroy {
  // Data from API
  dashboardStats: DashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');

  dailyConsumption?: DailyConsumption;
  consumptionByCategory?: ConsumptionByCategory;
  monthlyComparison?: MonthlyComparison;
  devices: Device[] = [];

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Debug: Check current language
    console.log('Home - ngOnInit. Current language:', this.translate.currentLang);
    console.log('Home - ngOnInit. Translations loaded:', this.translate.instant('dashboard.stats.energyConsumption'));

    // Force change detection
    this.cdr.detectChanges();
    
    this.loadDashboardData();

    // when navigation ends, if we returned to /home reload data
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(evt => {
      if (evt.urlAfterRedirects === '/home' || evt.url === '/home') {
        console.log('Home - navigation end to /home, reloading dashboard data');
        this.loadDashboardData();
      }
    });
    // reload when navigating back to /home (in case router reuses components)
    if ((this as any).router === undefined) {
      // router may be injected via constructor in variants; try to get it from DI if available
    }
  }

  // Ensure we reload data when returning to this route and clean up subscriptions
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Load devices - CAMBIAR A USAR LA NUEVA API DE DEVICES
    // this.dashboardService.loadDevices().subscribe({
    //   next: (data: Device[]) => {
    //     this.devices = data;
    //   },
    //   error: (error: any) => {
    //     console.error('Error loading devices:', error);
    //   }
    // });
    
    // Usar datos hardcodeados temporalmente para test
    this.devices = [
      {
        id: '1',
        name: 'Air Conditioner',
        category: 'Heating & Cooling',
        type: 'AIR_CONDITIONER',
        status: 'ON' as any,
        realTimeStatus: 'On',
        lastActive: 'Now',
        alertHistory: 'No alerts',
        energyConsumption: '2 kWh this week',
        location: 'Living Room',
        isActive: true
      },
      {
        id: '2',
        name: 'Refrigerator',
        category: 'Major Appliances',
        type: 'REFRIGERATOR',
        status: 'ON' as any,
        realTimeStatus: 'On',
        lastActive: 'Now',
        alertHistory: 'No alerts',
        energyConsumption: '30 kWh this week',
        location: 'Kitchen',
        isActive: true
      },
      {
        id: '3',
        name: 'TV',
        category: 'Electronics',
        type: 'TV',
        status: 'STANDBY' as any,
        realTimeStatus: 'Standby',
        lastActive: '15 minutes ago',
        alertHistory: 'Phantom load alert',
        energyConsumption: '8 kWh this week',
        location: 'Living Room',
        isActive: false
      }
    ];
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  // Translation helper methods for template
  get energyConsumptionLabel(): string {
    return this.translate.instant('dashboard.stats.energyConsumption');
  }

  get monthlySavingGoalLabel(): string {
    return this.translate.instant('dashboard.stats.monthlySavingGoal');
  }

  get estimatedSavingsLabel(): string {
    return this.translate.instant('dashboard.stats.estimatedSavings');
  }

  get consumptionLabel(): string {
    return this.translate.instant('dashboard.stats.consumption');
  }

  get activeDevicesLabel(): string {
    return this.translate.instant('dashboard.stats.activeDevices');
  }

  get devicesLabel(): string {
    return this.translate.instant('dashboard.stats.devices');
  }

  get estimatedBillLabel(): string {
    return this.translate.instant('dashboard.stats.estimatedBill');
  }

  get todayConsumptionLabel(): string {
    return this.translate.instant('dashboard.stats.todayConsumption');
  }

  get alertsTitleLabel(): string {
    return this.translate.instant('dashboard.alerts.title');
  }

  get highConsumptionLabel(): string {
    return this.translate.instant('dashboard.alerts.highConsumption');
  }

  get highConsumptionMessageLabel(): string {
    return this.translate.instant('dashboard.alerts.highConsumptionMessage');
  }

  get reminderLabel(): string {
    return this.translate.instant('dashboard.alerts.reminder');
  }

  get reminderMessageLabel(): string {
    return this.translate.instant('dashboard.alerts.reminderMessage');
  }
}
