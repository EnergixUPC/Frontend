import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { StatsCard } from '../../components/stats-card/stats-card';
import { SimulationService, SimSnapshot } from '../../../infrastructure/services/simulation.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    BaseChartDirective,
    StatsCard
  ],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css'
})
export class Simulation implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  snapshot!: SimSnapshot;

  /** US20/US25: true cuando se accede vía la ruta pública /demo (sin sesión), en vez de /simulation dentro del panel autenticado. */
  isPublicDemo = false;

  chartData: ChartData<'line'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false };

  constructor(
    private simulationService: SimulationService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isPublicDemo = !!this.route.snapshot.data['publicDemo'];
    this.regenerate();
    // Translations are fetched over HTTP and applied via setTranslation(),
    // which can resolve after this view's first render (fires onTranslationChange,
    // not onLangChange) — rebuild the chart labels when either occurs.
    this.translate.onLangChange.subscribe(() => this.refreshChart());
    this.translate.onTranslationChange.subscribe(() => this.refreshChart());
  }

  private refreshChart(): void {
    this.buildChart();
    this.cdr.detectChanges();
    setTimeout(() => this.chart?.update(), 0);
  }

  regenerate(): void {
    this.snapshot = this.simulationService.generate();
    this.refreshChart();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goToRegister(): void {
    this.router.navigate(['/register'], {
      state: {
        fromDemo: true,
        weeklyKwh: this.snapshot.currentWeekKwh,
        savingsPct: this.snapshot.potentialSavingsPct
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ---- KPI helpers (formatted for the reused stats cards) ----
  private get unitKwh(): string {
    return this.translate.instant('dashboard.units.kwh');
  }

  private get currency(): string {
    return this.translate.instant('dashboard.units.currency');
  }

  get currentWeekValue(): string {
    return `${this.snapshot.currentWeekKwh.toFixed(1)} ${this.unitKwh}`;
  }

  get currentWeekSubtitle(): string {
    const cost = this.snapshot.currentWeekKwh * 0.6034;
    return `${this.currency} ${cost.toFixed(2)} ${this.translate.instant('simulation.stats.thisWeek')}`;
  }

  get predictedWeekValue(): string {
    return `${this.snapshot.predictedWeekKwh.toFixed(1)} ${this.unitKwh}`;
  }

  get predictedWeekSubtitle(): string {
    const diff = this.snapshot.predictedWeekKwh - this.snapshot.currentWeekKwh;
    const pct = this.snapshot.currentWeekKwh > 0
      ? (diff / this.snapshot.currentWeekKwh) * 100
      : 0;
    const sign = pct >= 0 ? '+' : '';
    const trendKey = pct >= 0 ? 'simulation.stats.vsCurrentUp' : 'simulation.stats.vsCurrentDown';
    return `${sign}${pct.toFixed(1)}% ${this.translate.instant(trendKey)}`;
  }

  get monthlyBillValue(): string {
    return `${this.currency} ${this.snapshot.predictedMonthlyBill.toFixed(2)}`;
  }

  get savingsValue(): string {
    return `${this.currency} ${this.snapshot.potentialSavingsCost.toFixed(2)}`;
  }

  get savingsSubtitle(): string {
    return `${this.snapshot.potentialSavingsPct.toFixed(1)}% ${this.translate.instant('simulation.stats.perMonth')}`;
  }

  get topDeviceValue(): string {
    return this.translate.instant(this.snapshot.topApplianceNameKey);
  }

  get topDeviceSubtitle(): string {
    const top = this.snapshot.appliances[0];
    return `${top.sharePct.toFixed(1)}% ${this.translate.instant('simulation.appliances.share')}`;
  }

  get devicesValue(): string {
    return `${this.snapshot.activeCount} / ${this.snapshot.totalCount}`;
  }

  translateParams(message: { params?: Record<string, string | number> }): Record<string, string | number> {
    const params = { ...(message.params ?? {}) };
    // Resolver claves de dispositivo a su nombre traducido antes de interpolar.
    if (typeof params['deviceKey'] === 'string') {
      params['device'] = this.translate.instant(params['deviceKey'] as string);
    }
    return params;
  }

  private buildChart(): void {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'es';
    const historyLabels = this.snapshot.historyDates.map(iso => this.formatLabel(iso, lang));
    const forecastLabels = this.snapshot.forecastDates.map(iso => this.formatLabel(iso, lang));
    const labels = [...historyLabels, ...forecastLabels];

    const historyLen = this.snapshot.historySeries.length;
    const forecastLen = this.snapshot.forecastSeries.length;
    const lastHistory = this.snapshot.historySeries[historyLen - 1];

    const historyData: (number | null)[] = [
      ...this.snapshot.historySeries,
      ...new Array(forecastLen).fill(null)
    ];

    // La predicción arranca en el último punto real para dibujar una línea continua.
    const forecastData: (number | null)[] = [
      ...new Array(historyLen - 1).fill(null),
      lastHistory,
      ...this.snapshot.forecastSeries
    ];

    this.chartData = {
      labels,
      datasets: [
        {
          data: historyData,
          label: this.translate.instant('simulation.chart.history'),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: false
        },
        {
          data: forecastData,
          label: this.translate.instant('simulation.chart.forecast'),
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderWidth: 2,
          borderDash: [6, 6],
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { padding: 16, font: { size: 12, weight: 'bold' }, usePointStyle: true }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 12,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (typeof value !== 'number') {
                return '';
              }
              return `${context.dataset.label}: ${value.toFixed(2)} kWh`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'kWh' },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    };
  }

  private formatLabel(iso: string, lang: string): string {
    const date = new Date(iso);
    const locale = lang === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' });
  }
}
