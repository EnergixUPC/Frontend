import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WeeklyChart } from '../../components/weekly-chart/weekly-chart';
import { DeviceChart } from '../../components/device-chart/device-chart';
import { ExportCard } from '../../components/export-card/export-card';
import { MonthlyChart } from '../../components/monthly-chart/monthly-chart';
import { CategoryChart } from '../../components/category-chart/category-chart';
import { DashboardService } from '../../../application/services/dashboard.service';
import { ReportService } from '../../../application/services/report.service';

interface InsightCard {
  type: 'success' | 'tip';
  titleKey: string;
  messageKey: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reports',
  imports: [
    CommonModule,
    TranslateModule,
    WeeklyChart,
    DeviceChart,
    MonthlyChart,
    CategoryChart,
    ExportCard
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  insightCards: InsightCard[] = [];
  categoryData: any[] = [];
  monthlyData: any = null;

  constructor(
    private translate: TranslateService,
    private dashboardService: DashboardService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.initializeInsightCards();
    this.fetchCategoryData();
    this.fetchMonthlyData();
  }

  private fetchCategoryData(): void {
    this.dashboardService.loadUnifiedDashboard().subscribe({
      next: (data) => {
        if (data && data.categoryConsumption && data.categoryConsumption.categories) {
          this.categoryData = data.categoryConsumption.categories;
        }
      },
      error: (err) => console.error('Error loading category data:', err)
    });
  }

  private fetchMonthlyData(): void {
    this.reportService.getMonthlyHistory().subscribe({
      next: (data) => {
        if (data) {
          this.monthlyData = data;
        }
      },
      error: (err) => console.error('Error loading monthly data:', err)
    });
  }

  private initializeInsightCards(): void {
    this.insightCards = [
      {
        type: 'success',
        titleKey: 'reports.insights.greatMonth.title',
        messageKey: 'reports.insights.greatMonth.message',
        icon: '',
        color: '#4A90E2'
      },
      {
        type: 'tip',
        titleKey: 'reports.insights.tip.title',
        messageKey: 'reports.insights.tip.message',
        icon: '',
        color: '#5B9BD5'
      }
    ];
  }
}
