import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import { 
  ExportDownloadRequest, 
  ExportEmailRequest, 
  ExportStatusRequest,
  ExportHistoryRequest 
} from '../request/export.request';
import { 
  ExportResponse, 
  ExportDownloadResponse, 
  ExportEmailResponse,
  ExportHistoryResponse 
} from '../response/export.response';

@Injectable({
  providedIn: 'root'
})
export class ExportResource {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/reports`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createExportRequest(reportId: string, format: string): Observable<ExportResponse> {
    const request = { reportId, format };
    return this.http.post<ExportResponse>(`${this.apiUrl}/create`, request, { headers: this.getHeaders() });
  }

  getExportStatus(request: ExportStatusRequest): Observable<ExportResponse> {
    return this.http.get<ExportResponse>(`${this.apiUrl}/${request.exportId}/status`, { headers: this.getHeaders() });
  }

  downloadReport(request: ExportDownloadRequest): Observable<Blob> {
    const params = new HttpParams()
      .set('format', request.format)
      .set('userId', request.userId || '');

    return this.http.get(`${this.apiUrl}/${request.reportId}/download`, {
      params,
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  getDownloadUrl(request: ExportDownloadRequest): Observable<ExportDownloadResponse> {
    const params = new HttpParams()
      .set('format', request.format)
      .set('userId', request.userId || '');

    return this.http.get<ExportDownloadResponse>(`${this.apiUrl}/${request.reportId}/download-url`, { params, headers: this.getHeaders() });
  }

  sendReportByEmail(request: ExportEmailRequest): Observable<ExportEmailResponse> {
    return this.http.post<ExportEmailResponse>(`${this.apiUrl}/send-email`, request, { headers: this.getHeaders() });
  }

  getExportHistory(request?: ExportHistoryRequest): Observable<ExportHistoryResponse> {
    let params = new HttpParams();
    
    if (request) {
      if (request.userId) params = params.set('userId', request.userId);
      if (request.status) params = params.set('status', request.status);
      if (request.startDate) params = params.set('startDate', request.startDate);
      if (request.endDate) params = params.set('endDate', request.endDate);
      if (request.limit) params = params.set('limit', request.limit.toString());
      if (request.offset) params = params.set('offset', request.offset.toString());
    }

    return this.http.get<ExportHistoryResponse>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  cancelExport(exportId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/${exportId}/cancel`, {}, { headers: this.getHeaders() });
  }
}