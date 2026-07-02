// src/app/sems/energy-management/presentation/views/settings/settings.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { SettingsResource } from '../../../infrastructure/resources/settings.resource';
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
  hasChanges = false;
  currentUserId: string | null = null;
  isLoadingSettings = false;
  isEditingSchedule = false;
  tempScheduleStart = '05:00';
  tempScheduleEnd = '22:00';

  // US23: configuración de horario de hora punta y umbral de alerta.
  isEditingPeakHour = false;
  tempPeakHourStart = '18:00';
  tempPeakHourEnd = '23:00';
  tempThresholdKwh: number | null = null;

  constructor(
    private translate: TranslateService,
    private settingsService: SettingsService,
    private settingsStore: SettingsStore,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('Settings component constructed');
  }

  ngOnInit(): void {
    console.log('Settings ngOnInit');

    // Inicializar estados de carga
    this.isLoadingSettings = true;

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

    // Activar indicadores de carga
    this.isLoadingSettings = true;

    this.settingsService.loadUserSettings(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('Settings loaded:', settings);

          // Desactivar indicador de settings
          this.isLoadingSettings = false;

          this.cdr.detectChanges(); // Force change detection
        },
        error: (error) => {
          console.error('Failed to load settings:', error);

          // Desactivar indicadores en caso de error
          this.isLoadingSettings = false;

          // Solo mostrar error si no es un 404
          if (error.status === 401) {
            this.showError(this.t('settings.messages.unauthorized'));
          } else if (error.status !== 404) {
            // 404 se maneja automáticamente en el servicio creando settings por defecto
            this.showError(`${this.t('settings.messages.loadError')} ${error.message || 'Unknown error'}`);
          }
          this.cdr.detectChanges(); // Force change detection on error too
        }
      });
  }

  onNotificationChange(field: string, value: boolean): void {
    console.log('onNotificationChange:', field, '=', value);

    // Mapear campos antiguos a nuevos
    const fieldMapping: { [key: string]: keyof SettingsResource } = {
      'highConsumption': 'highConsumptionAlerts',
      'summary': 'dailyWeeklySummary'
    };

    const actualField = fieldMapping[field] || field;
    (this.editableSettings as any)[actualField] = value;
    this.hasChanges = true;

    console.log('hasChanges:', this.hasChanges);
  }

  onEditSchedule(): void {
    console.log('Edit schedule clicked');

    this.tempScheduleStart = this.editableSettings.notificationScheduleStart || '05:00';
    this.tempScheduleEnd = this.editableSettings.notificationScheduleEnd || '22:00';

    console.log(`Loaded current schedule for editing: ${this.tempScheduleStart} - ${this.tempScheduleEnd}`);
    this.isEditingSchedule = true;
  }

  saveSchedule(): void {
    console.log('Save inline schedule clicked');
    console.log(`Attempting to save new times: ${this.tempScheduleStart} - ${this.tempScheduleEnd}`);

    if (!this.tempScheduleStart || !this.tempScheduleEnd) {
      console.error('Validation failed: Missing start or end time');
      this.showError(this.t('settings.messages.scheduleRequired'));
      return;
    }

    this.editableSettings.notificationScheduleStart = this.tempScheduleStart;
    this.editableSettings.notificationScheduleEnd = this.tempScheduleEnd;

    this.hasChanges = true;
    this.isEditingSchedule = false;

    console.log('Schedule updated temporarily in editableSettings. hasChanges is now:', this.hasChanges);
    this.showSuccess(this.t('settings.messages.scheduleUpdated'));
  }

  cancelEditSchedule(): void {
    console.log('Cancel inline schedule edit clicked. Discarding temporary changes.');
    this.isEditingSchedule = false;
  }

  onEditPeakHour(): void {
    this.tempPeakHourStart = this.editableSettings.peakHourStart || '18:00';
    this.tempPeakHourEnd = this.editableSettings.peakHourEnd || '23:00';
    this.tempThresholdKwh = this.editableSettings.highConsumptionThresholdKwh ?? null;
    this.isEditingPeakHour = true;
  }

  savePeakHour(): void {
    if (!this.tempPeakHourStart || !this.tempPeakHourEnd) {
      this.showError(this.t('settings.messages.scheduleRequired'));
      return;
    }

    this.editableSettings.peakHourStart = this.tempPeakHourStart;
    this.editableSettings.peakHourEnd = this.tempPeakHourEnd;
    this.editableSettings.highConsumptionThresholdKwh =
      this.tempThresholdKwh !== null && this.tempThresholdKwh !== undefined && `${this.tempThresholdKwh}` !== ''
        ? Number(this.tempThresholdKwh)
        : null;

    this.hasChanges = true;
    this.isEditingPeakHour = false;
    this.showSuccess(this.t('settings.messages.scheduleUpdated'));
  }

  cancelEditPeakHour(): void {
    this.isEditingPeakHour = false;
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
          this.showSuccess(this.t('settings.messages.saveSuccess'));
        },
        error: (error) => {
          console.error('Failed to save settings:', error);
          this.showError(this.t('settings.messages.saveError'));
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
    this.snackBar.open(message, this.t('settings.messages.close'), {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, this.t('settings.messages.close'), {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, this.t('settings.messages.close'), {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  forceUpdate(): void {
    console.log('Forcing complete update...');
    this.ngZone.run(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    });
  }
}
