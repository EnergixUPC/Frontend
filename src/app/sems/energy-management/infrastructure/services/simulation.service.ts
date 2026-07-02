import { Injectable } from '@angular/core';

/**
 * SimulationService
 *
 * Genera un escenario de consumo eléctrico de electrodomésticos con datos
 * SIMULADOS (de prueba). Produce 7 días de histórico y una predicción realista
 * de los próximos 7 días usando una descomposición sencilla de
 * tendencia + estacionalidad semanal (fin de semana), y calcula métricas y
 * recomendaciones orientadas a reducir el consumo.
 *
 * IMPORTANTE: ningún dato aquí proviene del backend; es exclusivamente
 * demostrativo.
 */

export type SimTrend = 'up' | 'down' | 'stable';
export type SimMessageType = 'warning' | 'info' | 'success';

export interface SimAppliance {
  id: string;
  nameKey: string;
  icon: string;
  iconClass: string;
  powerWatts: number;
  weeklyKwh: number;
  predictedWeeklyKwh: number;
  weeklyCost: number;
  sharePct: number;
  trend: SimTrend;
  trendPct: number;
}

export interface SimMessage {
  type: SimMessageType;
  icon: string;
  titleKey: string;
  messageKey: string;
  params?: Record<string, string | number>;
}

export interface SimSnapshot {
  generatedAt: Date;
  historyDates: string[];
  historySeries: number[];
  forecastDates: string[];
  forecastSeries: number[];
  appliances: SimAppliance[];
  currentWeekKwh: number;
  predictedWeekKwh: number;
  predictedMonthlyBill: number;
  potentialSavingsKwh: number;
  potentialSavingsCost: number;
  potentialSavingsPct: number;
  topApplianceNameKey: string;
  activeCount: number;
  totalCount: number;
  alerts: SimMessage[];
  recommendations: SimMessage[];
}

interface ApplianceSpec {
  id: string;
  nameKey: string;
  icon: string;
  iconClass: string;
  power: number;
  baseDailyKwh: number;
  weekendFactor: number;
  slope: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  /** Tarifa residencial referencial (S/. por kWh), alineada con el dashboard real. */
  private readonly KWH_RATE = 0.6034;
  private readonly HISTORY_DAYS = 7;
  private readonly FORECAST_DAYS = 7;

  private readonly catalog: ApplianceSpec[] = [
    { id: 'ac', nameKey: 'simulation.names.ac', icon: 'ac_unit', iconClass: 'sim-cool', power: 1100, baseDailyKwh: 3.1, weekendFactor: 1.25, slope: 0.012 },
    { id: 'heater', nameKey: 'simulation.names.heater', icon: 'water_drop', iconClass: 'sim-heat', power: 1500, baseDailyKwh: 2.4, weekendFactor: 1.18, slope: 0.007 },
    { id: 'fridge', nameKey: 'simulation.names.fridge', icon: 'kitchen', iconClass: 'sim-cool', power: 150, baseDailyKwh: 1.3, weekendFactor: 1.04, slope: 0.001 },
    { id: 'lighting', nameKey: 'simulation.names.lighting', icon: 'lightbulb', iconClass: 'sim-warn', power: 220, baseDailyKwh: 1.15, weekendFactor: 1.06, slope: -0.004 },
    { id: 'pc', nameKey: 'simulation.names.pc', icon: 'computer', iconClass: 'sim-elec', power: 130, baseDailyKwh: 0.85, weekendFactor: 0.82, slope: 0.002 },
    { id: 'tv', nameKey: 'simulation.names.tv', icon: 'tv', iconClass: 'sim-elec', power: 110, baseDailyKwh: 0.6, weekendFactor: 1.3, slope: 0.0 },
    { id: 'washer', nameKey: 'simulation.names.washer', icon: 'local_laundry_service', iconClass: 'sim-water', power: 500, baseDailyKwh: 0.55, weekendFactor: 1.45, slope: -0.002 },
    { id: 'microwave', nameKey: 'simulation.names.microwave', icon: 'microwave', iconClass: 'sim-heat', power: 1000, baseDailyKwh: 0.35, weekendFactor: 1.12, slope: 0.0 }
  ];

