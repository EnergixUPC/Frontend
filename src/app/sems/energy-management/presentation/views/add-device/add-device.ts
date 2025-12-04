import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DevicesService } from '../../../application/services/devices.service';
import { Device, DeviceStatus } from '../../../domain/model/device.entity';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-device.html',
  styleUrl: './add-device.css'
})
export class AddDevice {
  device: Partial<Device> = {
    id: '',
    name: '',
    category: '',
    type: '',
    brand: '',
    model: '',
    status: DeviceStatus.OFF,
    realTimeStatus: 'Off',
    lastActive: 'Now',
    location: '',
    isActive: 0
  };

  saving = false;
  error: string | null = null;

  constructor(
    private readonly devicesService: DevicesService,
    private readonly router: Router,
    private readonly translateService: TranslateService
  ) {}

  get isActive(): boolean {
    return this.device.isActive === 1;
  }

  set isActive(value: boolean) {
    this.device.isActive = value ? 1 : 0;
  }

  get titleText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceTitle');
  }

  get saveText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceSave');
  }

  get cancelText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceCancel');
  }

  onCancel(): void {
    this.router.navigate(['/devices']);
  }

  onSave(): void {
    // Basic validation
    if (!this.device.name || !this.device.category || !this.device.type) {
      this.error = this.translateService.instant('dashboard.devices.addDeviceValidation');
      return;
    }

    this.saving = true;
    this.error = null;

    // Ensure id: try to use timestamp if none provided
    const newDevice: Device = {
      id: this.device.id && this.device.id.toString() || Date.now().toString(),
      name: this.device.name as string,
      category: this.device.category as string,
      type: (this.device.type as string) || 'UNKNOWN',
      brand: '',
      model: '',
      status: (this.device.status as any) || 'OFF',
      realTimeStatus: (this.device.realTimeStatus as string) || 'Off',
      lastActive: (this.device.lastActive as string) || 'Now',
      location: (this.device.location as string) || '',
      isActive: this.device.isActive ? 1 : 0
    };

    console.log('AddDevice - Attempting to create device:', newDevice);

    this.devicesService.createDevice(newDevice).subscribe({
      next: (createdDevice) => {
        console.log('AddDevice - Device created successfully:', createdDevice);
        this.saving = false;
        // Navigate back to devices list (which will reload from API)
        this.router.navigate(['/devices']);
      },
      error: (err: any) => {
        console.error('AddDevice - Error creating device:', err);
        this.saving = false;
        this.error = this.translateService.instant('dashboard.devices.addDeviceError');
      }
    });
  }
}
