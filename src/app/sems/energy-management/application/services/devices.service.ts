import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Device } from '../../domain/model/device.entity';
import { DeviceRepository, DEVICE_REPOSITORY_TOKEN } from '../../domain/model/repositories/device.repository';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  constructor(@Inject(DEVICE_REPOSITORY_TOKEN) private readonly deviceRepository: DeviceRepository) {}

  getAllDevices(): Observable<Device[]> {
    return this.deviceRepository.getAllDevices();
  }

  getDeviceById(id: string): Observable<Device | null> {
    return this.deviceRepository.getDeviceById(id);
  }

  getActiveDevices(): Observable<Device[]> {
    return this.deviceRepository.getDevicesByStatus('ON');
  }

  getDevicesByCategory(category: string): Observable<Device[]> {
    return this.deviceRepository.getDevicesByCategory(category);
  }

  updateDevice(device: Device): Observable<Device> {
    return this.deviceRepository.updateDevice(device);
  }

  createDevice(device: Device): Observable<Device> {
    return this.deviceRepository.createDevice(device);
  }

  deleteDevice(id: string): Observable<boolean> {
    return this.deviceRepository.deleteDevice(id);
  }
}