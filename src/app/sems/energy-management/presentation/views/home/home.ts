import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { StatsCard } from '../../components/stats-card/stats-card';
import { DailyChart } from '../../components/daily-chart/daily-chart';
import { CategoryChart } from '../../components/category-chart/category-chart';
import { MonthlyChart } from '../../components/monthly-chart/monthly-chart';
import { DeviceList } from '../../components/device-list/device-list';
import { Device, DeviceStatus, DeviceType } from '../../../domain/model/entities/device.entity';
import { DailyConsumption } from '../../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../../domain/model/entities/monthly-comparison.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    TranslateModule,
    StatsCard,
    DailyChart,
    CategoryChart,
    MonthlyChart,
    DeviceList,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  // Mock data para el dashboard
  dashboardStats = {
    energyConsumption: 250,
    estimatedSavings: -15,
    activeDevices: 8,
    estimatedBill: 150.35,
    todayConsumption: 9.5,
    currency: 'S/.'
  };

  dailyConsumption = new DailyConsumption(
    new Date(),
    [
      { time: '00:00', value: 0.5 },
      { time: '02:00', value: 0.3 },
      { time: '04:00', value: 0.2 },
      { time: '06:00', value: 1.5 },
      { time: '08:00', value: 3.2 },
      { time: '10:00', value: 2.8 },
      { time: '12:00', value: 4.1 },
      { time: '14:00', value: 5.2 },
      { time: '16:00', value: 6.8 },
      { time: '18:00', value: 9.1 },
      { time: '20:00', value: 7.2 },
      { time: '22:00', value: 3.8 }
    ],
    45.8, // totalConsumption
    '18:00', // peakTime
    9.1 // peakValue
  );

  consumptionByCategory = new ConsumptionByCategory(
    [
      { name: 'Lighting', value: 30, percentage: 30, color: '#E3F2FD' },
      { name: 'Heating & Cooling', value: 25, percentage: 25, color: '#1976D2' },
      { name: 'Electronics', value: 20, percentage: 20, color: '#2196F3' },
      { name: 'Major Appliances', value: 15, percentage: 15, color: '#64B5F6' },
      { name: 'Other', value: 10, percentage: 10, color: '#BBDEFB' }
    ],
    100 // totalConsumption
  );

  monthlyComparison = new MonthlyComparison(
    [
      { month: 'Jun', year: 2025, consumption: 180 },
      { month: 'Jul', year: 2025, consumption: 220 },
      { month: 'Aug', year: 2025, consumption: 195 },
      { month: 'Sep', year: 2025, consumption: 250 }
    ],
    'Sep', // currentMonth
    15 // previousMonthComparison percentage
  );

  devices: Device[] = [
    new Device('1', 'Smart Lamp', 'Living Room', DeviceType.SMART_LAMP, DeviceStatus.ON),
    new Device('2', 'Smart TV', 'Living Room', DeviceType.SMART_TV, DeviceStatus.OFF),
    new Device('3', 'Smart Fan', 'Master Bedroom', DeviceType.SMART_FAN, DeviceStatus.OFF, 'Last active 2h ago')
  ];

  alerts = [
    {
      type: 'warning',
      title: 'High consumption detected!',
      message: 'Your usage is 20% above average in the last 3 hours.',
      icon: 'warning'
    },
    {
      type: 'info',
      title: 'Reminder:',
      message: 'You forgot to turn off the patio lights.',
      icon: 'info'
    }
  ];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Componente listo para mostrar datos
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
