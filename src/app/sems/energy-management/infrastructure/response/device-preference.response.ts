export interface DevicePreferenceResponse {
  id: number;
  userId: string;
  preferences: {
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
  };
  lastUpdated: string;
}

export interface DevicePreferenceRequest {
  userId: string;
  preferences: {
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
  };
}