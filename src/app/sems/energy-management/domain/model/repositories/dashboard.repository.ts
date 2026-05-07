import { Observable } from 'rxjs';
import { DashboardStats } from '../entities/dashboard-stats.entity';
import { DailyConsumption } from '../entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../entities/consumption-by-category.entity';
import { MonthlyComparison } from '../entities/monthly-comparison.entity';
import { DeviceConsumption } from '../entities/device-consumption.entity';
import { Device } from '../device.entity';

export interface DashboardRepository {
  getDashboardStats(): Observable<DashboardStats>;
  getDailyConsumption(date: Date): Observable<DailyConsumption>;
  getConsumptionByCategory(): Observable<ConsumptionByCategory>;
  getMonthlyComparison(): Observable<MonthlyComparison>;
  getDevices(): Observable<Device[]>;
  getDeviceConsumptions(deviceId: string): Observable<DeviceConsumption[]>;
  getAlerts(): Observable<any[]>;
}
