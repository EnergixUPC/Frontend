import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportService } from '../../../application/services/report.service';

interface DeviceData {
  nameKey: string;
  displayName: string;
  consumption: number;
  color: string;
  percentage: number;
  deviceType?: string;
  deviceCategory?: string;
  deviceId?: number;
  period?: string;
}

@Component({
  selector: 'app-device-chart',
  imports: [CommonModule, TranslateModule],
  templateUrl: './device-chart.html',
  styleUrl: './device-chart.css'
})
export class DeviceChart implements OnInit {
  devices: DeviceData[] = [];
  maxConsumption: number = 0;
  totalConsumption: number = 0;
  topThreePercentage: number = 55;
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private translate: TranslateService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Ensure component is fully initialized
    setTimeout(() => {
      this.loadDeviceData();
    }, 100);
  }

  loadDeviceData(): void {
    this.isLoading = true;
    this.hasError = false;

    console.log('Loading top devices data...');

    this.reportService.getTopDevices().subscribe({
      next: (devices: any[]) => {
        console.log('Devices data received:', devices);

        if (!Array.isArray(devices)) {
          console.warn('Data is not an array:', devices);
          this.devices = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        if (devices.length === 0) {
          console.log('No devices available');
          this.devices = [];
        } else {
          // Convert backend devices to chart data
          this.devices = devices.slice(0, 3).map((device, index) => ({
            nameKey: this.getDeviceNameKey(device.deviceName),
            displayName: device.deviceName,
            consumption: device.totalConsumption,
            color: this.getDeviceColor(index),
            percentage: 0, // Will be calculated later
            deviceType: device.deviceType,
            deviceCategory: device.deviceCategory,
            deviceId: device.deviceId,
            period: device.period
          }));

          console.log('Processed devices:', this.devices);

          this.calculateMetrics();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading devices data:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('URL:', error.url);

        let errorMessage = 'No se pudieron cargar los datos';

        if (error.status === 401) {
          errorMessage = 'Authentication error. Please login again.';
          console.error('Error 401: User not authenticated');
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para acceder a estos datos.';
        } else if (error.status === 404) {
          errorMessage = 'No se encontraron dispositivos para este usuario.';
        } else if (error.status === 0) {
          errorMessage = 'Connection error. Check your internet connection.';
        }

        this.devices = [];
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = `Error ${error.status}: ${errorMessage}`;
        this.cdr.detectChanges();
      }
    });
  }

  private getDeviceColor(index: number): string {
    const colors = ['#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6'];
    return colors[index % colors.length];
  }

  private getDeviceNameKey(deviceName: string): string {
    const nameKeyMapping: { [key: string]: string } = {
      // English names
      'Refrigerator': 'refrigerator',
      'Air Conditioner': 'airConditioning',
      'TV': 'tv',
      'Laptop': 'laptop',
      'Smart Speaker': 'smartSpeaker',
      'Microwave': 'microwave',
      'Desktop PC': 'desktopPC',
      // Spanish names
      'Refrigerador': 'refrigerator',
      'Aire Acondicionado': 'airConditioning',
      'Televisor': 'tv',

      'Altavoz Inteligente': 'smartSpeaker',
      'Microondas': 'microwave',
      'PC de Escritorio': 'desktopPC'
    };
    return nameKeyMapping[deviceName] || deviceName.toLowerCase().replace(/\s+/g, '');
  }

  private calculateMetrics(): void {
    if (this.devices.length === 0) {
      this.totalConsumption = 0;
      this.maxConsumption = 0;
      this.topThreePercentage = 0;
      return;
    }

    this.totalConsumption = this.devices.reduce((sum, device) => sum + device.consumption, 0);
    this.maxConsumption = Math.max(...this.devices.map(device => device.consumption));

    // Calcular porcentajes
    this.devices.forEach(device => {
      device.percentage = this.totalConsumption > 0 ? (device.consumption / this.totalConsumption) * 100 : 0;
    });

    // Como solo tenemos 3 dispositivos, estos representan el 100% del ranking mostrado
    this.topThreePercentage = 100;

    // Mantener el orden por consumo descendente
    this.devices.sort((a, b) => b.consumption - a.consumption);
  }

  getBarWidth(consumption: number): number {
    if (consumption === 0 || this.maxConsumption === 0) return 0;
    return (consumption / this.maxConsumption) * 100;
  }

  formatConsumption(consumption: number): string {
    return `${consumption} kWh`;
  }

  getXAxisLabels(): number[] {
    // If no max consumption, return default scale
    if (this.maxConsumption === 0) {
      return [0, 1, 2, 3, 4, 5];
    }

    let maxRounded;
    let step;

    // For small values (<= 5), use smaller increments
    if (this.maxConsumption <= 5) {
      maxRounded = Math.ceil(this.maxConsumption);
      step = Math.max(maxRounded / 5, 0.2); // Minimum step of 0.2
    }
    // Para valores medianos (5-20), usar incrementos de 1
    else if (this.maxConsumption <= 20) {
      maxRounded = Math.ceil(this.maxConsumption / 5) * 5;
      step = maxRounded / 5;
    }
    // For large values, use original method
    else {
      maxRounded = Math.ceil(this.maxConsumption / 10) * 10;
      step = maxRounded / 5;
    }

    const labels = [];
    for (let i = 0; i <= 5; i++) {
      const value = i * step;
      // Redondear a 1 decimal para evitar problemas de punto flotante
      labels.push(Math.round(value * 10) / 10);
    }
    return labels;
  }
}
