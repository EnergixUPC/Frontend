import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Device, DeviceStatus } from '../../domain/model/device.entity';
import { DeviceRepository } from '../../domain/model/repositories/device.repository';
import { environment } from '../../../../../environments/environments';
import { TokenService } from '../../../authentication/infrastructure/services/token.service';

// DTO matching DeviceResource from the backend API
export interface DeviceResponse {
  id?: number;
  userId?: string;
  nombre: string;
  categoria: string;
  estado: string;    // "on" | "off"
  ubicacion: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceRepositoryImpl implements DeviceRepository {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/devices`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) { }

  private getHeaders(): HttpHeaders {
    console.log('DeviceRepository - Getting headers...');
    
    // First try TokenService
    let token = this.tokenService.getAccessToken();
    console.log('DeviceRepository - Token from TokenService:', token ? 'Present' : 'Not found');
    console.log('DeviceRepository - Token expired?', this.tokenService.isTokenExpired());
    
    // If no token from service, try localStorage directly
    if (!token) {
      token = localStorage.getItem(environment.tokenKey);
      console.log('DeviceRepository - Token from localStorage:', token ? 'Present' : 'Not found');
    }
    
    if (!token) {
      console.error('DeviceRepository - No token available');
      console.log('DeviceRepository - All localStorage keys:', Object.keys(localStorage));
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('DeviceRepository - Final headers Authorization:', `Bearer ${token.substring(0, 20)}...`);
    return new HttpHeaders(headers);
  }

  getAllDevices(): Observable<Device[]> {
    console.log('DeviceRepository - Getting all devices...');
    console.log('DeviceRepository - API URL:', this.apiUrl);
    
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
    return this.http.patch<DeviceResponse>(`${this.apiUrl}/${device.id}`, deviceDto, { headers: this.getHeaders() })
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
    // Convert string ID to number for the API endpoint
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      console.error('DeviceRepository - Invalid device ID:', id);
      return of(false);
    }
    
    console.log('DeviceRepository - Deleting device with ID:', numericId);
    console.log('DeviceRepository - Delete URL:', `${this.apiUrl}/${numericId}`);
    
    const headers = this.getHeaders();
    console.log('DeviceRepository - Headers for DELETE:');
    headers.keys().forEach(key => {
      console.log(`DeviceRepository - Header ${key}:`, headers.get(key)?.substring(0, 50) + '...');
    });
    
    return this.http.delete(`${this.apiUrl}/${numericId}`, { 
      headers: headers,
      responseType: 'text' as 'json'
    }).pipe(
      map((response: any) => {
        console.log('DeviceRepository - Delete successful:', response);
        return true;
      }),
      catchError((error) => {
        console.error('DeviceRepository - Delete error:', error);
        console.error('DeviceRepository - Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        
        if (error.status === 401) {
          console.log('DeviceRepository - 401 Error: Insufficient permissions for DELETE operation');
          console.log('DeviceRepository - This suggests the user role may not have delete permissions');
        } else if (error.status === 403) {
          console.log('DeviceRepository - 403 Error: Forbidden - User explicitly denied access');
        } else if (error.status === 404) {
          console.log('DeviceRepository - 404 Error: Device not found');
        }
        
        return of(false);
      })
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
    const rawStatus = (response.estado || '').toLowerCase();
    return {
      id: response.id?.toString() || '',
      name: response.nombre,
      category: response.categoria,
      type: response.categoria,
      brand: '',
      model: '',
      status: rawStatus === 'on' ? DeviceStatus.ON : DeviceStatus.OFF,
      realTimeStatus: rawStatus,
      lastActive: '',
      alertHistory: undefined,
      energyConsumption: undefined,
      location: response.ubicacion,
      isActive: response.activo ? 1 : 0
    };
  }

  // Request body uses English fields per the API contract (CreateDeviceRequest / UpdateDeviceRequest)
  private mapToDeviceResponse(device: Device): any {
    return {
      name: device.name,
      category: device.category,
      status: (device.status || DeviceStatus.OFF).toLowerCase(),
      location: device.location,
      active: device.isActive === 1
    };
  }
}