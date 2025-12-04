// src/app/sems/energy-management/presentation/views/settings/settings.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, filter } from 'rxjs';

import { SettingsService } from '../../../application/services/settings.service';
import { SettingsStore } from '../../../application/state/settings.store';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { SettingsResource, SavingRule } from '../../../infrastructure/resources/settings.resource';
import { SettingsSuports } from '../settings-suports/settings-suports';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    SettingsSuports,
    FormsModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})

export class Settings implements OnInit, OnDestroy {
  @ViewChild('supportsComponent') supportsComponent!: SettingsSuports;
  private destroy$ = new Subject<void>();

  currentSettings: SettingsResource | null = null;
  editableSettings: Partial<SettingsResource> = {};
  rules: SavingRule[] = [];
  hasChanges = false;
  currentUserId: string | null = null;

  constructor(
    private translate: TranslateService,
    private settingsService: SettingsService,
    private settingsStore: SettingsStore,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Settings component constructed');
  }

  ngOnInit(): void {
    console.log('Settings ngOnInit');

    // Subscribe to auth state to handle page refreshes where user might not be immediately available
    this.authService.authState$
      .pipe(
        takeUntil(this.destroy$),
        filter(state => state.isAuthenticated && !!state.user)
      )
      .subscribe(state => {
        console.log('Auth state updated:', state.user);
        if (state.user && state.user.id !== this.currentUserId) {
          this.currentUserId = state.user.id;
          console.log('User ID set:', this.currentUserId);
          this.loadSettings();
        }
      });

    this.settingsStore.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        console.log('Settings from store:', settings);
        if (settings) {
          this.currentSettings = settings;
          this.editableSettings = JSON.parse(JSON.stringify(settings));
          console.log('Editable settings initialized:', this.editableSettings);
          this.cdr.detectChanges(); // Force change detection
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

    console.log('Loading settings for user:', this.currentUserId);

    this.settingsService.loadUserSettings(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('Settings loaded:', settings);
          if (settings.rules) {
            this.rules = settings.rules;
          }
          this.cdr.detectChanges(); // Force change detection
        },
        error: (error) => {
          console.error('Failed to load settings:', error);
          if (error.status === 404) {
            this.showError('Settings not found for this user.');
          } else if (error.status === 401) {
            this.showError('Unauthorized. Please log in again.');
          } else {
            this.showError(`Failed to load settings: ${error.message || 'Unknown error'}`);
          }
          this.cdr.detectChanges(); // Force change detection on error too
        }
      });
  }

  onAutoSavingModeChange(field: string, value: boolean): void {
    console.log('onAutoSavingModeChange:', field, '=', value);

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

    console.log('hasChanges:', this.hasChanges);
    console.log('editableSettings:', this.editableSettings);
  }

  onNotificationChange(field: string, value: boolean | string): void {
    console.log('onNotificationChange:', field, '=', value);

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

    console.log('hasChanges:', this.hasChanges);
  }

  get selectedFrequencies(): string[] {
    return this.editableSettings.reportFrequencies || [];
  }

  get selectedFormats(): string[] {
    return this.editableSettings.reportFormats || [];
  }

  toggleFrequency(freq: string): void {
    console.log('toggleFrequency:', freq);

    const frequencies = this.editableSettings.reportFrequencies || [];
    const idx = frequencies.indexOf(freq);

    if (idx > -1) {
      this.editableSettings.reportFrequencies = frequencies.filter(f => f !== freq);
      console.log('Removed:', freq);
    } else if (frequencies.length < 2) {
      this.editableSettings.reportFrequencies = [...frequencies, freq];
      console.log('Added:', freq);
    } else {
      this.showError('Maximum 2 frequencies allowed');
      return;
    }

    this.hasChanges = true;
    console.log('Frequencies:', this.editableSettings.reportFrequencies);
  }

  toggleFormat(fmt: string): void {
    console.log('toggleFormat:', fmt);

    const formats = this.editableSettings.reportFormats || [];
    const idx = formats.indexOf(fmt);

    if (idx > -1) {
      this.editableSettings.reportFormats = formats.filter(f => f !== fmt);
      console.log('Removed:', fmt);
    } else if (formats.length < 2) {
      this.editableSettings.reportFormats = [...formats, fmt];
      console.log('Added:', fmt);
    } else {
      this.showError('Maximum 2 formats allowed');
      return;
    }

    this.hasChanges = true;
    console.log('Formats:', this.editableSettings.reportFormats);
  }

  onAddNewRule(): void {
    console.log('Add new rule clicked');
    const name = window.prompt('Enter rule name:');
    if (!name) return;

    const newRule: Partial<SavingRule> = {
      name: name,
      isEnabled: true
    };

    this.settingsService.createRule(newRule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rule) => {
          console.log('Rule added:', rule);
          // Reload settings to ensure we have the correct data format from backend
          this.loadSettings();
          this.showSuccess('Rule added successfully');
        },
        error: (err) => {
          console.error('Failed to add rule:', err);
          this.showError('Failed to add rule');
        }
      });
  }

  onDeleteRule(ruleId: string): void {
    console.log('Delete rule clicked:', ruleId);
    this.settingsService.deleteRule(ruleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Rule deleted');
          this.rules = this.rules.filter(r => r.id !== ruleId);
          this.showSuccess('Rule deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete rule:', err);
          this.showError('Failed to delete rule');
        }
      });
  }

  onToggleRule(rule: SavingRule): void {
    console.log('Toggle rule:', rule.id, !rule.isEnabled);
    const updatedRule = { ...rule, isEnabled: !rule.isEnabled };

    this.settingsService.updateRule(rule.id, updatedRule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('Rule updated:', res);
          const index = this.rules.findIndex(r => r.id === rule.id);
          if (index !== -1) {
            this.rules[index] = res;
          }
          this.showSuccess('Rule updated successfully');
        },
        error: (err) => {
          console.error('Failed to update rule:', err);
          this.showError('Failed to update rule');
          // Revert change in UI if needed, but here we rely on the list refresh or optimistic update
          rule.isEnabled = !rule.isEnabled; // Revert
        }
      });
  }

  onEditSchedule(): void {
    console.log('Edit schedule clicked');

    const currentStart = this.editableSettings.notifications?.scheduleStart || '05:00 AM';
    const currentEnd = this.editableSettings.notifications?.scheduleEnd || '22:00 PM';
    const currentRange = `${currentStart} - ${currentEnd}`;

    const newRange = window.prompt(this.t('Enter schedule (Start - End):'), currentRange);

    if (newRange === null) return; // User cancelled

    const parts = newRange.split('-').map(p => p.trim());

    if (parts.length !== 2) {
      this.showError('Invalid format. Please use "Start - End" (e.g. 05:00 AM - 22:00 PM)');
      return;
    }

    const newStart = parts[0];
    const newEnd = parts[1];

    if (!this.editableSettings.notifications) {
      this.editableSettings.notifications = {
        highConsumption: false,
        summary: false,
        scheduleStart: newStart,
        scheduleEnd: newEnd
      };
    } else {
      this.editableSettings.notifications.scheduleStart = newStart;
      this.editableSettings.notifications.scheduleEnd = newEnd;
    }

    this.hasChanges = true;
    this.showSuccess('Schedule updated. Don\'t forget to save!');
  }

  onChangePassword(): void {
    console.log('Change password clicked');
    this.showInfo('Feature coming soon: Change password');
  }

  onEnable2FA(): void {
    console.log('Enable 2FA clicked');

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
    console.log('saveSettings() called');
    console.log('currentUserId:', this.currentUserId);
    console.log('hasChanges:', this.hasChanges);
    console.log('editableSettings:', JSON.stringify(this.editableSettings, null, 2));

    if (!this.currentUserId) {
      console.error('No currentUserId');
      return;
    }

    if (!this.hasChanges) {
      console.error('No changes detected');
      return;
    }

    console.log('Calling settingsService.updateSettings...');

    this.settingsService.updateSettings(this.currentUserId, this.editableSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Settings saved successfully:', response);
          this.hasChanges = false;
          this.showSuccess('Settings saved successfully!');
        },
        error: (error) => {
          console.error('Failed to save settings:', error);
          this.showError('Failed to save settings');
        }
      });
  }

  cancelChanges(): void {
    console.log('cancelChanges() called');

    if (this.currentSettings) {
      this.editableSettings = JSON.parse(JSON.stringify(this.currentSettings));
      console.log('Reverted to original settings');
    }

    this.hasChanges = false;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
