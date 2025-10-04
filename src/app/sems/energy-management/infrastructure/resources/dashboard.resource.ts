import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardStatsResponse,
  DailyConsumptionResponse,
  ConsumptionByCategoryResponse,
  MonthlyComparisonResponse,
  DeviceResponse
} from '../response';
import {
  DashboardStatsRequest,
  DailyConsumptionRequest,
  ConsumptionByCategoryRequest,
  MonthlyComparisonRequest,
  DevicesRequest
} from '../request';
import { environment } from '../../../../../environments/environments';
import { MockDashboardResource } from './mock-dashboard.resource';

@Injectable({
  providedIn: 'root'
})
export class DashboardResource {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;
  private useMockData = true; // Toggle for development

  constructor(
    private readonly http: HttpClient,
    private readonly mockResource: MockDashboardResource
  ) {}

  getDashboardStats(request: DashboardStatsRequest): Observable<DashboardStatsResponse> {
    if (this.useMockData) {
      return this.mockResource.getDashboardStats();
    }
    
    let params = new HttpParams();
    if (request.userId) params = params.set('userId', request.userId);
    if (request.date) params = params.set('date', request.date);

    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/stats`, { params });
  }

  getDailyConsumption(request: DailyConsumptionRequest): Observable<DailyConsumptionResponse> {
    if (this.useMockData) {
      return this.mockResource.getDailyConsumption();
    }
    
    let params = new HttpParams();
    if (request.userId) params = params.set('userId', request.userId);
    params = params.set('date', request.date);

    return this.http.get<DailyConsumptionResponse>(`${this.apiUrl}/daily-consumption`, { params });
  }

  getConsumptionByCategory(request: ConsumptionByCategoryRequest): Observable<ConsumptionByCategoryResponse> {
    if (this.useMockData) {
      return this.mockResource.getConsumptionByCategory();
    }
    
    let params = new HttpParams();
    if (request.userId) params = params.set('userId', request.userId);
    if (request.startDate) params = params.set('startDate', request.startDate);
    if (request.endDate) params = params.set('endDate', request.endDate);

    return this.http.get<ConsumptionByCategoryResponse>(`${this.apiUrl}/consumption-by-category`, { params });
  }

  getMonthlyComparison(request: MonthlyComparisonRequest): Observable<MonthlyComparisonResponse> {
    if (this.useMockData) {
      return this.mockResource.getMonthlyComparison();
    }
    
    let params = new HttpParams();
    if (request.userId) params = params.set('userId', request.userId);
    if (request.year) params = params.set('year', request.year.toString());

    return this.http.get<MonthlyComparisonResponse>(`${this.apiUrl}/monthly-comparison`, { params });
  }

  getDevices(request: DevicesRequest): Observable<DeviceResponse[]> {
    if (this.useMockData) {
      return this.mockResource.getDevices();
    }
    
    let params = new HttpParams();
    if (request.userId) params = params.set('userId', request.userId);
    if (request.status) params = params.set('status', request.status);

    return this.http.get<DeviceResponse[]>(`${this.apiUrl}/devices`, { params });
  }
}
