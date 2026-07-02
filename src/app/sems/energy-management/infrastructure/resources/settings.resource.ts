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
  // US23: horario de hora punta y umbral de alerta propios del usuario.
  peakHourStart: string | null;
  peakHourEnd: string | null;
  highConsumptionThresholdKwh: number | null;
  reportDaily: boolean;
  reportWeekly: boolean;
  reportMonthly: boolean;
  reportFormatPdf: boolean;
  reportFormatCsv: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  savingRules?: SavingRule[];
}
