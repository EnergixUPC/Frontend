import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import {
  ReportGenerationRequest,
  ReportFilterRequest
} from '../request/report.request';
import {
  ReportResponse,
  ReportListResponse
} from '../response/report.response';

@Injectable({
  providedIn: 'root'
})
export class ReportResource {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/reports`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  generateReport(request: ReportGenerationRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/generate`, request, { headers: this.getHeaders() });
  }

  getReport(id: string): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getReportHistory(filter?: ReportFilterRequest): Observable<ReportListResponse> {
    let params = new HttpParams();

    if (filter) {
      if (filter.userId) params = params.set('userId', filter.userId);
      if (filter.type) params = params.set('type', filter.type);
      if (filter.format) params = params.set('format', filter.format);
      if (filter.period) params = params.set('period', filter.period);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset) params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<ReportListResponse>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  deleteReport(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getReportData(id: string, includeCharts: boolean = true): Observable<any> {
    const params = new HttpParams().set('includeCharts', includeCharts.toString());
    return this.http.get(`${this.apiUrl}/${id}/data`, { params, headers: this.getHeaders() });
  }

  getWeeklyConsumption(userId?: number): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<any>(`${environment.apiUrl}/api/v1/reports/weekly-consumption`, {
      params,
      headers: this.getHeaders()
    });
  }

  getTopDevices(userId?: number): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<any>(`${environment.apiUrl}/api/v1/reports/top-devices`, {
      params,
      headers: this.getHeaders()
    });
  }

  getMonthlyHistory(format?: string): Observable<any> {
    let params = new HttpParams();
    if (format) {
      params = params.set('format', format);
    }
    return this.http.get<any>(`${this.apiUrl}/monthly-history`, {
      params,
      headers: this.getHeaders()
    });
  }

  getCompare(period1: string, period2: string): Observable<any> {
    let params = new HttpParams()
      .set('period1', period1)
      .set('period2', period2);
      
    return this.http.get<any>(`${this.apiUrl}/compare`, {
      params,
      headers: this.getHeaders()
    });
  }
}