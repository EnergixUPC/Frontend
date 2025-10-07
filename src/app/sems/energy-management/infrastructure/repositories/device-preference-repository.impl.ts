import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DevicePreference } from '../../domain/model/entities/device-preference.entity';
import { DevicePreferenceRepository } from '../../domain/model/repositories/device-preference.repository';
import { DevicePreferenceResponse, DevicePreferenceRequest } from '../response/device-preference.response';
import { environment } from '../../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DevicePreferenceRepositoryImpl implements DevicePreferenceRepository {
  private readonly apiUrl = `${environment.apiUrl}/devicePreferences`;

  constructor(private readonly http: HttpClient) {}

  getDevicePreferences(userId: string): Observable<DevicePreference> {
    return this.http.get<DevicePreferenceResponse>(this.apiUrl)
      .pipe(
        map(response => this.mapToDevicePreference(response)),
        catchError(() => of(this.getDefaultPreferences(userId)))
      );
  }

  updateDevicePreferences(preferences: DevicePreference): Observable<DevicePreference> {
    // For json-server, we need to send to /devicePreferences (not as an array)
    // Since devicePreferences is a single object in our db.json, we'll update it directly
    const updateData = {
      id: 1, // Fixed ID for our single preferences object
      userId: preferences.userId,
      preferences: preferences.preferences,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Sending PUT request to:', this.apiUrl);
    console.log('Update data:', updateData);
    
    return this.http.put<DevicePreferenceResponse>(this.apiUrl, updateData)
      .pipe(
        map(response => {
          console.log('PUT response received:', response);
          return this.mapToDevicePreference(response);
        }),
        catchError((error) => {
          console.error('Error updating preferences with PUT:', error);
          console.error('Error details:', error.error);
          console.error('Status:', error.status);
          // Return the original preferences to prevent UI breaking
          return of(preferences);
        })
      );
  }

  private mapToDevicePreference(response: DevicePreferenceResponse): DevicePreference {
    return {
      id: response.id.toString(),
      userId: response.userId,
      preferences: response.preferences,
      lastUpdated: response.lastUpdated
    };
  }

  private mapToDevicePreferenceRequest(preferences: DevicePreference): DevicePreferenceRequest {
    return {
      userId: preferences.userId,
      preferences: preferences.preferences
    };
  }

  private getDefaultPreferences(userId: string): DevicePreference {
    return {
      id: '1',
      userId: userId,
      preferences: {
        enableEnergyMonitoring: true,
        receiveHighUsageAlerts: true,
        monitorHeatingCooling: true,
        monitorMajorAppliances: true,
        monitorElectronics: true,
        monitorKitchenDevices: false,
        includeOutdoorLighting: true,
        trackStandbyPower: true,
        dailySummaryEmails: false,
        weeklyProgressReports: true,
        suggestSavingAutomations: true,
        alertsForUnpluggedDevices: true
      },
      lastUpdated: new Date().toISOString()
    };
  }
}