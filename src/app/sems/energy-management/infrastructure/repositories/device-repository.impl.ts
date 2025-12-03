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
  id?: number;
  userId?: string;
  nombre: string;
  categoria: string;
  tipo: string;
  estado: string;
  ultimaActividad: string;
  ubicacion: string;
  activo: boolean;
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
      id: response.id?.toString() || '',
      name: response.nombre,
      category: response.categoria,
      type: response.tipo,
      brand: '',
      model: '',
      status: (response.estado as unknown) as DeviceStatus,
      realTimeStatus: response.estado,
      lastActive: response.ultimaActividad,
      alertHistory: undefined,
      energyConsumption: undefined,
      location: response.ubicacion,
      isActive: response.activo ? 1 : 0
    };
  }

  private mapToDeviceResponse(device: Device): any {
    return {
      nombre: device.name,
      categoria: device.category,
      tipo: device.type,
      estado: device.status,
      ultimaActividad: device.lastActive,
      ubicacion: device.location,
      activo: device.isActive === 1
    };
  }
}