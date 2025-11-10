import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Device } from '../../../domain/model/device.entity';
import { DevicesService } from '../../../application/services/devices.service';

@Component({
  selector: 'app-devices',
  imports: [CommonModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css'
})
export class Devices implements OnInit, OnDestroy {
  devices: Device[] = [];
  loading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private readonly devicesService: DevicesService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Force change detection
    this.cdr.detectChanges();
    this.loadDevices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDevices(): void {
    this.loading = true;
    this.devicesService.getAllDevices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (devices) => {
          this.devices = devices;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading devices:', error);
          this.error = 'Error loading devices';
          this.loading = false;
        }
      });
  }

  // Getters para las traducciones
  get myDevicesText(): string {
    return this.translateService.instant('dashboard.devices.myDevices');
  }

  get preferencesText(): string {
    return this.translateService.instant('dashboard.devices.preferences');
  }

  get addDeviceText(): string {
    return this.translateService.instant('dashboard.devices.addDevice');
  }

  get realTimeStatusText(): string {
    return this.translateService.instant('dashboard.devices.realTimeStatus');
  }

  get lastActiveText(): string {
    return this.translateService.instant('dashboard.devices.lastActive');
  }

  get alertHistoryText(): string {
    return this.translateService.instant('dashboard.devices.alertHistory');
  }

  get energyConsumptionText(): string {
    return this.translateService.instant('dashboard.devices.energyConsumption');
  }

  get noDevicesText(): string {
    return this.translateService.instant('dashboard.devices.noDevices');
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'on':
        return this.translateService.instant('dashboard.devices.status.on');
      case 'off':
        return this.translateService.instant('dashboard.devices.status.off');
      case 'standby':
        return this.translateService.instant('dashboard.devices.status.standby');
      case 'charging':
        return this.translateService.instant('dashboard.devices.status.charging');
      default:
        return status;
    }
  }

  getCategoryText(category: string): string {
    // Debug: Ver qué categoría está llegando
    console.log('Category received in devices:', category);
    
    // Convertir "Heating & Cooling" a "heating_cooling"
    const categoryKey = category.toLowerCase()
      .replace(/\s*&\s*/g, '_')  // Reemplazar " & " con "_"
      .replace(/\s+/g, '_');     // Reemplazar espacios con "_"
    
    console.log('Category key generated:', categoryKey);
    
    const translationKey = `dashboard.devices.categories.${categoryKey}`;
    const translated = this.translateService.instant(translationKey);
    
    console.log('Translation result:', translated);
    
    // Si la traducción devuelve la misma clave, significa que no encontró la traducción
    return translated !== translationKey ? translated : category;
  }

  getAlertText(alert: string): string {
    if (alert.toLowerCase().includes('no alert')) {
      return this.translateService.instant('dashboard.devices.alerts.noAlerts');
    }
    if (alert.toLowerCase().includes('phantom load')) {
      return this.translateService.instant('dashboard.devices.alerts.phantomLoad');
    }
    return alert;
  }

  goToPreferences(): void {
    this.router.navigate(['/device-preferences']);
  }

  goToAddDevice(): void {
    this.router.navigate(['/devices/add']);
  }

  deleteDevice(deviceId: string, deviceName: string): void {
    const confirmed = confirm(
      this.translateService.instant('dashboard.devices.deleteConfirmation', { name: deviceName })
    );
    
    if (confirmed) {
      this.devicesService.deleteDevice(deviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              // Reload the devices list
              this.loadDevices();
            } else {
              alert(this.translateService.instant('dashboard.devices.deleteError'));
            }
          },
          error: (error: any) => {
            console.error('Error deleting device:', error);
            alert(this.translateService.instant('dashboard.devices.deleteError'));
          }
        });
    }
  }
}