  /** Construye un escenario completo de simulación. */
  generate(): SimSnapshot {
    const today = this.startOfDay(new Date());

    const historyDatesArr = this.buildDateRange(today, -this.HISTORY_DAYS + 1, 0);
    const forecastDatesArr = this.buildDateRange(today, 1, this.FORECAST_DAYS);

    const historySeries = new Array(this.HISTORY_DAYS).fill(0);
    const forecastSeries = new Array(this.FORECAST_DAYS).fill(0);
    const appliances: SimAppliance[] = [];

    for (const spec of this.catalog) {
      const historyDaily = historyDatesArr.map((date, index) => {
        const dow = this.dowFactor(date, spec.weekendFactor);
        const trend = 1 + spec.slope * (index - (this.HISTORY_DAYS - 1) / 2);
        const noise = 1 + (Math.random() - 0.5) * 0.18;
        return this.round(spec.baseDailyKwh * dow * trend * noise);
      });

      const forecastDaily = forecastDatesArr.map((date, index) => {
        const dow = this.dowFactor(date, spec.weekendFactor);
        // La predicción continúa la tendencia observada, sin ruido aleatorio.
        const trend = 1 + spec.slope * ((this.HISTORY_DAYS - 1) / 2 + index + 1);
        return this.round(spec.baseDailyKwh * dow * trend);
      });

      historyDaily.forEach((value, i) => (historySeries[i] += value));
      forecastDaily.forEach((value, i) => (forecastSeries[i] += value));

      const weeklyKwh = this.round(historyDaily.reduce((sum, v) => sum + v, 0));
      const predictedWeeklyKwh = this.round(forecastDaily.reduce((sum, v) => sum + v, 0));
      const trendPct = weeklyKwh > 0 ? ((predictedWeeklyKwh - weeklyKwh) / weeklyKwh) * 100 : 0;

      appliances.push({
        id: spec.id,
        nameKey: spec.nameKey,
        icon: spec.icon,
        iconClass: spec.iconClass,
        powerWatts: spec.power,
        weeklyKwh,
        predictedWeeklyKwh,
        weeklyCost: this.round(weeklyKwh * this.KWH_RATE, 2),
        sharePct: 0,
        trend: trendPct > 3 ? 'up' : trendPct < -3 ? 'down' : 'stable',
        trendPct: this.round(trendPct, 1)
      });
    }

    const currentWeekKwh = this.round(historySeries.reduce((sum, v) => sum + v, 0));
    const predictedWeekKwh = this.round(forecastSeries.reduce((sum, v) => sum + v, 0));

    appliances.forEach(appliance => {
      appliance.sharePct = currentWeekKwh > 0
        ? this.round((appliance.weeklyKwh / currentWeekKwh) * 100, 1)
        : 0;
    });
    appliances.sort((a, b) => b.weeklyKwh - a.weeklyKwh);

    const byId = (id: string) => appliances.find(a => a.id === id)?.weeklyKwh ?? 0;

    // Métricas de ahorro potencial (semanal) por tipo de medida.
    const standbyKwh = currentWeekKwh * 0.05;
    const climateOptKwh = (byId('ac') + byId('heater')) * 0.12;
    const lightingOptKwh = byId('lighting') * 0.2;
    const potentialSavingsKwh = this.round(standbyKwh + climateOptKwh + lightingOptKwh);
    const potentialSavingsPct = currentWeekKwh > 0
      ? this.round((potentialSavingsKwh / currentWeekKwh) * 100, 1)
      : 0;

    const dailyAvgPredicted = predictedWeekKwh / this.FORECAST_DAYS;
    const predictedMonthlyBill = this.round(dailyAvgPredicted * 30 * this.KWH_RATE, 2);
    const potentialSavingsCost = this.round(this.weeklyToMonthly(potentialSavingsKwh) * this.KWH_RATE, 2);

    const top = appliances[0];

    return {
      generatedAt: new Date(),
      historyDates: historyDatesArr.map(d => d.toISOString()),
      historySeries: historySeries.map(v => this.round(v)),
      forecastDates: forecastDatesArr.map(d => d.toISOString()),
      forecastSeries: forecastSeries.map(v => this.round(v)),
      appliances,
      currentWeekKwh,
      predictedWeekKwh,
      predictedMonthlyBill,
      potentialSavingsKwh,
      potentialSavingsCost,
      potentialSavingsPct,
      topApplianceNameKey: top.nameKey,
      activeCount: appliances.filter(a => a.weeklyKwh > 0).length,
      totalCount: appliances.length,
      alerts: this.buildAlerts(appliances, currentWeekKwh, predictedWeekKwh, standbyKwh),
      recommendations: this.buildRecommendations(climateOptKwh, standbyKwh, lightingOptKwh, byId('washer'))
    };
  }

