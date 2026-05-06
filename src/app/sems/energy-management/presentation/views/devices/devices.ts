import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Device } from '../../../domain/model/device.entity';
import { DashboardService } from '../../../application/services/dashboard.service';
import { DevicesService } from '../../../application/services/devices.service';
import { AuthControllerService } from '../../../../authentication/application/services/auth-controller.service';

@Component({
  selector: 'app-devices',
  imports: [CommonModule, TranslateModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css'
})
export class Devices implements OnInit, OnDestroy {
  devices: Device[] = [];
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly devicesService: DevicesService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authController: AuthControllerService
  ) {}

  ngOnInit(): void {
    const isAuthenticated = this.authController.isAuthenticated();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    this.cdr.detectChanges();
    this.loadDevices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDevices(): void {
    this.loading = true;
    this.dashboardService.loadUnifiedDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dashboardService.getDashboardState()
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
              setTimeout(() => {
                this.devices = state.devices || [];
                this.loading = false;
                this.cdr.detectChanges();
              }, 50);
            });
        },
        error: () => {
          setTimeout(() => {
            this.error = 'Error loading devices';
            this.loading = false;
            this.cdr.detectChanges();
          }, 50);
        }
      });
  }

  get myDevicesText(): string {
    return this.translateService.instant('dashboard.devices.myDevices');
  }

  get addDeviceText(): string {
    return this.translateService.instant('dashboard.devices.addDevice');
  }

  get noDevicesText(): string {
    return this.translateService.instant('dashboard.devices.noDevices');
  }

  getStatusText(status: string): string {
    if (!status) return 'N/A';
    switch (status.toLowerCase()) {
      case 'on': return this.translateService.instant('dashboard.devices.status.on');
      case 'off': return this.translateService.instant('dashboard.devices.status.off');
      case 'standby': return this.translateService.instant('dashboard.devices.status.standby');
      case 'charging': return this.translateService.instant('dashboard.devices.status.charging');
      default: return status;
    }
  }

  getCategoryText(category: string): string {
    if (!category) return 'N/A';
    const categoryKey = category.toLowerCase()
      .replace(/\s*&\s*/g, '_')
      .replace(/\s+/g, '_');
    const translationKey = `dashboard.devices.categories.${categoryKey}`;
    const translated = this.translateService.instant(translationKey);
    return translated !== translationKey ? translated : category;
  }

  goToAddDevice(): void {
    this.router.navigate(['/devices/add']);
  }

  deleteDevice(deviceId: string, deviceName: string): void {
    const confirmed = confirm(
      this.translateService.instant('dashboard.devices.deleteConfirmation', { name: deviceName })
    );
    if (!confirmed) return;

    this.devicesService.deleteDevice(deviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            this.loadDevices();
          } else {
            alert(this.translateService.instant('dashboard.devices.deleteError'));
          }
        },
        error: () => {
          alert(this.translateService.instant('dashboard.devices.deleteError'));
        }
      });
  }
}
