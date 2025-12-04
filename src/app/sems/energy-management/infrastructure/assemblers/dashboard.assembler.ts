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
  DeviceResponse,
  UnifiedDashboardResponse
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

  static toDashboardStatsFromUnified(response: UnifiedDashboardResponse): DashboardStats {
    console.log('Mapping unified dashboard response to DashboardStats:', response);
    
    // Calculate total energy consumption from daily consumption
    const totalEnergyConsumption = response.dailyConsumption?.reduce((sum, day) => sum + (day.kwh || 0), 0) || 0;
    
    return new DashboardStats(
      totalEnergyConsumption, // Real consumption, not the goal
      response.estimatedSavingsPercent || 0,
      response.activeDevices || 0,
      response.estimatedBill || 0,
      response.todaysConsumptionKwh || 0,
      'S/.' // Currency for Peru
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
      brand: response.brand || '',
      model: response.model || '',
      status: response.status as any,
      realTimeStatus: response.status,
      lastActive: response.lastActive || 'Unknown',
      alertHistory: 'No alerts',
      energyConsumption: response.consumption ? `${response.consumption} kWh` : '0 kWh',
      location: response.location,
      isActive: response.status === 'ON' ? 1 : 0
    };
  }

  static toDevices(responses: DeviceResponse[]): Device[] {
    return responses.map(response => this.toDevice(response));
  }

  static toDevicesFromUnified(response: UnifiedDashboardResponse): Device[] {
    console.log('Raw devices from API:', JSON.stringify(response.devices, null, 2));

    if (!response.devices || response.devices.length === 0) {
      console.log('No devices in response');
      return [];
    }

    const mappedDevices = response.devices.map((device) => {
      // Extraer el nombre del dispositivo del formato "DeviceName[name=TV]"
      let deviceName = device.name;
      const nameMatch = device.name.match(/DeviceName\[name=(.+?)\]/);
      if (nameMatch) {
        deviceName = nameMatch[1];
      }

      // Extraer la categoría del formato "DeviceCategory[category=Electrodomestico]"
      let deviceCategory = device.category;
      const categoryMatch = device.category.match(/DeviceCategory\[category=(.+?)\]/);
      if (categoryMatch) {
        deviceCategory = categoryMatch[1];
      }

      console.log('Mapped device:', {
        id: device.id,
        name: deviceName,
        category: deviceCategory
      });

      return {
        id: device.id.toString(),
        name: deviceName,
        category: deviceCategory,
        type: deviceCategory,
        brand: '',
        model: '',
        status: 'ON' as any,
        realTimeStatus: 'ON',
        lastActive: 'NOW',
        alertHistory: 'No alerts',
        energyConsumption: '0 kWh',
        location: 'Home',
        isActive: 1
      };
    });

    console.log('Valid devices mapped:', mappedDevices.length);
    return mappedDevices;
  }

  static toDailyConsumptionFromUnified(response: UnifiedDashboardResponse): DailyConsumption {
    console.log('Mapping unified dashboard daily consumption:', response.dailyConsumption);
    const dataPoints = response.dailyConsumption.map(point => ({
      time: point.timestamp,
      value: point.kwh
    }));

    const totalConsumption = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const peakPoint = dataPoints.reduce((max, point) => point.value > max.value ? point : max, dataPoints[0] || { time: '', value: 0 });

    return new DailyConsumption(
      new Date(),
      dataPoints,
      totalConsumption,
      peakPoint.time,
      peakPoint.value
    );
  }

  static toConsumptionByCategoryFromUnified(response: UnifiedDashboardResponse): ConsumptionByCategory {
    console.log('Mapping unified dashboard category consumption:', response.categoryConsumption);
    
    const totalConsumption = response.categoryConsumption.reduce((sum, cat) => sum + cat.kwh, 0);
    
    const categories = response.categoryConsumption.map(cat => {
      // Extraer el nombre de la categoría del formato "DeviceCategory[category=Electronico]"
      let categoryName = cat.category;
      const categoryMatch = cat.category.match(/DeviceCategory\[category=(.+?)\]/);
      if (categoryMatch) {
        categoryName = categoryMatch[1];
      }
      
      const percentage = totalConsumption > 0 ? (cat.kwh / totalConsumption) * 100 : 0;
      
      return {
        name: categoryName,
        value: cat.kwh,
        percentage: percentage,
        color: this.getCategoryColor(categoryName)
      };
    });

    return new ConsumptionByCategory(
      categories,
      totalConsumption
    );
  }

  static toAlertsFromUnified(response: UnifiedDashboardResponse): any[] {
    console.log('Mapping unified dashboard alerts:', response.alerts);
    
    if (!response.alerts || response.alerts.length === 0) {
      return [];
    }

    return response.alerts.map(alert => ({
      level: alert.level,
      message: alert.message,
      type: alert.level === 'warning' ? 'warning' : 'info',
      timestamp: new Date().toISOString()
    }));
  }

  private static getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Lighting': '#4CAF50',
      'HVAC': '#2196F3',
      'Entertainment': '#FF9800',
      'Kitchen': '#F44336',
      'Office': '#9C27B0',
      'Other': '#757575',
      'Electronico': '#2196F3',
      'Electrodomestico': '#4CAF50'
    };
    return colors[category] || '#757575';
  }
}
