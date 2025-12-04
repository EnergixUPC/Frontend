export interface Report {
  id: string;
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  generatedAt: Date;
  data: ReportData;
  metadata: ReportMetadata;
}

export interface ReportData {
  weeklyConsumption?: WeeklyConsumptionData[];
  deviceRanking?: DeviceRankingData[];
  totalConsumption: number;
  averageConsumption: number;
  peakConsumption: number;
  efficiencyScore: number;
}

export interface WeeklyConsumptionData {
  dailyConsumptions: DailyConsumptionData[];
  totalWeeklyConsumption: number;
  weekStartDate: Date;
  weekEndDate: Date;
}

export interface DailyConsumptionData {
  date: Date;
  dayName: string;
  consumption: number;
}

export interface DeviceRankingData {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  deviceCategory: string;
  totalConsumption: number;
  period: string;
}

export interface ReportMetadata {
  title: string;
  description: string;
  generatedBy: string;
  exportedAt?: Date;
  recipients?: string[];
  fileSize?: number;
  language: 'en' | 'es';
}

export enum ReportType {
  WEEKLY_CONSUMPTION = 'weekly_consumption',
  DEVICE_RANKING = 'device_ranking',
  COMPREHENSIVE = 'comprehensive',
  CUSTOM = 'custom'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export enum ReportPeriod {
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_QUARTER = 'last_quarter',
  LAST_YEAR = 'last_year',
  CUSTOM_RANGE = 'custom_range'
}