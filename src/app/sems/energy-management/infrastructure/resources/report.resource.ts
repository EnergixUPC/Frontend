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
  ReportListResponse,
  CompareConsumptionResponse
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

  /**
   * US23: resumen del % de consumo de un día que ocurrió en la ventana de hora punta configurada.
   */
  getPeakHourSummary(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<any>(`${this.apiUrl}/peak-hour-summary`, {
      params,
      headers: this.getHeaders()
    });
  }

  /**
   * US22: compara el consumo entre dos periodos (fechas ISO yyyy-MM-dd) contra
   * GET /api/v1/reports/compare, como proxy del impacto de las recomendaciones aplicadas.
   */
  getCompare(
    period1Start: string, period1End: string,
    period2Start: string, period2End: string
  ): Observable<CompareConsumptionResponse> {
    let params = new HttpParams()
      .set('period1Start', period1Start)
      .set('period1End', period1End)
      .set('period2Start', period2Start)
      .set('period2End', period2End);

    if (environment.deploymentEnv) {
      params = params.set('deploymentEnv', environment.deploymentEnv);
    }

    return this.http.get<CompareConsumptionResponse>(`${this.apiUrl}/compare`, {
      params,
      headers: this.getHeaders()
    });
  }
}