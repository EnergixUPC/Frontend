// src/app/sems/energy-management/infrastructure/request/settings.request.ts
export interface SettingsRequest {
  id?: number;
  userId?: number;
  notificationsEnabled?: boolean;
  highConsumptionAlerts?: boolean;
  dailyWeeklySummary?: boolean;
  notificationScheduleStart?: string;
  notificationScheduleEnd?: string;
  reportDaily?: boolean;
  reportWeekly?: boolean;
  reportMonthly?: boolean;
  reportFormatPdf?: boolean;
  reportFormatCsv?: boolean;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: string;
  savingRules?: {
    id?: number;
    name?: string;
    isEnabled?: boolean;
  }[];
}
