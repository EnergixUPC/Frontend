import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Device } from '../../../domain/model/entities/device.entity';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css'
})
export class DeviceList {
  @Input() devices: Device[] = [];

  constructor(private translate: TranslateService) {}

  getDeviceIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Smart Lamp': 'lightbulb',
      'Smart TV': 'tv',
      'Smart Fan': 'air',
      'Other': 'device_hub'
    };
    return iconMap[type] || 'device_hub';
  }

  getDeviceClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'Smart Lamp': 'lamp-icon',
      'Smart TV': 'tv-icon',
      'Smart Fan': 'fan-icon',
      'Other': 'other-icon'
    };
    return classMap[type] || 'other-icon';
  }

  getStatusClass(device: Device): string {
    if (device.isActive()) {
      return 'status-active';
    }
    return 'status-inactive';
  }

  getStatusText(device: Device): string {
    if (device.isActive()) {
      return this.translate.instant('common.status.on');
    } else if (device.lastActive) {
      return `${this.translate.instant('common.status.off')} - ${device.lastActive}`;
    } else {
      return this.translate.instant('common.status.off');
    }
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
