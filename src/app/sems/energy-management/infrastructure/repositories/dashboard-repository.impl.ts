import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DashboardRepository } from '../../domain/model/repositories/dashboard.repository';
import { DashboardStats } from '../../domain/model/entities/dashboard-stats.entity';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../domain/model/entities/monthly-comparison.entity';
import { Device } from '../../domain/model/device.entity';
import { DashboardResource } from '../resources/dashboard.resource';
import { DashboardAssembler } from '../assemblers/dashboard.assembler';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepositoryImpl implements DashboardRepository {
  constructor(private readonly dashboardResource: DashboardResource) {}

  getUnifiedDashboard(): Observable<{
    stats: DashboardStats;
    dailyConsumption: DailyConsumption;
    categoryConsumption: ConsumptionByCategory;
    devices: Device[];
  }> {
    return this.dashboardResource
      .getDashboardStats({})
      .pipe(
        map(response => ({
          stats: DashboardAssembler.toDashboardStatsFromUnified(response),
          dailyConsumption: DashboardAssembler.toDailyConsumptionFromUnified(response),
          categoryConsumption: DashboardAssembler.toConsumptionByCategoryFromUnified(response),
          devices: DashboardAssembler.toDevicesFromUnified(response)
        }))
      );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.dashboardResource
      .getDashboardStats({})
      .pipe(map(response => DashboardAssembler.toDashboardStatsFromUnified(response)));
  }

  getDailyConsumption(date: Date): Observable<DailyConsumption> {
    const dateString = date.toISOString().split('T')[0];
    return this.dashboardResource
      .getDailyConsumption({ date: dateString })
      .pipe(map(response => DashboardAssembler.toDailyConsumption(response)));
  }

  getConsumptionByCategory(): Observable<ConsumptionByCategory> {
    return this.dashboardResource
      .getConsumptionByCategory({})
      .pipe(map(response => DashboardAssembler.toConsumptionByCategory(response)));
  }

  getMonthlyComparison(): Observable<MonthlyComparison> {
    return this.dashboardResource
      .getMonthlyComparison({})
      .pipe(map(response => DashboardAssembler.toMonthlyComparison(response)));
  }

  getDevices(): Observable<Device[]> {
    return this.dashboardResource
      .getDevices({})
      .pipe(map(responses => DashboardAssembler.toDevices(responses)));
  }

  getAlerts(): Observable<any[]> {
    return this.dashboardResource.getAlerts();
  }
}
