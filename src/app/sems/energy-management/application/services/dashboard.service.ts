import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { DashboardStore } from '../state/dashboard.store';
import { DashboardRepositoryImpl } from '../../infrastructure/repositories/dashboard-repository.impl';
import { DashboardStats } from '../../domain/model/entities/dashboard-stats.entity';
import { DailyConsumption } from '../../domain/model/entities/daily-consumption.entity';
import { ConsumptionByCategory } from '../../domain/model/entities/consumption-by-category.entity';
import { MonthlyComparison } from '../../domain/model/entities/monthly-comparison.entity';
import { Device } from '../../domain/model/device.entity';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryImpl,
    private readonly dashboardStore: DashboardStore
  ) { }

  loadUnifiedDashboard(): Observable<{ alerts: any[] }> {
    console.log('Loading unified dashboard data...');
    return this.dashboardRepository.getUnifiedDashboard().pipe(
      tap(data => {
        console.log('Unified dashboard data loaded successfully');
        this.dashboardStore.setStats(data.stats);
        this.dashboardStore.setDailyConsumption(data.dailyConsumption);
        this.dashboardStore.setConsumptionByCategory(data.categoryConsumption);
        this.dashboardStore.setDevices(data.devices);
      }),
      map(data => ({ alerts: data.alerts })),
      catchError(error => {
        console.error('Error loading unified dashboard:', error);
        this.dashboardStore.setError(error.message || 'Error loading dashboard');
        throw error;
      })
    );
  }

  loadDashboardStats(): Observable<DashboardStats> {
    return this.dashboardRepository.getDashboardStats().pipe(
      tap(stats => {
        this.dashboardStore.setStats(stats);
      }),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading dashboard stats');
        throw error;
      })
    );
  }

  loadDailyConsumption(date: Date = new Date()): Observable<DailyConsumption> {
    return this.dashboardRepository.getDailyConsumption(date).pipe(
      tap(consumption => {
        this.dashboardStore.setDailyConsumption(consumption);
      }),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading daily consumption');
        throw error;
      })
    );
  }

  loadConsumptionByCategory(): Observable<ConsumptionByCategory> {
    return this.dashboardRepository.getConsumptionByCategory().pipe(
      tap(consumption => {
        this.dashboardStore.setConsumptionByCategory(consumption);
      }),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading consumption by category');
        throw error;
      })
    );
  }

  loadMonthlyComparison(): Observable<MonthlyComparison> {
    return this.dashboardRepository.getMonthlyComparison().pipe(
      tap(comparison => {
        this.dashboardStore.setMonthlyComparison(comparison);
      }),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading monthly comparison');
        throw error;
      })
    );
  }

  loadDevices(): Observable<Device[]> {
    return this.dashboardRepository.getDevices().pipe(
      tap(devices => {
        this.dashboardStore.setDevices(devices);
      }),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading devices');
        throw error;
      })
    );
  }

  // Methods without loading state management for parallel loading
  loadDashboardStatsWithoutLoading(): Observable<DashboardStats> {
    return this.dashboardRepository.getDashboardStats().pipe(
      tap(stats => this.dashboardStore.setStats(stats)),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading dashboard stats');
        throw error;
      })
    );
  }

  loadDailyConsumptionWithoutLoading(date: Date = new Date()): Observable<DailyConsumption> {
    return this.dashboardRepository.getDailyConsumption(date).pipe(
      tap(consumption => this.dashboardStore.setDailyConsumption(consumption)),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading daily consumption');
        throw error;
      })
    );
  }

  loadConsumptionByCategoryWithoutLoading(): Observable<ConsumptionByCategory> {
    return this.dashboardRepository.getConsumptionByCategory().pipe(
      tap(category => this.dashboardStore.setConsumptionByCategory(category)),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading consumption by category');
        throw error;
      })
    );
  }

  loadMonthlyComparisonWithoutLoading(): Observable<MonthlyComparison> {
    return this.dashboardRepository.getMonthlyComparison().pipe(
      tap(monthly => this.dashboardStore.setMonthlyComparison(monthly)),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading monthly comparison');
        throw error;
      })
    );
  }

  loadDevicesWithoutLoading(): Observable<Device[]> {
    return this.dashboardRepository.getDevices().pipe(
      tap(devices => this.dashboardStore.setDevices(devices)),
      catchError(error => {
        this.dashboardStore.setError(error.message || 'Error loading devices');
        throw error;
      })
    );
  }

  // Direct access to store methods
  setLoading(loading: boolean): void {
    this.dashboardStore.setLoading(loading);
  }

  getDashboardState() {
    return this.dashboardStore.dashboardState$;
  }

  clearError(): void {
    this.dashboardStore.setError(undefined);
  }

  resetDashboard(): void {
    this.dashboardStore.reset();
  }

  loadAlerts(): Observable<any[]> {
    return this.dashboardRepository.getAlerts().pipe(
      catchError(error => {
        console.error('Error loading alerts:', error);
        return of([]);
      })
    );
  }
}
