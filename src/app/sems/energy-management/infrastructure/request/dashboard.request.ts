export interface DashboardStatsRequest {
  userId?: string;
  date?: string;
}

export interface DailyConsumptionRequest {
  userId?: string;
  date: string;
}

export interface ConsumptionByCategoryRequest {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MonthlyComparisonRequest {
  userId?: string;
  year?: number;
}

export interface DevicesRequest {
  userId?: string;
  status?: string;
}
