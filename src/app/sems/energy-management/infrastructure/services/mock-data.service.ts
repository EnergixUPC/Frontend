import { Injectable } from '@angular/core';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison, MonthlyData } from '../../domain/model/entities/monthly-comparison.entity';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  generateDailyConsumption(): DailyConsumption {
    const dataPoints = [];
    const baseConsumption = 5;

    for (let hour = 0; hour < 24; hour++) {
      let value = baseConsumption;

      if (hour >= 7 && hour <= 9) value += Math.random() * 3 + 2;
      if (hour >= 12 && hour <= 14) value += Math.random() * 2 + 1;
      if (hour >= 18 && hour <= 22) value += Math.random() * 4 + 3;
      if (hour >= 0 && hour <= 6) value = Math.random() * 2 + 1;

      dataPoints.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        value: parseFloat(value.toFixed(2))
      });
    }

    const totalConsumption = parseFloat(dataPoints.reduce((sum, p) => sum + p.value, 0).toFixed(2));

    // Encontrar hora pico
    const peakDataPoint = dataPoints.reduce((max, point) =>
      point.value > max.value ? point : max
    );

    // Usar constructor completo
    return new DailyConsumption(
      new Date(),
      dataPoints,
      totalConsumption,
      peakDataPoint.time,
      peakDataPoint.value
    );
  }

  generateConsumptionByCategory(): ConsumptionByCategory {
    const categories = [
      { name: 'HVAC', value: 35, percentage: 35, color: '#FF6384' },
      { name: 'Lighting', value: 25, percentage: 25, color: '#36A2EB' },
      { name: 'Equipment', value: 20, percentage: 20, color: '#FFCE56' },
      { name: 'Kitchen', value: 15, percentage: 15, color: '#4BC0C0' },
      { name: 'Others', value: 5, percentage: 5, color: '#9966FF' }
    ];

    const totalConsumption = categories.reduce((sum, cat) => sum + cat.value, 0);

    // Usar constructor completo
    return new ConsumptionByCategory(categories, totalConsumption);
  }

  generateMonthlyComparison(): MonthlyComparison {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('en', { month: 'short' });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const allMonths: MonthlyData[] = [];

    months.forEach(month => {
      allMonths.push({
        month,
        year: currentYear,
        consumption: parseFloat((Math.random() * 300 + 200).toFixed(2))
      });
    });

    // Calcular comparación con mes anterior
    const currentMonthIndex = months.indexOf(currentMonth);
    const previousMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : months.length - 1;

    const currentMonthData = allMonths[currentMonthIndex];
    const previousMonthData = allMonths[previousMonthIndex];

    const comparison = currentMonthData && previousMonthData
      ? ((currentMonthData.consumption - previousMonthData.consumption) / previousMonthData.consumption) * 100
      : 0;

    // Usar constructor completo
    return new MonthlyComparison(
      allMonths,
      currentMonth,
      parseFloat(comparison.toFixed(2))
    );
  }
}
