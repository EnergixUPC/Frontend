import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import { ReportRepositoryImpl } from '../../infrastructure/repositories/report-repository.impl';
import { ReportResource } from '../../infrastructure/resources/report.resource';
import { Report, ReportType, ReportFormat, ReportPeriod } from '../../domain/model/entities/report.entity';
import { ReportGenerationParams } from '../../domain/model/repositories/report.repository';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private reportRepository: ReportRepositoryImpl,
    private reportResource: ReportResource,
    private http: HttpClient
  ) { }

  generateWeeklyConsumptionReport(format: ReportFormat = ReportFormat.PDF): Observable<Report> {
    return this.reportRepository.generateReport(
      ReportType.WEEKLY_CONSUMPTION,
      ReportPeriod.LAST_WEEK,
      format
    );
  }

  generateDeviceRankingReport(format: ReportFormat = ReportFormat.PDF): Observable<Report> {
    return this.reportRepository.generateReport(
      ReportType.DEVICE_RANKING,
      ReportPeriod.LAST_MONTH,
      format
    );
  }

  generateComprehensiveReport(
    period: ReportPeriod = ReportPeriod.LAST_MONTH,
    format: ReportFormat = ReportFormat.PDF
  ): Observable<Report> {
    return this.reportRepository.generateReport(
      ReportType.COMPREHENSIVE,
      period,
      format
    );
  }

  generateCustomReport(params: ReportGenerationParams): Observable<Report> {
    return this.reportRepository.generateReportWithParams(params);
  }

  getReport(id: string): Observable<Report> {
    return this.reportRepository.getReport(id);
  }

  getReportHistory(userId?: string): Observable<Report[]> {
    return this.reportRepository.getReportHistory(userId);
  }

  deleteReport(id: string): Observable<boolean> {
    return this.reportRepository.deleteReport(id);
  }

  // Utility methods for common report configurations
  getAvailableFormats(): ReportFormat[] {
    return [
      ReportFormat.PDF,
      ReportFormat.EXCEL,
      ReportFormat.CSV,
      ReportFormat.JSON
    ];
  }

  getAvailablePeriods(): ReportPeriod[] {
    return [
      ReportPeriod.LAST_WEEK,
      ReportPeriod.LAST_MONTH,
      ReportPeriod.LAST_QUARTER,
      ReportPeriod.LAST_YEAR
    ];
  }

  getAvailableTypes(): ReportType[] {
    return [
      ReportType.WEEKLY_CONSUMPTION,
      ReportType.DEVICE_RANKING,
      ReportType.COMPREHENSIVE,
      ReportType.CUSTOM
    ];
  }

  // Methods to get chart data from API
  getWeeklyConsumption(): Observable<any> {
    const userId = this.getCurrentUserId();
    console.log('Getting weekly consumption from backend for userId:', userId);

    return this.reportResource.getWeeklyConsumption(userId).pipe(
      delay(200)
    );
  }

  getTopDevices(): Observable<any> {
    const userId = this.getCurrentUserId();
    console.log('Getting top devices from backend for userId:', userId);

    return this.reportResource.getTopDevices(userId).pipe(
      delay(200)
    );
  }

  private getCurrentUserId(): number | undefined {
    try {
      const userStr = localStorage.getItem(environment.userKey);
      console.log('Content of userKey in localStorage:', userStr);

      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Current user complete:', user);
        console.log('User ID:', user.id);
        return user.id;
      } else {
        console.warn('No user in localStorage');
      }
    } catch (error) {
      console.error('Error getting userId:', error);
    }
    return undefined;
  }

  getReportSummary(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/reportSummary`).pipe(
      delay(200) // Small delay to simulate real latency
    );
  }
}