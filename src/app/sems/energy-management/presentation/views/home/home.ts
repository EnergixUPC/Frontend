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
import { AuthService } from '../../../../authentication/application/services/auth.service';

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
  dashboardStats: DashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.'); // Will be updated with translation in ngOnInit

  dailyConsumption?: DailyConsumption;
  consumptionByCategory?: ConsumptionByCategory;
  monthlyComparison?: MonthlyComparison;
  devices: Device[] = [];
  alerts: any[] = [];
  isLoading = false;

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Debug: Check current language
    console.log('Home - ngOnInit. Current language:', this.translate.currentLang);
    console.log('Home - ngOnInit. Translations loaded:', this.translate.instant('dashboard.stats.energyConsumption'));

    // Update initial currency with translation
    this.dashboardStats.currency = this.translate.instant('dashboard.units.currency');

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
    this.isLoading = true;

    // 🔐 Check authentication state
    this.authService.authState$.subscribe(authState => {
      console.log('🔐 Home - Authentication state changed:', authState);

      // If still loading, wait
      if (authState.isLoading) {
        console.log('⏳ Home - Auth still loading, waiting...');
        return;
      }

      if (!authState.isAuthenticated || !authState.user) {
        console.warn('⚠️ Home - User not authenticated, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }

      const currentUser = authState.user;
      console.log('✅ Home - User authenticated - Loading dashboard for user:', currentUser.id, currentUser.email);

      // Load dashboard data using backend endpoints (they filter by authenticated user automatically)
      this.loadBackendData();
    });
  }

  private loadBackendData(): void {
    console.log('📊 Loading unified dashboard data from backend...');

    // 🚀 Load all dashboard data from unified endpoint: /api/v1/dashboard
    this.dashboardService.loadUnifiedDashboard().subscribe({
      next: () => {
        console.log('✅ Unified dashboard data loaded successfully');

        // Subscribe to dashboard state to get the loaded data
        this.dashboardService.getDashboardState().subscribe(state => {
          if (state.stats) {
            this.dashboardStats = state.stats;
            console.log('📊 Dashboard stats:', state.stats);
          }

          if (state.dailyConsumption) {
            this.dailyConsumption = state.dailyConsumption;
            console.log('📅 Daily consumption:', state.dailyConsumption);
          }

          if (state.consumptionByCategory) {
            this.consumptionByCategory = state.consumptionByCategory;
            console.log('🏷️ Category consumption:', state.consumptionByCategory);
          }

          if (state.devices) {
            this.devices = state.devices || [];
            console.log('🔌 Devices from dashboard state:', this.devices.length, 'devices');
            console.log('🔌 Full devices array:', JSON.stringify(this.devices, null, 2));

            // Log device details
            this.devices.forEach((device, index) => {
              console.log(`🔌 Device ${index + 1}:`, {
                id: device.id,
                name: device.name,
                category: device.category,
                type: device.type,
                status: device.status,
                location: device.location,
                isActive: device.isActive
              });
            });
          }

          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 400);
        });

        // 🔌 Cargar dispositivos del endpoint /api/v1/devices como fallback
        console.log('🔌 Loading devices from /api/v1/devices endpoint...');
        this.dashboardService.loadDevices().subscribe({
          next: (devices: Device[]) => {
            console.log('✅ Devices loaded from /api/v1/devices:', devices.length, 'devices');
            console.log('✅ Device details:', devices);
            // Solo usar estos dispositivos si el dashboard no trajo ninguno
            if (this.devices.length === 0) {
              this.devices = devices;
              this.cdr.detectChanges();
            }
          },
          error: (error: any) => {
            console.error('❌ Error loading devices from /api/v1/devices:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('❌ Error loading unified dashboard:', error);
        // Set empty/default data
        this.dashboardStats = new DashboardStats(0, 0, 0, 0, 0, 'S/.');
        this.dailyConsumption = undefined;
        this.consumptionByCategory = undefined;
        this.devices = [];
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 400);
      }
    });

    // Load alerts from backend API for the authenticated user
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

  // Helper methods for handling empty states
  getStatValue(value: number, unit: string): string {
    // If user has no devices, show no data message regardless of backend response
    if (!this.hasDevices || value === 0 || value === null || value === undefined) {
      return this.translate.instant('dashboard.stats.noData');
    }
    return `${value} ${unit}`;
  }

  // Calculate total energy consumption - use backend data if available
  getCalculatedEnergyConsumption(): string {
    // Prefer backend data from unified dashboard
    if (this.dashboardStats && this.dashboardStats.energyConsumption >= 0) {
      console.log('📊 Using monthly saving goal from backend:', this.dashboardStats.energyConsumption);
      return `${this.dashboardStats.energyConsumption.toFixed(1)} kWh`;
    }

    console.log('🔌 Calculating energy consumption for', this.devices.length, 'devices');

    if (!this.hasDevices) {
      console.log('⚠️ No devices found for user');
      return this.translate.instant('dashboard.stats.noData');
    }

    const totalConsumption = this.devices.reduce((total, device) => {
      let deviceConsumption = 0;

      // Get consumption value from device
      if (device.energyConsumptionValue) {
        deviceConsumption = device.energyConsumptionValue;
        console.log(`📊 Device "${device.name}" consumption (numeric):`, deviceConsumption);
      } else if (device.energyConsumption) {
        // Parse the string value (e.g., "2.5 kWh this week" -> 2.5)
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) : 0;
        console.log(`📊 Device "${device.name}" consumption (parsed):`, deviceConsumption, 'from:', device.energyConsumption);
      }

      return total + deviceConsumption;
    }, 0);

    console.log('📊 Total energy consumption calculated:', totalConsumption, 'kWh');

    // Add some context to the consumption display
    if (totalConsumption > 0) {
      const activeDevices = this.devices.filter(d => d.isActive).length;
      const period = this.translate.instant('dashboard.stats.weeklyPeriod');
      const unit = this.translate.instant('dashboard.units.kwh');
      return `${totalConsumption.toFixed(1)} ${unit} ${period}`;
    }

    return this.translate.instant('dashboard.stats.noData');
  }

  // Calculate estimated monthly bill - use backend data if available
  getCalculatedEstimatedBill(): string {
    // Prefer backend data from unified dashboard
    if (this.dashboardStats && this.dashboardStats.estimatedBill >= 0) {
      console.log('💰 Using estimated bill from backend:', this.dashboardStats.estimatedBill);
      const currency = this.dashboardStats.currency || 'S/.';
      return `${currency} ${this.dashboardStats.estimatedBill.toFixed(2)}`;
    }

    if (!this.hasDevices) {
      return this.translate.instant('dashboard.stats.noData');
    }

    // Calculate weekly consumption
    const weeklyConsumption = this.devices.reduce((total, device) => {
      let deviceConsumption = 0;
      if (device.energyConsumptionValue) {
        deviceConsumption = device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) : 0;
      }
      return total + deviceConsumption;
    }, 0);

    // Convert to monthly consumption (4.33 weeks per month on average)
    const monthlyConsumption = weeklyConsumption * 4.33;

    // Tarifa escalonada más realista para Perú
    let estimatedBill = 0;
    if (monthlyConsumption <= 100) {
      // Tarifa social: primeros 100 kWh
      estimatedBill = monthlyConsumption * 0.4087;
    } else if (monthlyConsumption <= 200) {
      // Tarifa residencial: 101-200 kWh
      estimatedBill = 100 * 0.4087 + (monthlyConsumption - 100) * 0.5073;
    } else {
      // Tarifa alta: más de 200 kWh
      estimatedBill = 100 * 0.4087 + 100 * 0.5073 + (monthlyConsumption - 200) * 0.6208;
    }

    const currency = this.translate.instant('dashboard.units.currency');
    return estimatedBill > 0 ? `${currency} ${estimatedBill.toFixed(2)}` : this.translate.instant('dashboard.stats.noData');
  }

  // Calculate today's consumption - use backend data if available
  getCalculatedTodayConsumption(): string {
    // Prefer backend data from unified dashboard
    if (this.dashboardStats && this.dashboardStats.todayConsumption >= 0) {
      console.log('📅 Using today consumption from backend:', this.dashboardStats.todayConsumption);
      return `${this.dashboardStats.todayConsumption.toFixed(2)} kWh`;
    }

    if (!this.hasDevices) {
      return this.translate.instant('dashboard.stats.noData');
    }

    const todayConsumption = this.devices.reduce((total, device) => {
      // Parse device consumption
      let deviceConsumption = 0;
      if (device.energyConsumptionValue) {
        deviceConsumption = device.energyConsumptionValue;
      } else if (device.energyConsumption) {
        const match = device.energyConsumption.match(/(\d+\.?\d*)/);
        deviceConsumption = match ? parseFloat(match[1]) : 0;
      }

      if (deviceConsumption === 0) return total;

      // Calculate daily consumption based on device characteristics
      let dailyFactor = 0;

      // Base factor depending on device category
      switch (device.category) {
        case 'Major Appliances': // Refrigerador, etc. - funcionan 24/7
          dailyFactor = 1.0; // 100% del consumo diario
          break;
        case 'Heating & Cooling': // Aire acondicionado - uso intermitente
          dailyFactor = 0.4; // 40% del tiempo (unas 10 horas al día)
          break;
        case 'Electronics': // TV, laptops - uso moderado
          dailyFactor = 0.25; // 25% del tiempo (unas 6 horas al día)
          break;
        default: // Otros dispositivos
          dailyFactor = 0.2; // 20% del tiempo (unas 5 horas al día)
          break;
      }

      // Adjust factor based on device status
      if (device.isActive) {
        // Device is currently active
        if (device.status === DeviceStatus.ON) {
          dailyFactor *= 1.2; // 20% more consumption when actively on
        } else if (device.status === DeviceStatus.STANDBY) {
          dailyFactor *= 0.3; // Standby uses much less power
        }
      } else {
        // Device is currently inactive
        dailyFactor *= 0.1; // Very minimal consumption when off
      }

      // Calculate daily consumption: weekly consumption * daily factor / 7 days
      const deviceDailyConsumption = (deviceConsumption * dailyFactor) / 7;

      return total + deviceDailyConsumption;
    }, 0);

    const unit = this.translate.instant('dashboard.units.kwh');
    return todayConsumption > 0 ? `${todayConsumption.toFixed(2)} ${unit}` : this.translate.instant('dashboard.stats.noData');
  }
  // Calculate active devices count - use backend data if available
  getCalculatedActiveDevices(): string {
    console.log('🔌 Calculating active devices for user');

    // Prefer backend data from unified dashboard
    if (this.dashboardStats && this.dashboardStats.activeDevices >= 0) {
      const activeCount = this.dashboardStats.activeDevices;
      const totalCount = this.devices.length || activeCount;
      console.log('🔌 Using active devices from backend:', activeCount, '/', totalCount);
      return `${activeCount} ${this.translate.instant('dashboard.stats.active')} / ${totalCount} ${this.devicesLabel}`;
    }

    if (!this.hasDevices) {
      console.log('⚠️ No devices found for user - showing no devices message');
      return this.translate.instant('dashboard.stats.noDevices');
    }

    const activeDevicesCount = this.devices.filter(device => {
      console.log(`🔌 Device "${device.name}" - isActive:`, device.isActive, 'status:', device.status);
      return device.isActive;
    }).length;
    const totalDevicesCount = this.devices.length;

    console.log('🔌 Active devices count:', activeDevicesCount, '/ Total:', totalDevicesCount);

    return `${activeDevicesCount} ${this.translate.instant('dashboard.stats.active')} / ${totalDevicesCount} ${this.devicesLabel}`;
  }

  // Calculate savings - use backend data if available
  getCalculatedSavings(): string {
    // Prefer backend data from unified dashboard
    if (this.dashboardStats) {
      const savings = this.dashboardStats.estimatedSavings;
      console.log('💰 Using estimated savings from backend:', savings);
      return `${savings.toFixed(1)}%`;
    }

    if (!this.hasDevices) {
      return this.translate.instant('dashboard.stats.noData');
    }

    // Calculate savings based on device efficiency (example calculation)
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

    // Example: Calculate savings based on number of efficient devices vs total consumption
    const efficientDevices = this.devices.filter(device =>
      device.category === 'Electronics' || device.status === DeviceStatus.STANDBY
    ).length;

    const savingsPercentage = totalConsumption > 0 ?
      Math.round((efficientDevices / this.devices.length) * 20 - 10) : 0; // Example calculation

    // Handle negative savings (extra consumption)
    const percentSymbol = this.translate.instant('dashboard.units.percentage');
    if (savingsPercentage < 0) {
      return `${Math.abs(savingsPercentage)}${percentSymbol} ${this.translate.instant('dashboard.stats.extraConsumption')}`;
    }

    // Handle zero or positive savings
    if (savingsPercentage === 0) {
      return this.translate.instant('dashboard.stats.noSavings');
    }

    const percent = this.translate.instant('dashboard.units.percentage');
    return `${savingsPercentage}${percent} ${this.translate.instant('dashboard.stats.saved')}`;
  }

  getDeviceStatValue(count: number): string {
    if (count === 0 || count === null || count === undefined) {
      return this.translate.instant('dashboard.stats.noDevices');
    }
    return `${count} ${this.devicesLabel}`;
  }

  getCurrencyStatValue(amount: number, currency: string): string {
    // If user has no devices, show no data message regardless of backend response
    if (!this.hasDevices || amount === 0 || amount === null || amount === undefined) {
      return this.translate.instant('dashboard.stats.noData');
    }
    return `${currency} ${amount}`;
  }

  getSavingsValue(value: number): string {
    // If user has no devices, show no data message regardless of backend response
    if (!this.hasDevices) {
      return this.translate.instant('dashboard.stats.noData');
    }

    // Calculate savings based on device efficiency (example calculation)
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

    // Example: Calculate savings based on number of efficient devices vs total consumption
    const efficientDevices = this.devices.filter(device =>
      device.category === 'Electronics' || device.status === DeviceStatus.STANDBY
    ).length;

    const savingsPercentage = totalConsumption > 0 ?
      Math.round((efficientDevices / this.devices.length) * 20 - 10) : 0; // Example calculation

    // Handle negative savings (extra consumption)
    const percentSymbol = this.translate.instant('dashboard.units.percentage');

    // Handle negative savings (extra consumption)
    if (savingsPercentage < 0) {
      return `${Math.abs(savingsPercentage)}${percentSymbol} ${this.translate.instant('dashboard.stats.extraConsumption')}`;
    }

    // Handle zero or positive savings
    if (savingsPercentage === 0) {
      return this.translate.instant('dashboard.stats.noSavings');
    }

    return `${savingsPercentage}${percentSymbol} ${this.translate.instant('dashboard.stats.saved')}`;
  }

  get hasDevices(): boolean {
    const hasDevices = this.devices && this.devices.length > 0;
    console.log('🔌 hasDevices check:', hasDevices, '- Device count:', this.devices?.length || 0);
    if (hasDevices) {
      console.log('🔌 Devices:', this.devices.map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        location: d.location,
        type: d.type,
        status: d.status
      })));
    }
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
}
