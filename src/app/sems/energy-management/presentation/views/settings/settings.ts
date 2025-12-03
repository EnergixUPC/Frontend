// src/app/sems/energy-management/presentation/views/settings/settings.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, filter } from 'rxjs';

import { SettingsService } from '../../../application/services/settings.service';
import { SettingsStore } from '../../../application/state/settings.store';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { SettingsResource } from '../../../infrastructure/resources/settings.resource';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentSettings: SettingsResource | null = null;
  editableSettings: Partial<SettingsResource> = {};
  hasChanges = false;
  currentUserId: string | null = null;

  constructor(
    private translate: TranslateService,
    private settingsService: SettingsService,
    private settingsStore: SettingsStore,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    console.log('🔷 Settings component constructed');
  }

  ngOnInit(): void {
    console.log('🔷 Settings ngOnInit');

    // Subscribe to auth state to handle page refreshes where user might not be immediately available
    this.authService.authState$
      .pipe(
        takeUntil(this.destroy$),
        filter(state => state.isAuthenticated && !!state.user)
      )
      .subscribe(state => {
        console.log('👤 Auth state updated:', state.user);
        if (state.user && state.user.id !== this.currentUserId) {
          this.currentUserId = state.user.id;
          console.log('✅ User ID set:', this.currentUserId);
          this.loadSettings();
        }
      });

    this.settingsStore.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        console.log('📦 Settings from store:', settings);
        if (settings) {
          this.currentSettings = settings;
          this.editableSettings = JSON.parse(JSON.stringify(settings));
          console.log('✅ Editable settings initialized:', this.editableSettings);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  loadSettings(): void {
    if (!this.currentUserId) return;

    console.log('📡 Loading settings for user:', this.currentUserId);

    this.settingsService.loadUserSettings(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('✅ Settings loaded:', settings);
        },
        error: (error) => {
          console.error('❌ Failed to load settings:', error);
          this.showError('Failed to load settings');
        }
      });
  }

  onAutoSavingModeChange(field: string, value: boolean): void {
    console.log('🔄 onAutoSavingModeChange:', field, '=', value);

    if (!this.editableSettings.autoSavingMode) {
      this.editableSettings.autoSavingMode = {
        turnOffPatio: false,
        turnOffDevices: false,
        unplugWeekdays: false,
        runDishwasher: false
      };
    }

    (this.editableSettings.autoSavingMode as any)[field] = value;
    this.hasChanges = true;

    console.log('✅ hasChanges:', this.hasChanges);
    console.log('✅ editableSettings:', this.editableSettings);
  }

  onNotificationChange(field: string, value: boolean | string): void {
    console.log('🔔 onNotificationChange:', field, '=', value);

    if (!this.editableSettings.notifications) {
      this.editableSettings.notifications = {
        highConsumption: false,
        summary: false,
        scheduleStart: '05:00 AM',
        scheduleEnd: '22:00 PM'
      };
    }

    (this.editableSettings.notifications as any)[field] = value;
    this.hasChanges = true;

    console.log('✅ hasChanges:', this.hasChanges);
  }

  get selectedFrequencies(): string[] {
    return this.editableSettings.reportFrequencies || [];
  }

  get selectedFormats(): string[] {
    return this.editableSettings.reportFormats || [];
  }

  toggleFrequency(freq: string): void {
    console.log('📊 toggleFrequency:', freq);

    const frequencies = this.editableSettings.reportFrequencies || [];
    const idx = frequencies.indexOf(freq);

    if (idx > -1) {
      this.editableSettings.reportFrequencies = frequencies.filter(f => f !== freq);
      console.log('➖ Removed:', freq);
    } else if (frequencies.length < 2) {
      this.editableSettings.reportFrequencies = [...frequencies, freq];
      console.log('➕ Added:', freq);
    } else {
      this.showError('Maximum 2 frequencies allowed');
      return;
    }

    this.hasChanges = true;
    console.log('✅ Frequencies:', this.editableSettings.reportFrequencies);
  }

  toggleFormat(fmt: string): void {
    console.log('📄 toggleFormat:', fmt);

    const formats = this.editableSettings.reportFormats || [];
    const idx = formats.indexOf(fmt);

    if (idx > -1) {
      this.editableSettings.reportFormats = formats.filter(f => f !== fmt);
      console.log('➖ Removed:', fmt);
    } else if (formats.length < 2) {
      this.editableSettings.reportFormats = [...formats, fmt];
      console.log('➕ Added:', fmt);
    } else {
      this.showError('Maximum 2 formats allowed');
      return;
    }

    this.hasChanges = true;
    console.log('✅ Formats:', this.editableSettings.reportFormats);
  }

  onAddNewRule(): void {
    console.log('➕ Add new rule clicked');
    this.showInfo('Feature coming soon: Add new auto-saving rule');
  }

  onEditSchedule(): void {
    console.log('✏️ Edit schedule clicked');
    this.showInfo('Feature coming soon: Edit notification schedule');
  }

  onChangePassword(): void {
    console.log('🔒 Change password clicked');
    this.showInfo('Feature coming soon: Change password');
  }

  onEnable2FA(): void {
    console.log('🔐 Enable 2FA clicked');

    if (!this.currentUserId) return;

    this.settingsService.enableTwoFactor(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('2FA QR Code:', result.qrCode);
          console.log('2FA Secret:', result.secret);
          this.showSuccess('2FA enabled! Check console for QR code');
        },
        error: (error) => {
          console.error('Failed to enable 2FA:', error);
          this.showError('Failed to enable 2FA');
        }
      });
  }

  saveSettings(): void {
    console.log('💾 saveSettings() called');
    console.log('💾 currentUserId:', this.currentUserId);
    console.log('💾 hasChanges:', this.hasChanges);
    console.log('💾 editableSettings:', JSON.stringify(this.editableSettings, null, 2));

    if (!this.currentUserId) {
      console.error('❌ No currentUserId');
      return;
    }

    if (!this.hasChanges) {
      console.error('❌ No changes detected');
      return;
    }

    console.log('✅ Calling settingsService.updateSettings...');

    this.settingsService.updateSettings(this.currentUserId, this.editableSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Settings saved successfully:', response);
          this.hasChanges = false;
          this.showSuccess('Settings saved successfully!');
        },
        error: (error) => {
          console.error('❌ Failed to save settings:', error);
          this.showError('Failed to save settings');
        }
      });
  }

  cancelChanges(): void {
    console.log('❌ cancelChanges() called');

    if (this.currentSettings) {
      this.editableSettings = JSON.parse(JSON.stringify(this.currentSettings));
      console.log('↩️ Reverted to original settings');
    }

    this.hasChanges = false;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, '✖', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, '✖', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, '✖', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
