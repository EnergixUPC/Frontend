import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getDashboardStats(request: DashboardStatsRequest): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${environment.apiUrl}/dashboardStats`);
  }

  getDailyConsumption(request: DailyConsumptionRequest): Observable<DailyConsumptionResponse> {
    return this.http.get<DailyConsumptionResponse>(`${environment.apiUrl}/dailyConsumption`);
  }

  getConsumptionByCategory(request: ConsumptionByCategoryRequest): Observable<ConsumptionByCategoryResponse> {
    return this.http.get<ConsumptionByCategoryResponse>(`${environment.apiUrl}/consumptionByCategory`);
  }

  getMonthlyComparison(request: MonthlyComparisonRequest): Observable<MonthlyComparisonResponse> {
    return this.http.get<MonthlyComparisonResponse>(`${environment.apiUrl}/monthlyComparison`);
  }

  getDevices(request: DevicesRequest): Observable<DeviceResponse[]> {
    return this.http.get<DeviceResponse[]>(`${environment.apiUrl}/devices`);
  }
}
