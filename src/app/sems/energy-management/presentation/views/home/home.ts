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
import { Device, DeviceStatus } from '../../../domain/model/device.entity';
import { DailyConsumption } from '../../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../../domain/model/entities/monthly-comparison.entity';
import { DashboardStats } from '../../../domain/model/entities/dashboard-stats.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../application/services/dashboard.service';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';

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
  dashboardStats: DashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');
  dailyConsumption?: DailyConsumption;
  consumptionByCategory?: ConsumptionByCategory;
  monthlyComparison?: MonthlyComparison;
  devices: Device[] = [];
  alerts: any[] = [];
  isLoading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private mockDataService: MockDataService
  ) {}

  ngOnInit(): void {
    console.log('Home - ngOnInit. Current language:', this.translate.currentLang);

    this.dashboardStats.currency = this.translate.instant('dashboard.units.currency');
    this.cdr.detectChanges();

    this.loadDashboardData();

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(evt => {
      if (evt.urlAfterRedirects === '/home' || evt.url === '/home') {
        console.log('Home - navigation end to /home, reloading dashboard data');
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    this.authService.authState$.subscribe(authState => {
      console.log('Home - Authentication state changed:', authState);

      if (authState.isLoading) {
        console.log('Home - Auth still loading, waiting...');
        return;
      }

      if (!authState.isAuthenticated || !authState.user) {
        console.warn('Home - User not authenticated, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }

      const currentUser = authState.user;
      console.log('Home - User authenticated - Loading dashboard for user:', currentUser.id, currentUser.email);

      this.loadBackendData();
    });
  }

  private updateChartData(): void {
    console.log('🔄 Updating all dashboard data');

    if (!this.devices || this.devices.length === 0) {
      console.warn('⚠️ No devices available for calculations');
      return;
    }

    console.log('📊 Recalculating stats from', this.devices.length, 'devices');

    this.devices.forEach((device, i) => {
      console.log(`Device ${i + 1}:`, {
        name: device.name,
        category: device.category,
        consumption: device.energyConsumption,
        consumptionValue: device.energyConsumptionValue,
        isActive: device.isActive
      });
    });

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  private loadBackendData(): void {
    console.log('Loading unified dashboard data from backend...');

    this.dashboardService.loadUnifiedDashboard().subscribe({
      next: () => {
        console.log('Unified dashboard data loaded successfully');

        this.dashboardService.getDashboardState().subscribe(state => {
          if (state.stats) {
            this.dashboardStats = state.stats;
            console.log('Dashboard stats:', state.stats);
          }

          if (state.dailyConsumption) {
            this.dailyConsumption = state.dailyConsumption;
            console.log('Daily consumption:', state.dailyConsumption);
          }

          if (state.consumptionByCategory) {
            this.consumptionByCategory = state.consumptionByCategory;
            console.log('Category consumption:', state.consumptionByCategory);
          }

          if (state.devices) {
            this.devices = state.devices || [];
            console.log('✅ Devices loaded:', this.devices.length);
            this.updateChartData();
          }
        });

        console.log('Loading devices from /api/v1/devices endpoint...');
        this.dashboardService.loadDevices().subscribe({
          next: (devices: Device[]) => {
            console.log('✅ Devices from API:', devices.length);

            if (this.devices.length === 0 && devices.length > 0) {
              this.devices = devices;
              console.log('📱 Setting devices from API:', devices);
              this.updateChartData();
            }
          },
          error: (error: any) => {
            console.error('❌ Error loading devices:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('❌ Error loading dashboard:', error);
        this.dashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');
        this.devices = [];

        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 50);
      }
    });

    this.loadAlerts();
    this.isLoading = false;
  }

  private loadAlerts(): void {
    this.dashboardService.loadAlerts().subscribe({
      next: (alerts: any[]) => {
        this.alerts = alerts || [];
        console.log('Alerts loaded:', this.alerts);
      },
      error: (error: any) => {
        console.error('Error loading alerts:', error);
        this.alerts = [];
      }
    });
  }

  getCalculatedEnergyConsumption(): string {
    console.log('📊 Calculating total energy consumption');

    if (!this.hasDevices) {
      console.log('⚠️ No devices found');
      const unit = this.translate.instant('dashboard.units.kwh');
      return `21.5 ${unit}`;
    }

    const totalConsumption = this.devices.reduce((total, device) => {
      let deviceConsumption = 0;

      if (device.energyConsumptionValue && device.energyConsumptionValue > 0) {
        deviceConsumption = device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) : 0;
      } else {
        deviceConsumption = this.getEstimatedConsumption(device);
      }

      return total + deviceConsumption;
    }, 0);

    console.log('✅ Total weekly consumption:', totalConsumption, 'kWh');
    const unit = this.translate.instant('dashboard.units.kwh');
    return totalConsumption > 0 ? `${totalConsumption.toFixed(1)} ${unit}` : `21.5 ${unit}`;
  }

  getCalculatedTodayConsumption(): string {
    console.log('📅 Calculating today consumption');

    if (!this.hasDevices) {
      const unit = this.translate.instant('dashboard.units.kwh');
      return `3.07 ${unit}`;
    }

    const todayConsumption = this.devices.reduce((total, device) => {
      let deviceConsumption = 0;

      if (device.energyConsumptionValue && device.energyConsumptionValue > 0) {
        deviceConsumption = device.energyConsumptionValue / 7; // Convertir semanal a diario
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) / 7 : 0;
      } else {
        deviceConsumption = this.getEstimatedConsumption(device) / 7;
      }

      return total + deviceConsumption;
    }, 0);

    console.log('✅ Today consumption:', todayConsumption, 'kWh');
    const unit = this.translate.instant('dashboard.units.kwh');
    return todayConsumption > 0 ? `${todayConsumption.toFixed(2)} ${unit}` : `3.07 ${unit}`;
  }

  getCalculatedEstimatedBill(): string {
    console.log('💰 Calculating estimated monthly bill');

    if (!this.hasDevices) {
      const currency = this.translate.instant('dashboard.units.currency');
      return `${currency} 35.20`;
    }

    const weeklyConsumption = this.devices.reduce((total, device) => {
      let deviceConsumption = 0;

      if (device.energyConsumptionValue && device.energyConsumptionValue > 0) {
        deviceConsumption = device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) : 0;
      } else {
        deviceConsumption = this.getEstimatedConsumption(device);
      }

      return total + deviceConsumption;
    }, 0);

    const monthlyConsumption = weeklyConsumption * 4.33;

    let estimatedBill = 0;
    if (monthlyConsumption <= 100) {
      estimatedBill = monthlyConsumption * 0.4087;
    } else if (monthlyConsumption <= 200) {
      estimatedBill = 100 * 0.4087 + (monthlyConsumption - 100) * 0.5073;
    } else {
      estimatedBill = 100 * 0.4087 + 100 * 0.5073 + (monthlyConsumption - 200) * 0.6208;
    }

    console.log('✅ Estimated monthly bill:', estimatedBill, 'PEN');
    const currency = this.translate.instant('dashboard.units.currency');
    return estimatedBill > 0 ? `${currency} ${estimatedBill.toFixed(2)}` : `${currency} 35.20`;
  }

  getCalculatedActiveDevices(): string {
    console.log('🔌 Calculating active devices for user');

    if (!this.hasDevices) {
      console.log('⚠️ No devices found for user');
      return `0 ${this.translate.instant('dashboard.stats.active')} / 3 ${this.devicesLabel}`;
    }

    const activeDevicesCount = this.devices.filter(device => device.isActive).length;
    const totalDevicesCount = this.devices.length;

    console.log('🔌 Active devices count:', activeDevicesCount, '/ Total:', totalDevicesCount);

    return `${activeDevicesCount} ${this.translate.instant('dashboard.stats.active')} / ${totalDevicesCount} ${this.devicesLabel}`;
  }

  getCalculatedSavings(): string {
    console.log('💡 Calculating savings');

    if (!this.hasDevices) {
      const percentSymbol = this.translate.instant('dashboard.units.percentage');
      return `5${percentSymbol} ${this.translate.instant('dashboard.stats.saved')}`;
    }

    const totalConsumption = this.devices.reduce((total, device) => {
      if (device.energyConsumptionValue) {
        return total + device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        const value = match ? parseFloat(match[1]) : 0;
        return total + value;
      }
      return total;
    }, 0);

    const efficientDevices = this.devices.filter(device =>
      device.category === 'Electronics' || device.status === DeviceStatus.STANDBY
    ).length;

    const savingsPercentage = totalConsumption > 0 ?
      Math.round((efficientDevices / this.devices.length) * 20 - 10) : 5;

    const percentSymbol = this.translate.instant('dashboard.units.percentage');

    if (savingsPercentage < 0) {
      return `${Math.abs(savingsPercentage)}${percentSymbol} ${this.translate.instant('dashboard.stats.extraConsumption')}`;
    }

    if (savingsPercentage === 0) {
      return this.translate.instant('dashboard.stats.noSavings');
    }

    return `${savingsPercentage}${percentSymbol} ${this.translate.instant('dashboard.stats.saved')}`;
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

  get hasDevices(): boolean {
    const hasDevices = this.devices && this.devices.length > 0;
    console.log('🔌 hasDevices check:', hasDevices, '- Device count:', this.devices?.length || 0);
    return hasDevices;
  }

  get hasConsumptionData(): boolean {
    return this.dailyConsumption?.dataPoints ? this.dailyConsumption.dataPoints.length > 0 : false;
  }

  get hasCategoryData(): boolean {
    return this.consumptionByCategory?.categories ? this.consumptionByCategory.categories.length > 0 : false;
  }

  get hasMonthlyData(): boolean {
    return this.monthlyComparison?.months ? this.monthlyComparison.months.length > 0 : false;
  }

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

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
