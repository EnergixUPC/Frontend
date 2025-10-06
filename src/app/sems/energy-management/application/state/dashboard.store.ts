import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardStats } from '../../domain/model/entities/dashboard-stats.entity';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../domain/model/entities/monthly-comparison.entity';
import { Device } from '../../domain/model/device.entity';

export interface DashboardState {
  stats: DashboardStats | undefined;
  dailyConsumption: DailyConsumption | undefined;
  consumptionByCategory: ConsumptionByCategory | undefined;
  monthlyComparison: MonthlyComparison | undefined;
  devices: Device[];
  loading: boolean;
  error: string | undefined;
}

const initialState: DashboardState = {
  stats: undefined,
  dailyConsumption: undefined,
  consumptionByCategory: undefined,
  monthlyComparison: undefined,
  devices: [],
  loading: false, // Always start with false to avoid infinite loading
  error: undefined
};

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private readonly state$ = new BehaviorSubject<DashboardState>(initialState);

  public readonly dashboardState$: Observable<DashboardState> = this.state$.asObservable();

  get currentState(): DashboardState {
    return this.state$.value;
  }

  setStats(stats: DashboardStats): void {
    this.updateState({ stats });
  }

  setDailyConsumption(dailyConsumption: DailyConsumption): void {
    this.updateState({ dailyConsumption });
  }

  setConsumptionByCategory(consumptionByCategory: ConsumptionByCategory): void {
    this.updateState({ consumptionByCategory });
  }

  setMonthlyComparison(monthlyComparison: MonthlyComparison): void {
    this.updateState({ monthlyComparison });
  }

  setDevices(devices: Device[]): void {
    this.updateState({ devices });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | undefined): void {
    this.updateState({ error });
  }

  reset(): void {
    this.state$.next(initialState);
  }

  private updateState(partial: Partial<DashboardState>): void {
    this.state$.next({
      ...this.currentState,
      ...partial
    });
  }
}
