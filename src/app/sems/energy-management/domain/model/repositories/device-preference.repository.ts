import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { DevicePreference } from '../entities/device-preference.entity';

export interface DevicePreferenceRepository {
  getDevicePreferences(userId: string): Observable<DevicePreference>;
  updateDevicePreferences(preferences: DevicePreference): Observable<DevicePreference>;
}

export const DEVICE_PREFERENCE_REPOSITORY_TOKEN = new InjectionToken<DevicePreferenceRepository>('DevicePreferenceRepository');