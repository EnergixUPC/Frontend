import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Device } from '../../../domain/model/device.entity';

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

  // Getter para mostrar solo los primeros 3 dispositivos
  get limitedDevices(): Device[] {
    return this.devices.slice(0, 3);
  }

  getCategoryText(category: string): string {
    // Debug más detallado
    console.log('=== DEBUG CATEGORY TRANSLATION ===');
    console.log('Input category:', category);
    console.log('Current language:', this.translate.currentLang);
    console.log('Default language:', this.translate.defaultLang);

    // Transformar "Heating & Cooling" a "heating_cooling"
    const categoryKey = category.toLowerCase()
      .replace(/\s*&\s*/g, '_')  // Reemplazar " & " con "_"
      .replace(/\s+/g, '_');     // Reemplazar espacios con "_"

    console.log('Generated key:', categoryKey);

    const translationKey = `dashboard.devices.categories.${categoryKey}`;
    console.log('Full translation key:', translationKey);

    const translated = this.translate.instant(translationKey);
    console.log('Translation result:', translated);
    console.log('Translation matches key?', translated === translationKey);

    // Probar traducción directa para debugging
    const directTest = this.translate.instant('dashboard.devices.categories.heating_cooling');
    console.log('Direct test heating_cooling:', directTest);

    console.log('=== END DEBUG ===');

    return translated !== translationKey ? translated : category;
  }

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
    if (device.isActive) {
      return 'status-active';
    }
    return 'status-inactive';
  }

  getStatusText(device: Device): string {
    if (device.isActive) {
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

  get devicesTitleLabel(): string {
    return this.translate.instant('dashboard.devices.title');
  }

  get noDevicesLabel(): string {
    return this.translate.instant('dashboard.devices.noDevices');
  }
}