  private buildAlerts(
    appliances: SimAppliance[],
    currentWeekKwh: number,
    predictedWeekKwh: number,
    standbyKwh: number
  ): SimMessage[] {
    const alerts: SimMessage[] = [];
    const top = appliances[0];

    if (top && top.sharePct >= 20) {
      alerts.push({
        type: 'warning',
        icon: 'warning',
        titleKey: 'simulation.alerts.highConsumption.title',
        messageKey: 'simulation.alerts.highConsumption.message',
        params: { device: '', deviceKey: top.nameKey, share: top.sharePct }
      });
    }

    const growthPct = currentWeekKwh > 0
      ? this.round(((predictedWeekKwh - currentWeekKwh) / currentWeekKwh) * 100, 1)
      : 0;

    if (growthPct > 4) {
      alerts.push({
        type: 'warning',
        icon: 'trending_up',
        titleKey: 'simulation.alerts.trendUp.title',
        messageKey: 'simulation.alerts.trendUp.message',
        params: { pct: growthPct }
      });
    } else if (growthPct < -4) {
      alerts.push({
        type: 'success',
        icon: 'trending_down',
        titleKey: 'simulation.alerts.trendDown.title',
        messageKey: 'simulation.alerts.trendDown.message',
        params: { pct: Math.abs(growthPct) }
      });
    }

    alerts.push({
      type: 'info',
      icon: 'power',
      titleKey: 'simulation.alerts.standby.title',
      messageKey: 'simulation.alerts.standby.message',
      params: {
        kwh: this.round(this.weeklyToMonthly(standbyKwh)),
        cost: this.round(this.weeklyToMonthly(standbyKwh) * this.KWH_RATE, 2)
      }
    });

    return alerts;
  }

  private buildRecommendations(
    climateOptKwh: number,
    standbyKwh: number,
    lightingOptKwh: number,
    washerWeeklyKwh: number
  ): SimMessage[] {
    const monthly = (weeklyKwh: number) => ({
      kwh: this.round(this.weeklyToMonthly(weeklyKwh)),
      cost: this.round(this.weeklyToMonthly(weeklyKwh) * this.KWH_RATE, 2)
    });

    return [
      {
        type: 'info',
        icon: 'thermostat',
        titleKey: 'simulation.recommendations.climate.title',
        messageKey: 'simulation.recommendations.climate.message',
        params: monthly(climateOptKwh)
      },
      {
        type: 'info',
        icon: 'schedule',
        titleKey: 'simulation.recommendations.offpeak.title',
        messageKey: 'simulation.recommendations.offpeak.message',
        params: monthly(washerWeeklyKwh * 0.1)
      },
      {
        type: 'info',
        icon: 'lightbulb',
        titleKey: 'simulation.recommendations.lighting.title',
        messageKey: 'simulation.recommendations.lighting.message',
        params: monthly(lightingOptKwh)
      },
      {
        type: 'info',
        icon: 'power_off',
        titleKey: 'simulation.recommendations.standby.title',
        messageKey: 'simulation.recommendations.standby.message',
        params: monthly(standbyKwh)
      }
    ];
  }

  private buildDateRange(reference: Date, fromOffset: number, toOffset: number): Date[] {
    const dates: Date[] = [];
    for (let offset = fromOffset; offset <= toOffset; offset++) {
      dates.push(new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + offset));
    }
    return dates;
  }

  private dowFactor(date: Date, weekendFactor: number): number {
    const day = date.getDay();
    return day === 0 || day === 6 ? weekendFactor : 1;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private weeklyToMonthly(weeklyKwh: number): number {
    return (weeklyKwh / this.HISTORY_DAYS) * 30;
  }

  private round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
