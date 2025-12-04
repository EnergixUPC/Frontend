import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Device, DeviceStatus } from '../../domain/model/device.entity';
import { DeviceRepository } from '../../domain/model/repositories/device.repository';
import { environment } from '../../../../../environments/environments';

// DTO for API communication
export interface DeviceResponse {
  id?: number;
  userId?: string;
  name: string;
  category: string;
  type: string;
  status: string;
  lastActivity: string;
  location: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceRepositoryImpl implements DeviceRepository {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/devices`;

  constructor(private readonly http: HttpClient) { }

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
        map((responses: DeviceResponse[]) => {
          console.log('DeviceRepository - Raw API response:', responses);
          const devices = responses.map((response: DeviceResponse) => this.mapToDevice(response));
          console.log('DeviceRepository - Mapped devices:', devices);
          return devices;
        }),
        catchError((error) => {
          console.error('DeviceRepository - Error:', error);
          return of([]);
        })
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
    console.log('DeviceRepository - Creating device with data:', deviceDto);
    console.log('DeviceRepository - API URL:', this.apiUrl);
    console.log('DeviceRepository - Headers:', this.getHeaders());
    
    // If the fake API (json-server) expects numeric ids, server may assign one. We keep id if provided.
    return this.http.post<DeviceResponse>(this.apiUrl, deviceDto, { headers: this.getHeaders() })
      .pipe(
        map((response: DeviceResponse) => {
          console.log('DeviceRepository - Create response:', response);
          return this.mapToDevice(response);
        }),
        catchError((error) => {
          console.error('DeviceRepository - Create error:', error);
          throw error;
        })
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
      id: response.id?.toString() || '',
      name: response.name,
      category: response.category,
      type: response.type,
      brand: '',
      model: '',
      status: (response.status as unknown) as DeviceStatus,
      realTimeStatus: response.status,
      lastActive: response.lastActivity,
      alertHistory: undefined,
      energyConsumption: undefined,
      location: response.location,
      isActive: response.active ? 1 : 0
    };
  }

  private mapToDeviceResponse(device: Device): any {
    const deviceDto = {
      name: device.name,
      category: device.category,
      type: device.type,
      status: device.status,
      lastActivity: device.lastActive,
      location: device.location,
      active: device.isActive === 1
    };
    console.log('DeviceRepository - Mapping device to DTO:', deviceDto);
    return deviceDto;
  }
}