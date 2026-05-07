import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, filter, takeUntil, forkJoin, of, map, catchError, finalize, take } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { StatsCard } from '../../components/stats-card/stats-card';
import { ConsumptionChart } from '../../components/consumption-chart/consumption-chart';
import { DeviceList } from '../../components/device-list/device-list';
import { Device } from '../../../domain/model/device.entity';
import { DeviceConsumption } from '../../../domain/model/entities/device-consumption.entity';
import { DashboardStats } from '../../../domain/model/entities/dashboard-stats.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../application/services/dashboard.service';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';
import { HomeRefreshService } from '../../../../../shared/application/services/home-refresh.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    TranslateModule,
    StatsCard,
    ConsumptionChart,
    DeviceList,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  dashboardStats: DashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');
  devices: Device[] = [];
  deviceConsumptions: Record<string, DeviceConsumptionSummary> = {};
  alerts: any[] = [];
  isLoading = false;

  private readonly destroy$ = new Subject<void>();
  private isLoadingBackend = false;
  private isFetchingConsumptions = false;
  private lastConsumptionFetchAt = 0;
  private lastConsumptionDeviceKey = '';
  private readonly consumptionRefreshMs = 60000;

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private mockDataService: MockDataService,
    private homeRefreshService: HomeRefreshService
  ) { }

  ngOnInit(): void {
    console.log('Home - ngOnInit. Current language:', this.translate.currentLang);

    this.dashboardStats.currency = this.translate.instant('dashboard.units.currency');
    this.cdr.detectChanges();

    this.loadDashboardData();

    this.homeRefreshService.onRefresh()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Home - refresh requested by menu click');
        this.loadDashboardData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    this.authService.authState$
      .pipe(
        takeUntil(this.destroy$),
        filter(authState => !authState.isLoading),
        take(1)
      )
      .subscribe(authState => {
        console.log('Home - Authentication state changed:', authState);

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
    console.log('Updating all dashboard data');

    if (!this.devices || this.devices.length === 0) {
      console.warn('No devices available for calculations');
      return;
    }

    console.log('Recalculating stats from', this.devices.length, 'devices');

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

  private loadDeviceConsumptions(devices: Device[]): void {
    if (!devices || devices.length === 0) {
      this.deviceConsumptions = {};
      return;
    }

    const deviceIdsKey = devices.map(device => device.id).sort().join('|');
    const now = Date.now();
    const hasRecentData = deviceIdsKey === this.lastConsumptionDeviceKey
      && Object.keys(this.deviceConsumptions).length > 0
      && (now - this.lastConsumptionFetchAt) < this.consumptionRefreshMs;

    if (this.isFetchingConsumptions || hasRecentData) {
      return;
    }

    this.isFetchingConsumptions = true;
    this.lastConsumptionDeviceKey = deviceIdsKey;

    const requests = devices.map(device =>
      this.dashboardService.loadDeviceConsumptions(device.id).pipe(
        map(consumptions => ({
          deviceId: device.id,
          summary: this.toConsumptionSummary(consumptions)
        })),
        catchError(() => of({ deviceId: device.id, summary: {} as DeviceConsumptionSummary }))
      )
    );

    forkJoin(requests)
      .pipe(finalize(() => {
        this.isFetchingConsumptions = false;
        this.lastConsumptionFetchAt = Date.now();
      }))
      .subscribe(results => {
        const consumptionMap: Record<string, DeviceConsumptionSummary> = {};
        results.forEach(result => {
          consumptionMap[result.deviceId] = result.summary;
        });
        this.deviceConsumptions = consumptionMap;
        this.cdr.detectChanges();
      });
  }

  private toConsumptionSummary(consumptions: DeviceConsumption[]): DeviceConsumptionSummary {
    return consumptions.reduce<DeviceConsumptionSummary>((summary, item) => {
      if (item.period === 'daily') {
        summary.daily = item.consumption;
      }
      if (item.period === 'weekly') {
        summary.weekly = item.consumption;
      }
      if (item.period === 'monthly') {
        summary.monthly = item.consumption;
      }
      return summary;
    }, {});
  }

  private loadBackendData(): void {
    if (this.isLoadingBackend) {
      return;
    }

    this.isLoadingBackend = true;
    console.log('Loading unified dashboard data from backend...');

    this.dashboardService.loadUnifiedDashboard()
      .pipe(finalize(() => {
        this.isLoadingBackend = false;
        this.isLoading = false;
      }))
      .subscribe({
        next: (data) => {
          console.log('Unified dashboard data loaded successfully');

          // Update alerts from unified response
          if (data.alerts) {
            this.alerts = data.alerts;
            console.log('Alerts loaded from unified dashboard:', this.alerts);
          }

          this.dashboardService.getDashboardState()
            .pipe(takeUntil(this.destroy$), take(1))
            .subscribe(state => {
              if (state.stats) {
                this.dashboardStats = state.stats;
                console.log('Dashboard stats:', state.stats);
              }

              if (state.devices) {
                this.devices = state.devices || [];
                console.log('Devices loaded from unified dashboard:', this.devices.length);
                this.updateChartData();
                this.loadDeviceConsumptions(this.devices);
              }
            });
        },
        error: (error: any) => {
          console.error('Error loading dashboard:', error);
          this.dashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');
          this.devices = [];
          this.deviceConsumptions = {};
          this.alerts = [];

          setTimeout(() => {
            this.cdr.detectChanges();
          }, 50);
        }
      });
  }

  getCalculatedEnergyConsumption(): string {
    console.log('Getting energy consumption from API:', this.dashboardStats.energyConsumption);
    const unit = this.translate.instant('dashboard.units.kwh');
    return `${this.dashboardStats.energyConsumption.toFixed(1)} ${unit}`;
  }

  getCalculatedTodayConsumption(): string {
    console.log('Getting today consumption from API:', this.dashboardStats.todayConsumption);
    const unit = this.translate.instant('dashboard.units.kwh');
    return `${this.dashboardStats.todayConsumption.toFixed(2)} ${unit}`;
  }

  getCalculatedEstimatedBill(): string {
    console.log('Getting estimated bill from API:', this.dashboardStats.estimatedBill);
    const currency = this.translate.instant('dashboard.units.currency');
    return `${currency} ${this.dashboardStats.estimatedBill.toFixed(2)}`;
  }

  getCalculatedActiveDevices(): string {
    console.log('Getting active devices from API:', this.dashboardStats.activeDevices);
    const totalDevicesCount = this.devices.length || this.dashboardStats.activeDevices;
    return `${this.dashboardStats.activeDevices} ${this.translate.instant('dashboard.stats.active')} / ${totalDevicesCount} ${this.devicesLabel}`;
  }

  getCalculatedSavings(): string {
    console.log('Getting savings from API:', this.dashboardStats.estimatedSavings);
    const percentSymbol = this.translate.instant('dashboard.units.percentage');
    const savingsValue = this.dashboardStats.estimatedSavings;

    if (savingsValue < 0) {
      return `${Math.abs(savingsValue)}${percentSymbol} ${this.translate.instant('dashboard.stats.extraConsumption')}`;
    }

    if (savingsValue === 0) {
      return this.translate.instant('dashboard.stats.noSavings');
    }

    return `${savingsValue}${percentSymbol} ${this.translate.instant('dashboard.stats.saved')}`;
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
    console.log('hasDevices check:', hasDevices, '- Device count:', this.devices?.length || 0);
    return hasDevices;
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

interface DeviceConsumptionSummary {
  daily?: number;
  weekly?: number;
  monthly?: number;
}
