// src/app/sems/energy-management/presentation/views/settings/settings.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, filter, finalize } from 'rxjs';

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
  isLoadingSettings = false;
  isLoadingRules = false;
  updatingRules = new Set<number>(); // Track which rules are being updated

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
    this.isLoadingRules = true;

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
    this.isLoadingRules = true;

    this.settingsService.loadUserSettings(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('Settings loaded:', settings);
          
          // Desactivar indicador de settings
          this.isLoadingSettings = false;
          
          if (settings.savingRules) {
            this.rules = settings.savingRules;
            console.log('Rules updated:', this.rules);
            // Desactivar indicador de rules
            this.isLoadingRules = false;
          } else {
            this.isLoadingRules = false;
          }
          
          this.cdr.detectChanges(); // Force change detection
        },
        error: (error) => {
          console.error('Failed to load settings:', error);
          
          // Desactivar indicadores en caso de error
          this.isLoadingSettings = false;
          this.isLoadingRules = false;
          
          // Solo mostrar error si no es un 404 (que se maneja automáticamente creando defaults)
          if (error.status === 401) {
            this.showError('Unauthorized. Please log in again.');
          } else if (error.status !== 404) {
            // 404 se maneja automáticamente en el servicio creando settings por defecto
            this.showError(`Failed to load settings: ${error.message || 'Unknown error'}`);
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



  onAddNewRule(): void {
    console.log('Add new rule clicked');
    const name = window.prompt('Enter rule name:');
    if (!name) return;

    const newRule: Partial<SavingRule> = {
      name: name.trim(),
      isEnabled: true
    };

    console.log('Sending rule to backend:', JSON.stringify(newRule, null, 2));

    this.settingsService.createRule(newRule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rule) => {
          console.log('Raw response from backend:', JSON.stringify(rule, null, 2));
          console.log('Rule added from backend:', rule);
          console.log('Rule properties:', {
            id: rule.id,
            name: rule.name,
            nameLength: rule.name ? rule.name.length : 'null/undefined',
            nameType: typeof rule.name,
            isEnabled: rule.isEnabled
          });
          console.log('Current rules before update:', this.rules);
          
          // Validar que la regla tenga los campos necesarios
          if (!rule.name || rule.name.trim() === '') {
            console.error('Rule has empty name:', rule);
            console.error('Original name sent:', name);
            
            // Usar el nombre original que enviamos si el backend no lo devuelve
            rule.name = name.trim();
            console.log('Using original name:', rule.name);
          }
          
          // Usar NgZone para asegurar que Angular detecte el cambio
          this.ngZone.run(() => {
            // Asegurar que la regla tenga el formato correcto
            const newRule: SavingRule = {
              id: rule.id,
              name: rule.name || name.trim(), // Usar el nombre original si el backend no lo devuelve
              isEnabled: rule.isEnabled !== undefined ? rule.isEnabled : true
            };
            
            console.log('Final rule to add:', newRule);
            
            // Actualizar el array de reglas
            this.rules = [...this.rules, newRule];
            console.log('Rules after update:', this.rules);
            console.log('Number of rules:', this.rules.length);
            
            // Actualizar también las settings actuales
            if (this.currentSettings) {
              this.currentSettings = {
                ...this.currentSettings,
                savingRules: this.rules
              };
              this.editableSettings = JSON.parse(JSON.stringify(this.currentSettings));
            }
            
            // Forzar detección de cambios
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            
            // Log final para verificar
            setTimeout(() => {
              console.log('Final check - rules in component:', this.rules);
              // Como backup, recargar completamente los settings
              this.loadSettings();
            }, 100);
            
            this.showSuccess('Rule added successfully');
          });
        },
        error: (err) => {
          console.error('Failed to add rule:', err);
          this.showError('Failed to add rule');
        }
      });
  }

  onDeleteRule(ruleId: string): void {
    console.log('Delete rule clicked:', ruleId);
    
    // Agregar a updating para prevenir clics múltiples
    const numericRuleId = Number(ruleId);
    this.updatingRules.add(numericRuleId);
    
    this.settingsService.deleteRule(ruleId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Remover del set de updating cuando termine
          this.updatingRules.delete(numericRuleId);
        })
      )
      .subscribe({
        next: () => {
          console.log('Rule deleted successfully');
          
          // Recargar completamente los settings para asegurar consistencia
          this.loadSettings();
          
          this.showSuccess('Rule deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete rule:', err);
          this.showError('Failed to delete rule');
        }
      });
  }

  onToggleRule(rule: SavingRule): void {
    const ruleId = Number(rule.id);
    
    // Prevenir clics múltiples en la misma regla
    if (this.updatingRules.has(ruleId)) {
      console.log('Rule update already in progress for:', ruleId);
      return;
    }
    
    console.log('Toggle rule:', rule.id, !rule.isEnabled);
    
    // Marcar como en proceso de actualización
    this.updatingRules.add(ruleId);
    
    const updatedRule = { ...rule, isEnabled: !rule.isEnabled };

    this.settingsService.updateRule(rule.id.toString(), updatedRule)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Remover del set de updating cuando termine (éxito o error)
          this.updatingRules.delete(ruleId);
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Rule updated successfully:', res);
          
          // En lugar de modificar el array, recargar completamente los datos
          this.loadSettings();
          
          this.showSuccess('Rule updated successfully');
        },
        error: (err) => {
          console.error('Failed to update rule:', err);
          this.showError('Failed to update rule');
        }
      });
  }

  onEditSchedule(): void {
    console.log('Edit schedule clicked');

    const currentStart = this.editableSettings.notificationScheduleStart || '05:00';
    const currentEnd = this.editableSettings.notificationScheduleEnd || '22:00';
    const currentRange = `${currentStart} - ${currentEnd}`;

    const newRange = window.prompt(this.t('Enter schedule (Start - End):'), currentRange);

    if (newRange === null) return; // User cancelled

    const parts = newRange.split('-').map(p => p.trim());

    if (parts.length !== 2) {
      this.showError('Invalid format. Please use "Start - End" (e.g. 05:00 - 22:00)');
      return;
    }

    const newStart = parts[0];
    const newEnd = parts[1];

    // Validar formato HH:MM
    if (!/^\d{2}:\d{2}$/.test(newStart) || !/^\d{2}:\d{2}$/.test(newEnd)) {
      this.showError('Invalid time format. Please use HH:MM format (e.g. 09:00)');
      return;
    }

    this.editableSettings.notificationScheduleStart = newStart;
    this.editableSettings.notificationScheduleEnd = newEnd;

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

  // TrackBy function para ayudar a Angular a detectar cambios en las reglas
  trackByRuleId(index: number, rule: SavingRule): number {
    return rule.id;
  }

  // Método para debug - forza actualización completa
  forceUpdate(): void {
    console.log('Forcing complete update...');
    this.ngZone.run(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    });
  }

  // Getter para debug
  get debugRulesInfo(): string {
    return `Rules count: ${this.rules.length}, Rules: ${JSON.stringify(this.rules.map(r => ({ id: r.id, name: r.name })))}`;
  }
}
