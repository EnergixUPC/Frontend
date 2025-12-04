import { Injectable } from '@angular/core';
import { 
  Report, 
  ReportData, 
  WeeklyConsumptionData,
  DailyConsumptionData, 
  DeviceRankingData, 
  ReportMetadata,
  ReportType,
  ReportFormat,
  ReportPeriod 
} from '../../domain/model/entities/report.entity';
import { 
  ReportResponse, 
  ReportDataResponse, 
  WeeklyConsumptionResponse,
  DailyConsumptionResponse, 
  DeviceRankingResponse, 
  ReportMetadataResponse 
} from '../response/report.response';
import { ReportGenerationRequest } from '../request/report.request';

@Injectable({
  providedIn: 'root'
})
export class ReportAssembler {

  toEntity(response: ReportResponse): Report {
    return {
      id: response.id,
      type: this.mapStringToReportType(response.type),
      format: this.mapStringToReportFormat(response.format),
      period: this.mapStringToReportPeriod(response.period),
      generatedAt: new Date(response.generatedAt),
      data: this.toReportDataEntity(response.data),
      metadata: this.toReportMetadataEntity(response.metadata)
    };
  }

  toEntityList(responses: ReportResponse[]): Report[] {
    return responses.map(response => this.toEntity(response));
  }

  toRequest(
    type: ReportType, 
    format: ReportFormat, 
    period: ReportPeriod,
    options?: {
      startDate?: Date;
      endDate?: Date;
      deviceIds?: string[];
      includeCharts?: boolean;
      includeSummary?: boolean;
      language?: 'en' | 'es';
      userId?: string;
    }
  ): ReportGenerationRequest {
    return {
      type: this.mapReportTypeToString(type) as 'weekly_consumption' | 'device_ranking' | 'comprehensive' | 'custom',
      format: this.mapReportFormatToString(format) as 'pdf' | 'excel' | 'csv' | 'json',
      period: this.mapReportPeriodToString(period) as 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'custom_range',
      startDate: options?.startDate?.toISOString(),
      endDate: options?.endDate?.toISOString(),
      deviceIds: options?.deviceIds,
      includeCharts: options?.includeCharts ?? true,
      includeSummary: options?.includeSummary ?? true,
      language: options?.language ?? 'en',
      userId: options?.userId
    };
  }

  private toReportDataEntity(response: ReportDataResponse): ReportData {
    return {
      weeklyConsumption: response.weeklyConsumption?.map(this.toWeeklyConsumptionEntity),
      deviceRanking: response.deviceRanking?.map(this.toDeviceRankingEntity),
      totalConsumption: response.totalConsumption,
      averageConsumption: response.averageConsumption,
      peakConsumption: response.peakConsumption,
      efficiencyScore: response.efficiencyScore
    };
  }

  private toWeeklyConsumptionEntity(response: WeeklyConsumptionResponse): WeeklyConsumptionData {
    return {
      dailyConsumptions: response.dailyConsumptions.map(daily => ({
        date: new Date(daily.date),
        dayName: daily.dayName,
        consumption: daily.consumption
      })),
      totalWeeklyConsumption: response.totalWeeklyConsumption,
      weekStartDate: new Date(response.weekStartDate),
      weekEndDate: new Date(response.weekEndDate)
    };
  }

  private toDeviceRankingEntity(response: DeviceRankingResponse): DeviceRankingData {
    return {
      deviceId: response.deviceId,
      deviceName: response.deviceName,
      deviceType: response.deviceType,
      deviceCategory: response.deviceCategory,
      totalConsumption: response.totalConsumption,
      period: response.period
    };
  }

  private toReportMetadataEntity(response: ReportMetadataResponse): ReportMetadata {
    return {
      title: response.title,
      description: response.description,
      generatedBy: response.generatedBy,
      exportedAt: response.exportedAt ? new Date(response.exportedAt) : undefined,
      recipients: response.recipients,
      fileSize: response.fileSize,
      language: response.language
    };
  }

  private mapStringToReportType(type: string): ReportType {
    switch (type) {
      case 'weekly_consumption': return ReportType.WEEKLY_CONSUMPTION;
      case 'device_ranking': return ReportType.DEVICE_RANKING;
      case 'comprehensive': return ReportType.COMPREHENSIVE;
      case 'custom': return ReportType.CUSTOM;
      default: return ReportType.COMPREHENSIVE;
    }
  }

  private mapStringToReportFormat(format: string): ReportFormat {
    switch (format) {
      case 'pdf': return ReportFormat.PDF;
      case 'excel': return ReportFormat.EXCEL;
      case 'csv': return ReportFormat.CSV;
      case 'json': return ReportFormat.JSON;
      default: return ReportFormat.PDF;
    }
  }

  private mapStringToReportPeriod(period: string): ReportPeriod {
    switch (period) {
      case 'last_week': return ReportPeriod.LAST_WEEK;
      case 'last_month': return ReportPeriod.LAST_MONTH;
      case 'last_quarter': return ReportPeriod.LAST_QUARTER;
      case 'last_year': return ReportPeriod.LAST_YEAR;
      case 'custom_range': return ReportPeriod.CUSTOM_RANGE;
      default: return ReportPeriod.LAST_WEEK;
    }
  }

  private mapReportTypeToString(type: ReportType): string {
    switch (type) {
      case ReportType.WEEKLY_CONSUMPTION: return 'weekly_consumption';
      case ReportType.DEVICE_RANKING: return 'device_ranking';
      case ReportType.COMPREHENSIVE: return 'comprehensive';
      case ReportType.CUSTOM: return 'custom';
    }
  }

  private mapReportFormatToString(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.PDF: return 'pdf';
      case ReportFormat.EXCEL: return 'excel';
      case ReportFormat.CSV: return 'csv';
      case ReportFormat.JSON: return 'json';
    }
  }

  private mapReportPeriodToString(period: ReportPeriod): string {
    switch (period) {
      case ReportPeriod.LAST_WEEK: return 'last_week';
      case ReportPeriod.LAST_MONTH: return 'last_month';
      case ReportPeriod.LAST_QUARTER: return 'last_quarter';
      case ReportPeriod.LAST_YEAR: return 'last_year';
      case ReportPeriod.CUSTOM_RANGE: return 'custom_range';
    }
  }
}