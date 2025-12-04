import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DevicePreference, PreferenceSettings } from '../../../domain/model/entities/device-preference.entity';
import { DevicePreferenceService } from '../../../application/services/device-preference.service';

interface PreferenceItem {
  key: string;
  enabled: boolean;
}

interface PreferenceGroup {
  title: string;
  preferences: PreferenceItem[];
}

@Component({
  selector: 'app-device-preferences',
  imports: [CommonModule, TranslateModule],
  templateUrl: './device-preferences.html',
  styleUrl: './device-preferences.css'
})
export class DevicePreferences implements OnInit, OnDestroy {

  devicePreferences: DevicePreference | null = null;
  originalPreferences: DevicePreference | null = null;
  loading = true;
  error: string | null = null;
  preferenceGroups: PreferenceGroup[] = [];
  saving = false;
  saveSuccess = false;
  hasUnsavedChanges = false;

  private destroy$ = new Subject<void>();
  private readonly currentUserId = '1'; // Numeric ID expected by API

  // Group structure only
  private readonly groupStructure = [
    {
      title: 'Monitoring Settings',
      keys: ['enableEnergyMonitoring', 'receiveHighUsageAlerts', 'monitorHeatingCooling']
    },
    {
      title: 'Device Categories',
      keys: ['monitorMajorAppliances', 'monitorElectronics', 'monitorKitchenDevices']
    },
    {
      title: 'Additional Features',
      keys: ['includeOutdoorLighting', 'trackStandbyPower', 'dailySummaryEmails']
    },
    {
      title: 'Automation & Alerts',
      keys: ['weeklyProgressReports', 'suggestSavingAutomations', 'alertsForUnpluggedDevices']
    }
  ];

  constructor(
    private readonly devicePreferenceService: DevicePreferenceService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDevicePreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDevicePreferences(): void {
    this.loading = true;
    this.error = null;

    this.devicePreferenceService.getDevicePreferences(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {

          // Asegurar userId correcto
          preferences.userId = this.currentUserId;

          this.devicePreferences = preferences;
          this.originalPreferences = JSON.parse(JSON.stringify(preferences));
          this.buildPreferenceGroupsFromData();
          this.hasUnsavedChanges = false;
          this.loading = false;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          this.error = 'Error loading preferences';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private buildPreferenceGroupsFromData(): void {
    if (!this.devicePreferences) return;

    this.preferenceGroups = this.groupStructure.map(group => ({
      title: group.title,
      preferences: group.keys.map(key => {
        const value = this.devicePreferences!.preferences[key as keyof PreferenceSettings];
        return {
          key: key,
          enabled: value ?? false
        };
      })
    }));
  }

  onPreferenceChange(key: string, enabled: boolean): void {
    if (!this.devicePreferences) return;

    // Update local state only
    this.devicePreferences = {
      ...this.devicePreferences,
      preferences: {
        ...this.devicePreferences.preferences,
        [key as keyof PreferenceSettings]: enabled
      },
      lastUpdated: new Date().toISOString()
    };

    // Update the UI groups
    this.updatePreferenceInGroups(key, enabled);

    // Check for unsaved changes
    this.checkForUnsavedChanges();

    this.cdr.detectChanges();
  }

  private updatePreferenceInGroups(key: string, enabled: boolean): void {
    this.preferenceGroups.forEach(group => {
      const pref = group.preferences.find(p => p.key === key);
      if (pref) {
        pref.enabled = enabled;
      }
    });
  }

  private checkForUnsavedChanges(): void {
    if (!this.devicePreferences || !this.originalPreferences) return;

    this.hasUnsavedChanges = JSON.stringify(this.devicePreferences.preferences) !==
      JSON.stringify(this.originalPreferences.preferences);
  }

  onResetToDefault(): void {
    if (!this.devicePreferences) return;

    // Get defaults (all false)
    const defaults = this.devicePreferenceService.resetToDefaults();

    const updatedPreferences: DevicePreference = {
      ...this.devicePreferences,
      userId: this.currentUserId, // Asegurar userId correcto
      preferences: defaults,
      lastUpdated: new Date().toISOString()
    };

    // Save immediately
    this.devicePreferenceService.updateDevicePreferences(updatedPreferences)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (saved) => {
          this.devicePreferences = saved;
          this.originalPreferences = JSON.parse(JSON.stringify(saved));
          this.buildPreferenceGroupsFromData();
          this.hasUnsavedChanges = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error saving reset:', error);
          // Update UI anyway
          this.devicePreferences = updatedPreferences;
          this.buildPreferenceGroupsFromData();
          this.cdr.detectChanges();
        }
      });
  }

  onSavePreferences(): void {
    if (!this.devicePreferences) return;

    // Asegurar userId correcto antes de enviar
    this.devicePreferences.userId = this.currentUserId;

    this.saving = true;
    this.saveSuccess = false;
    this.error = null;
    this.cdr.detectChanges();

    this.devicePreferenceService.updateDevicePreferences(this.devicePreferences)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {

          this.devicePreferences = updated;
          this.originalPreferences = JSON.parse(JSON.stringify(updated));
          this.saving = false;
          this.saveSuccess = true;
          this.hasUnsavedChanges = false;

          this.cdr.detectChanges();

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.saveSuccess = false;
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (error) => {
          console.error('Error saving preferences:', error);

          this.saving = false;
          this.error = 'Error guardando preferencias';

          this.cdr.detectChanges();

          // Hide error after 5 seconds
          setTimeout(() => {
            this.error = null;
            this.cdr.detectChanges();
          }, 5000);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/devices']);
  }

  // Translation getters
  get titleText(): string {
    return this.translateService.instant('dashboard.preferences.title');
  }

  get resetToDefaultText(): string {
    return this.translateService.instant('dashboard.preferences.resetToDefault');
  }

  get savePreferencesText(): string {
    return this.translateService.instant('dashboard.preferences.savePreferences');
  }

  get saveSuccessText(): string {
    return this.translateService.instant('dashboard.preferences.saveSuccess');
  }

  getPreferenceLabel(key: string): string {
    return this.translateService.instant(`dashboard.preferences.${key}`);
  }
}
