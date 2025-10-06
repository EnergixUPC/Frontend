import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { Device } from '../device.entity';

export interface DeviceRepository {
  getAllDevices(): Observable<Device[]>;
  getDeviceById(id: string): Observable<Device | null>;
  getDevicesByStatus(status: string): Observable<Device[]>;
  getDevicesByCategory(category: string): Observable<Device[]>;
  updateDevice(device: Device): Observable<Device>;
  deleteDevice(id: string): Observable<boolean>;
}

export const DEVICE_REPOSITORY_TOKEN = new InjectionToken<DeviceRepository>('DeviceRepository');