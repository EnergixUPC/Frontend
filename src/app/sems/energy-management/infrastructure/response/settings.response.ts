export interface SettingsResponse {
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
  savingRules?: {
    id: number;
    name: string;
    isEnabled: boolean;
  }[];
}
