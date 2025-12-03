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
    console.log('🔄 Mapping unified dashboard response to DashboardStats:', response);
    return new DashboardStats(
      response.monthlySavingGoalKwh || 0,
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
    console.log('🔄 Raw devices from API:', JSON.stringify(response.devices, null, 2));
    console.log('🔄 Response type:', typeof response.devices);
    console.log('🔄 First device keys:', response.devices[0] ? Object.keys(response.devices[0]) : 'No devices');
    
    if (!response.devices || response.devices.length === 0) {
      console.log('⚠️ No devices in response');
      return [];
    }
    
    const mappedDevices = response.devices
      .map((device: any) => {
        console.log('🔍 Processing device RAW:', JSON.stringify(device, null, 2));
        console.log('🔍 All device keys:', Object.keys(device));
        console.log('🔍 Device fields:', {
          id: device.id,
          nombre: device.nombre,
          categoria: device.categoria,
          tipo: device.tipo,
          estado: device.estado,
          ubicacion: device.ubicacion,
          ultimaActividad: device.ultimaActividad,
          activo: device.activo
        });
        
        // Mapear usando cualquier nombre de campo que venga
        const deviceId = device.id || device.deviceId || device.Id;
        const deviceName = device.nombre || device.name || device.deviceName || `Device ${deviceId}`;
        const deviceCategory = device.categoria || device.category || 'Electrodomestico';
        const deviceType = device.tipo || device.type || 'Unknown';
        const deviceStatus = device.estado || device.status || 'Apagado';
        const deviceLocation = device.ubicacion || device.location || 'Sin ubicación';
        const deviceLastActive = device.ultimaActividad || device.lastActive || device.lastActivity || 'NOW';
        const deviceActive = device.activo !== undefined ? device.activo : (device.isActive !== undefined ? device.isActive : 1);
        
        console.log('✅ Mapped device:', {
          id: deviceId,
          name: deviceName,
          category: deviceCategory,
          type: deviceType,
          status: deviceStatus,
          location: deviceLocation
        });
        
        return {
          id: deviceId?.toString() || '0',
          name: deviceName,
          category: deviceCategory,
          type: deviceType,
          brand: '',
          model: '',
          status: deviceStatus as any,
          realTimeStatus: deviceStatus,
          lastActive: deviceLastActive,
          alertHistory: 'No alerts',
          energyConsumption: '0 kWh',
          location: deviceLocation,
          isActive: deviceActive
        };
      })
      .filter(device => device !== null) as Device[];
    
    console.log('✅ Valid devices mapped:', mappedDevices.length);
    return mappedDevices;
  }

  static toDailyConsumptionFromUnified(response: UnifiedDashboardResponse): DailyConsumption {
    console.log('🔄 Mapping unified dashboard daily consumption:', response.dailyConsumption);
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
    console.log('🔄 Mapping unified dashboard category consumption:', response.categoryConsumption);
    const categories = response.categoryConsumption.map(cat => ({
      name: cat.category,
      value: cat.kwh,
      percentage: cat.percentage,
      color: this.getCategoryColor(cat.category)
    }));
    
    const totalConsumption = categories.reduce((sum, cat) => sum + cat.value, 0);
    
    return new ConsumptionByCategory(
      categories,
      totalConsumption
    );
  }

  private static getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Lighting': '#4CAF50',
      'HVAC': '#2196F3',
      'Entertainment': '#FF9800',
      'Kitchen': '#F44336',
      'Office': '#9C27B0',
      'Other': '#757575'
    };
    return colors[category] || '#757575';
  }
}
