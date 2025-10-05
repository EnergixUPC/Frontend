import { DashboardStats } from '../../domain/model/entities/dashboard-stats.entity';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../domain/model/entities/monthly-comparison.entity';
import { Device } from '../../domain/model/entities/device.entity';
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
    return Device.fromJson(response);
  }

  static toDevices(responses: DeviceResponse[]): Device[] {
    return responses.map(response => this.toDevice(response));
  }
}
