import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  DashboardStatsResponse,
  DailyConsumptionResponse,
  ConsumptionByCategoryResponse,
  MonthlyComparisonResponse,
  DeviceResponse,
  UnifiedDashboardResponse
} from '../response/dashboard.response';
import {
  DashboardStatsRequest,
  DailyConsumptionRequest,
  ConsumptionByCategoryRequest,
  MonthlyComparisonRequest,
  DevicesRequest
} from '../request/dashboard.request';
import { environment } from '../../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DashboardResource {

  constructor(
    private readonly http: HttpClient
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    console.log('Dashboard API Token check:', token ? 'Token found' : 'No token found');
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'N/A');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getDashboardStats(request: DashboardStatsRequest): Observable<UnifiedDashboardResponse> {
    console.log('Making API call to fetch dashboard data:', `${environment.apiUrl}/api/v1/dashboard`);
    return this.http.get<UnifiedDashboardResponse>(`${environment.apiUrl}/api/v1/dashboard`, { headers: this.getHeaders() }).pipe(
      tap((response: UnifiedDashboardResponse) => {
        console.log('Dashboard API FULL response:', JSON.stringify(response, null, 2));
        console.log('Devices from API:', response.devices);
      }),
      catchError((error: any) => {
        console.error('Error fetching dashboard:', error);
        throw error;
      })
    );
  }

  getDailyConsumption(request: DailyConsumptionRequest): Observable<DailyConsumptionResponse> {
    const params = request.date ? `/${request.date}` : '';
    return this.http.get<DailyConsumptionResponse>(`${environment.apiUrl}/api/v1/consumption/daily${params}`, { headers: this.getHeaders() });
  }

  getConsumptionByCategory(request: ConsumptionByCategoryRequest): Observable<ConsumptionByCategoryResponse> {
    return this.http.get<ConsumptionByCategoryResponse>(`${environment.apiUrl}/api/v1/consumption/categories`, { headers: this.getHeaders() });
  }

  getMonthlyComparison(request: MonthlyComparisonRequest): Observable<MonthlyComparisonResponse> {
    return this.http.get<MonthlyComparisonResponse>(`${environment.apiUrl}/api/v1/consumption/monthly`, { headers: this.getHeaders() });
  }

  getDevices(request: DevicesRequest): Observable<DeviceResponse[]> {
    console.log('Making API call to fetch devices:', `${environment.apiUrl}/api/v1/devices`);
    return this.http.get<DeviceResponse[]>(`${environment.apiUrl}/api/v1/devices`, { headers: this.getHeaders() }).pipe(
      tap((response: DeviceResponse[]) => {
        console.log('Devices API response:', response);
        console.log('Number of devices returned:', response?.length || 0);
      }),
      catchError((error: any) => {
        console.error('Error fetching devices from API:', error);
        return of([]);
      })
    );
  }

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/v1/alerts`, { headers: this.getHeaders() });
  }
}
