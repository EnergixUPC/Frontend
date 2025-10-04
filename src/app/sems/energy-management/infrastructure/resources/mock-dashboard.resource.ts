import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  DashboardStatsResponse,
  DailyConsumptionResponse,
  ConsumptionByCategoryResponse,
  MonthlyComparisonResponse,
  DeviceResponse
} from '../response';

@Injectable({
  providedIn: 'root'
})
export class MockDashboardResource {
  
  getDashboardStats(): Observable<DashboardStatsResponse> {
    const mockData: DashboardStatsResponse = {
      energyConsumption: 250,
      estimatedSavings: -15,
      activeDevices: 8,
      estimatedBill: 150.35,
      todayConsumption: 9.5,
      currency: 'S/.'
    };
    return of(mockData).pipe(delay(100));
  }

  getDailyConsumption(): Observable<DailyConsumptionResponse> {
    const mockData: DailyConsumptionResponse = {
      date: new Date().toISOString(),
      dataPoints: [
        { time: '00:00', value: 0.5 },
        { time: '03:00', value: 0.3 },
        { time: '06:00', value: 0.4 },
        { time: '09:00', value: 1.2 },
        { time: '12:00', value: 2.5 },
        { time: '15:00', value: 3.8 },
        { time: '18:00', value: 8.5 },
        { time: '21:00', value: 5.2 },
        { time: '23:00', value: 2.1 }
      ],
      totalConsumption: 24.5,
      peakTime: '18:00',
      peakValue: 8.5
    };
    return of(mockData).pipe(delay(500));
  }

  getConsumptionByCategory(): Observable<ConsumptionByCategoryResponse> {
    const mockData: ConsumptionByCategoryResponse = {
      categories: [
        { name: 'Lighting', value: 45, percentage: 30, color: '#1976d2' },
        { name: 'Heating & Cooling', value: 38, percentage: 25, color: '#1e88e5' },
        { name: 'Electronics', value: 30, percentage: 20, color: '#42a5f5' },
        { name: 'Mayor Appliances', value: 22.5, percentage: 15, color: '#64b5f6' },
        { name: 'Other', value: 15, percentage: 10, color: '#90caf9' }
      ],
      totalConsumption: 150.5
    };
    return of(mockData).pipe(delay(500));
  }

  getMonthlyComparison(): Observable<MonthlyComparisonResponse> {
    const mockData: MonthlyComparisonResponse = {
      months: [
        { month: 'Jun', year: 2025, consumption: 180 },
        { month: 'Jul', year: 2025, consumption: 220 },
        { month: 'Aug', year: 2025, consumption: 195 },
        { month: 'Sep', year: 2025, consumption: 165 }
      ],
      currentMonth: 'Sep',
      previousMonthComparison: -15.4
    };
    return of(mockData).pipe(delay(500));
  }

  getDevices(): Observable<DeviceResponse[]> {
    const mockData: DeviceResponse[] = [
      {
        id: '1',
        name: 'Smart Lamp',
        location: 'Living Room',
        type: 'Smart Lamp',
        status: 'ON',
        consumption: 0.05
      },
      {
        id: '2',
        name: 'Smart TV',
        location: 'Living Room',
        type: 'Smart TV',
        status: 'OFF',
        lastActive: 'Last active 2h ago'
      },
      {
        id: '3',
        name: 'Smart Fan',
        location: 'Master Bedroom',
        type: 'Smart Fan',
        status: 'OFF',
        lastActive: 'Last active 2h ago'
      }
    ];
    return of(mockData).pipe(delay(500));
  }
}
