export interface SettingsResponse {
  id: string;
  userId: string;
  autoSavingMode: {
    turnOffPatio: boolean;
    turnOffDevices: boolean;
    unplugWeekdays: boolean;
    runDishwasher: boolean;
  };
  notifications: {
    highConsumption: boolean;
    summary: boolean;
    scheduleStart: string;
    scheduleEnd: string;
  };
  reportFrequencies: string[];
  reportFormats: string[];
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  savingRules?: {
    id: string;
    name: string;
    isEnabled: boolean;
  }[];
}
