export interface DashboardStatsResponse {
  energyConsumption: number;
  estimatedSavings: number;
  activeDevices: number;
  estimatedBill: number;
  todayConsumption: number;
  currency: string;
}

export interface UnifiedDashboardResponse {
  monthlySavingGoalKwh: number;
  estimatedSavingsPercent: number;
  activeDevices: number;
  estimatedBill: number;
  todaysConsumptionKwh: number;
  dailyConsumption: Array<{
    timestamp: string;
    kwh: number;
  }>;
  categoryConsumption: Array<{
    category: string;
    kwh: number;
    percentage: number;
  }>;
  devices: Array<{
    id: number;
    nombre: string;
    categoria: string;
    tipo: string;
    estado: string;
    ubicacion: string;
    ultimaActividad: string;
    activo: number;
  }>;
  alerts: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export interface ConsumptionDataPointResponse {
  time: string;
  value: number;
}

export interface DailyConsumptionResponse {
  date: string;
  dataPoints: ConsumptionDataPointResponse[];
  totalConsumption: number;
  peakTime: string;
  peakValue: number;
}

export interface CategoryDataResponse {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ConsumptionByCategoryResponse {
  categories: CategoryDataResponse[];
  totalConsumption: number;
}

export interface MonthlyDataResponse {
  month: string;
  year: number;
  consumption: number;
}

export interface MonthlyComparisonResponse {
  months: MonthlyDataResponse[];
  currentMonth: string;
  previousMonthComparison: number;
}

export interface DeviceResponse {
  id: string;
  name: string;
  location: string;
  type: string;
  brand?: string;
  model?: string;
  status: string;
  lastActive?: string;
  consumption?: number;
}
