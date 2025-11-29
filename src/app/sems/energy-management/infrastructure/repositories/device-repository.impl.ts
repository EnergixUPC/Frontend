import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Device, DeviceStatus } from '../../domain/model/device.entity';
import { DeviceRepository } from '../../domain/model/repositories/device.repository';
import { environment } from '../../../../../environments/environments';

// DTO para la comunicación con la API
export interface DeviceResponse {
  id: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  status: string;
  realTimeStatus: string;
  lastActive: string;
  alertHistory?: string;
  energyConsumption?: string;
  location: string;
  isActive: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceRepositoryImpl implements DeviceRepository {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/devices`;

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllDevices(): Observable<Device[]> {
    return this.http.get<DeviceResponse[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map((responses: DeviceResponse[]) => responses.map((response: DeviceResponse) => this.mapToDevice(response))),
        catchError(() => of([]))
      );
  }

  getDeviceById(id: string): Observable<Device | null> {
    return this.http.get<DeviceResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map((response: DeviceResponse) => this.mapToDevice(response)),
        catchError(() => of(null))
      );
  }

  getDevicesByStatus(status: string): Observable<Device[]> {
    const endpoint = status === 'active' ? `${this.apiUrl}/active` : `${this.apiUrl}?status=${status}`;
    return this.http.get<DeviceResponse[]>(endpoint, { headers: this.getHeaders() })
      .pipe(
        map((responses: DeviceResponse[]) => responses.map((response: DeviceResponse) => this.mapToDevice(response))),
        catchError(() => of([]))
      );
  }

  getDevicesByCategory(category: string): Observable<Device[]> {
    return this.http.get<DeviceResponse[]>(`${this.apiUrl}/category/${category}`, { headers: this.getHeaders() })
      .pipe(
        map((responses: DeviceResponse[]) => responses.map((response: DeviceResponse) => this.mapToDevice(response))),
        catchError(() => of([]))
      );
  }

  updateDevice(device: Device): Observable<Device> {
    const deviceDto = this.mapToDeviceResponse(device);
    return this.http.put<DeviceResponse>(`${this.apiUrl}/${device.id}`, deviceDto, { headers: this.getHeaders() })
      .pipe(
        map((response: DeviceResponse) => this.mapToDevice(response))
      );
  }

  createDevice(device: Device): Observable<Device> {
    const deviceDto = this.mapToDeviceResponse(device);
    // If the fake API (json-server) expects numeric ids, server may assign one. We keep id if provided.
    return this.http.post<DeviceResponse>(this.apiUrl, deviceDto, { headers: this.getHeaders() })
      .pipe(
        map((response: DeviceResponse) => this.mapToDevice(response))
      );
  }

  deleteDevice(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  toggleDevice(id: string): Observable<Device> {
    return this.http.post<DeviceResponse>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getHeaders() })
      .pipe(
        map((response: DeviceResponse) => this.mapToDevice(response))
      );
  }

  // Mappers
  private mapToDevice(response: DeviceResponse): Device {
    return {
      id: response.id,
      name: response.name,
      category: response.category,
      type: response.type,
      brand: response.brand,
      model: response.model,
      // Cast the incoming string to DeviceStatus enum safely
      status: (response.status as unknown) as DeviceStatus,
      realTimeStatus: response.realTimeStatus,
      lastActive: response.lastActive,
      alertHistory: response.alertHistory,
      energyConsumption: response.energyConsumption,
      location: response.location,
      isActive: response.isActive
    };
  }

  private mapToDeviceResponse(device: Device): DeviceResponse {
    return {
      id: device.id,
      name: device.name,
      category: device.category,
      type: device.type,
      brand: device.brand,
      model: device.model,
      status: device.status,
      realTimeStatus: device.realTimeStatus,
      lastActive: device.lastActive,
      alertHistory: device.alertHistory,
      energyConsumption: device.energyConsumption,
      location: device.location,
      isActive: device.isActive
    };
  }
}