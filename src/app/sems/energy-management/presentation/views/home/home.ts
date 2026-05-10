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
import { UserWeeklyConsumptionResponse } from '../../../infrastructure/response/dashboard.response';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../application/services/dashboard.service';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';
import { HomeRefreshService } from '../../../../../shared/application/services/home-refresh.service';
import { DevicesService } from '../../../application/services/devices.service';

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
  deviceConsumptions: Record<string, DeviceConsumption[]> = {};
  alerts: any[] = [];
  isLoading = false;
  weeklyConsumption: UserWeeklyConsumptionResponse | null = null;

  private readonly KWH_RATE_SOL = 0.6034;
  private currentUserId: string | null = null;
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
    private homeRefreshService: HomeRefreshService,
    private devicesService: DevicesService
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

        this.currentUserId = currentUser.id;
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
          consumptions
        })),
        catchError(() => of({ deviceId: device.id, consumptions: [] as DeviceConsumption[] }))
      )
    );

    forkJoin(requests)
      .pipe(finalize(() => {
        this.isFetchingConsumptions = false;
        this.lastConsumptionFetchAt = Date.now();
      }))
      .subscribe(results => {
        const consumptionMap: Record<string, DeviceConsumption[]> = {};
        results.forEach(result => {
          consumptionMap[result.deviceId] = result.consumptions;
        });
        this.deviceConsumptions = consumptionMap;
        this.cdr.detectChanges();
      });
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

          if (data.alerts) {
            this.alerts = data.alerts;
          }

          this.dashboardService.getDashboardState()
            .pipe(takeUntil(this.destroy$), take(1))
            .subscribe(state => {
              if (state.stats) {
                this.dashboardStats = state.stats;
              }
            });

          this.devicesService.getAllDevices()
            .pipe(takeUntil(this.destroy$), catchError(() => of([])))
            .subscribe(devices => {
              this.devices = devices;
              this.updateChartData();
              this.loadDeviceConsumptions(this.devices);
              this.cdr.detectChanges();
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

    if (this.currentUserId) {
      this.dashboardService.loadWeeklyConsumption(this.currentUserId)
        .pipe(catchError(() => of(null)))
        .subscribe(data => {
          this.weeklyConsumption = data;
          this.cdr.detectChanges();
        });
    }
  }

  private get weeklyTotalKwh(): number {
    if (!this.weeklyConsumption) return 0;
    return this.weeklyConsumption.deviceTotals.reduce(
      (sum, d) => sum + (d.weeklyConsumptionKwh || 0), 0
    );
  }

  getCalculatedEnergyConsumption(): string {
    const unit = this.translate.instant('dashboard.units.kwh');
    if (this.weeklyConsumption) {
      return `${this.weeklyTotalKwh.toFixed(2)} ${unit}`;
    }
    return `${this.dashboardStats.energyConsumption.toFixed(1)} ${unit}`;
  }

  getEnergyConsumptionSubtitle(): string {
    if (!this.weeklyConsumption) return '';
    const currency = this.translate.instant('dashboard.units.currency');
    const weeklyCost = this.weeklyTotalKwh * this.KWH_RATE_SOL;
    return `${currency} ${weeklyCost.toFixed(2)} esta semana`;
  }

  getCalculatedTodayConsumption(): string {
    const unit = this.translate.instant('dashboard.units.kwh');
    return `${this.dashboardStats.todayConsumption.toFixed(2)} ${unit}`;
  }

  getCalculatedEstimatedBill(): string {
    const currency = this.translate.instant('dashboard.units.currency');
    if (this.weeklyConsumption) {
      const bill = this.getProjectedMonthlyBill();
      return `${currency} ${bill.toFixed(2)}`;
    }
    return `${currency} ${this.dashboardStats.estimatedBill.toFixed(2)}`;
  }

  getEstimatedBillSubtitle(): string {
    if (!this.weeklyConsumption) return '';
    const projected = this.getProjectedMonthlyKwh();
    const unit = this.translate.instant('dashboard.units.kwh');
    return `${projected.toFixed(1)} ${unit} proyectados`;
  }

  private getProjectedMonthlyKwh(): number {
    if (!this.weeklyConsumption) return 0;
    const dailyAvg = this.weeklyTotalKwh / 7;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return dailyAvg * daysInMonth;
  }

  private getProjectedMonthlyBill(): number {
    return this.getProjectedMonthlyKwh() * this.KWH_RATE_SOL;
  }

  getCalculatedActiveDevices(): string {
    const activeCount = this.devices.filter(d => d.status === 'ON' || d.status === 'CHARGING').length;
    const totalCount = this.devices.length;
    return `${activeCount} ${this.translate.instant('dashboard.stats.active')} / ${totalCount} ${this.devicesLabel}`;
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

