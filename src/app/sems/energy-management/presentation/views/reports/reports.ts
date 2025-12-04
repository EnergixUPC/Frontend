import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WeeklyChart } from '../../components/weekly-chart/weekly-chart';
import { DeviceChart } from '../../components/device-chart/device-chart';
import { ExportCard } from '../../components/export-card/export-card';

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
    ExportCard
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  insightCards: InsightCard[] = [];

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    this.initializeInsightCards();
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
