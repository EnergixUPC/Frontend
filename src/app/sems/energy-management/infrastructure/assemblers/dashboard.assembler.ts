import { DashboardStats } from '../../domain/model/entities/dashboard-stats.entity';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../domain/model/entities/monthly-comparison.entity';
import { Device } from '../../domain/model/device.entity';
import {
  DashboardStatsResponse,
  DailyConsumptionResponse,
  ConsumptionByCategoryResponse,
  MonthlyComparisonResponse,
  DeviceResponse
} from '../response/dashboard.response';

export class DashboardAssembler {
  static toDashboardStats(response: DashboardStatsResponse): DashboardStats {
    return new DashboardStats(
      response.energyConsumption,
      response.estimatedSavings,
      response.activeDevices,
      response.estimatedBill,
      response.todayConsumption,
      response.currency
    );
  }

  static toDailyConsumption(response: DailyConsumptionResponse): DailyConsumption {
    return new DailyConsumption(
      new Date(response.date),
      response.dataPoints,
      response.totalConsumption,
      response.peakTime,
      response.peakValue
    );
  }

  static toConsumptionByCategory(response: ConsumptionByCategoryResponse): ConsumptionByCategory {
    return new ConsumptionByCategory(
      response.categories,
      response.totalConsumption
    );
  }

  static toMonthlyComparison(response: MonthlyComparisonResponse): MonthlyComparison {
    return new MonthlyComparison(
      response.months,
      response.currentMonth,
      response.previousMonthComparison
    );
  }

  static toDevice(response: DeviceResponse): Device {
    return {
      id: response.id,
      name: response.name,
      category: 'Other', // Valor por defecto para dispositivos del dashboard
      type: response.type,
      status: response.status as any,
      realTimeStatus: response.status,
      lastActive: response.lastActive || 'Unknown',
      alertHistory: 'No alerts',
      energyConsumption: response.consumption ? `${response.consumption} kWh` : '0 kWh',
      location: response.location,
      isActive: response.status === 'ON'
    };
  }

  static toDevices(responses: DeviceResponse[]): Device[] {
    return responses.map(response => this.toDevice(response));
  }
}
