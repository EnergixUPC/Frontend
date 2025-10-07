import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevicePreference, PreferenceSettings } from '../../domain/model/entities/device-preference.entity';
import { DevicePreferenceRepository, DEVICE_PREFERENCE_REPOSITORY_TOKEN } from '../../domain/model/repositories/device-preference.repository';

@Injectable({
  providedIn: 'root'
})
export class DevicePreferenceService {
  constructor(
    @Inject(DEVICE_PREFERENCE_REPOSITORY_TOKEN) 
    private readonly devicePreferenceRepository: DevicePreferenceRepository
  ) {}

  getDevicePreferences(userId: string): Observable<DevicePreference> {
    return this.devicePreferenceRepository.getDevicePreferences(userId);
  }

  updateDevicePreferences(preferences: DevicePreference): Observable<DevicePreference> {
    return this.devicePreferenceRepository.updateDevicePreferences(preferences);
  }

  updatePreferenceSetting(
    currentPreferences: DevicePreference, 
    key: keyof PreferenceSettings, 
    value: boolean
  ): DevicePreference {
    return {
      ...currentPreferences,
      preferences: {
        ...currentPreferences.preferences,
        [key]: value
      },
      lastUpdated: new Date().toISOString()
    };
  }

  resetToDefaults(): PreferenceSettings {
    return {
      enableEnergyMonitoring: false,
      receiveHighUsageAlerts: false,
      monitorHeatingCooling: false,
      monitorMajorAppliances: false,
      monitorElectronics: false,
      monitorKitchenDevices: false,
      includeOutdoorLighting: false,
      trackStandbyPower: false,
      dailySummaryEmails: false,
      weeklyProgressReports: false,
      suggestSavingAutomations: false,
      alertsForUnpluggedDevices: false
    };
  }
}