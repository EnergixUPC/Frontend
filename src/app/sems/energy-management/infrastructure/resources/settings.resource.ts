// src/app/sems/energy-management/infrastructure/resources/settings.resource.ts
export interface SavingRule {
  id: number;
  name: string;
  isEnabled: boolean;
}

export interface SettingsResource {
  id: number;
  userId: number;
  notificationsEnabled: boolean;
  highConsumptionAlerts: boolean;
  dailyWeeklySummary: boolean;
  notificationScheduleStart: string;
  notificationScheduleEnd: string;
  reportDaily: boolean;
  reportWeekly: boolean;
  reportMonthly: boolean;
  reportFormatPdf: boolean;
  reportFormatCsv: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  savingRules?: SavingRule[];
}
