export interface PeriodConsumptionDataResponse {
  startDate: string;
  endDate: string;
  totalConsumption: number;
  dailyConsumptions: { date: string; consumption: number }[];
}

export interface CompareConsumptionResponse {
  period1: PeriodConsumptionDataResponse;
  period2: PeriodConsumptionDataResponse;
  difference: number;
  percentageDifference: number;
}

export interface ReportResponse {
  id: string;
  type: string;
  format: string;
  period: string;
  generatedAt: string; // ISO date string
  data: ReportDataResponse;
  metadata: ReportMetadataResponse;
  status: 'generated' | 'processing' | 'failed';
}

export interface ReportDataResponse {
  weeklyConsumption?: WeeklyConsumptionResponse[];
  deviceRanking?: DeviceRankingResponse[];
  totalConsumption: number;
  averageConsumption: number;
  peakConsumption: number;
  efficiencyScore: number;
  summary: ReportSummaryResponse;
}

export interface WeeklyConsumptionResponse {
  dailyConsumptions: DailyConsumptionResponse[];
  totalWeeklyConsumption: number;
  weekStartDate: string;
  weekEndDate: string;
}

export interface DailyConsumptionResponse {
  date: string;
  dayName: string;
  consumption: number;
}

export interface DeviceRankingResponse {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  deviceCategory: string;
  totalConsumption: number;
  period: string;
}

export interface ReportMetadataResponse {
  title: string;
  description: string;
  generatedBy: string;
  exportedAt?: string; // ISO date string
  recipients?: string[];
  fileSize?: number;
  language: 'en' | 'es';
  version: string;
}

export interface ReportSummaryResponse {
  totalDevices: number;
  activeDevices: number;
  totalConsumptionPeriod: number;
  averageConsumptionPerDevice: number;
  mostEfficientDevice: string;
  leastEfficientDevice: string;
  recommendations: string[];
}

export interface ReportListResponse {
  reports: ReportResponse[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}