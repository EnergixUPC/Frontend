export interface DevicePreference {
  id: string;
  userId: string;
  preferences: PreferenceSettings;
  lastUpdated: string;
}

export interface PreferenceSettings {
  enableEnergyMonitoring: boolean;
  receiveHighUsageAlerts: boolean;
  monitorHeatingCooling: boolean;
  monitorMajorAppliances: boolean;
  monitorElectronics: boolean;
  monitorKitchenDevices: boolean;
  includeOutdoorLighting: boolean;
  trackStandbyPower: boolean;
  dailySummaryEmails: boolean;
  weeklyProgressReports: boolean;
  suggestSavingAutomations: boolean;
  alertsForUnpluggedDevices: boolean;
}

export interface PreferenceGroup {
  title: string;
  preferences: PreferenceItem[];
}

export interface PreferenceItem {
  key: keyof PreferenceSettings;
  label: string;
  enabled: boolean;
}