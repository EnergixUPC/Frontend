import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardStatsResponse,
  DailyConsumptionResponse,
  ConsumptionByCategoryResponse,
  MonthlyComparisonResponse,
  DeviceResponse
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
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getDashboardStats(request: DashboardStatsRequest): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${environment.apiUrl}/api/v1/dashboard/stats`, { headers: this.getHeaders() });
  }

  getDailyConsumption(request: DailyConsumptionRequest): Observable<DailyConsumptionResponse> {
    return this.http.get<DailyConsumptionResponse>(`${environment.apiUrl}/api/v1/consumption/daily`, { headers: this.getHeaders() });
  }

  getConsumptionByCategory(request: ConsumptionByCategoryRequest): Observable<ConsumptionByCategoryResponse> {
    return this.http.get<ConsumptionByCategoryResponse>(`${environment.apiUrl}/api/v1/consumption/categories`, { headers: this.getHeaders() });
  }

  getMonthlyComparison(request: MonthlyComparisonRequest): Observable<MonthlyComparisonResponse> {
    return this.http.get<MonthlyComparisonResponse>(`${environment.apiUrl}/api/v1/consumption/monthly`, { headers: this.getHeaders() });
  }

  getDevices(request: DevicesRequest): Observable<DeviceResponse[]> {
    return this.http.get<DeviceResponse[]>(`${environment.apiUrl}/api/v1/devices`, { headers: this.getHeaders() });
  }
}
