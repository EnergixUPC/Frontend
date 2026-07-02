// src/app/sems/energy-management/infrastructure/assemblers/settings.assembler.ts
import { Injectable } from '@angular/core';
import { SettingsResponse } from '../response/settings.response';
import { SettingsResource } from '../resources/settings.resource';
import { SettingsRequest } from '../request/settings.request';

@Injectable({
  providedIn: 'root'
})
export class SettingsAssembler {
  toResource(dto: any): SettingsResource {
    return {
      id: dto.id,
      userId: dto.userId,
      notificationsEnabled: dto.notificationsEnabled ?? true,
      highConsumptionAlerts: dto.highConsumptionAlerts ?? true,
      dailyWeeklySummary: dto.dailyWeeklySummary ?? true,
      notificationScheduleStart: this.formatTimeFromDB(dto.notificationScheduleStart) ?? "09:00",
      notificationScheduleEnd: this.formatTimeFromDB(dto.notificationScheduleEnd) ?? "18:00",
      peakHourStart: this.formatTimeFromDB(dto.peakHourStart),
      peakHourEnd: this.formatTimeFromDB(dto.peakHourEnd),
      highConsumptionThresholdKwh: dto.highConsumptionThresholdKwh ?? null,
      reportDaily: dto.reportDaily ?? false,
      reportWeekly: dto.reportWeekly ?? true,
      reportMonthly: dto.reportMonthly ?? false,
      reportFormatPdf: dto.reportFormatPdf ?? true,
      reportFormatCsv: dto.reportFormatCsv ?? false,
      twoFactorEnabled: dto.twoFactorEnabled ?? false,
      lastPasswordChange: dto.lastPasswordChange ?? new Date().toISOString(),
      savingRules: dto.savingRules?.map((r: any) => ({
        id: r.id,
        name: r.name,
        isEnabled: r.isEnabled
      })) || []
    };
  }

  toRequest(resource: Partial<SettingsResource>): SettingsRequest {
    return {
      id: resource.id,
      userId: resource.userId,
      notificationsEnabled: resource.notificationsEnabled,
      highConsumptionAlerts: resource.highConsumptionAlerts,
      dailyWeeklySummary: resource.dailyWeeklySummary,
      notificationScheduleStart: this.formatTimeForDB(resource.notificationScheduleStart),
      notificationScheduleEnd: this.formatTimeForDB(resource.notificationScheduleEnd),
      peakHourStart: this.formatTimeForDB(resource.peakHourStart ?? undefined) ?? null,
      peakHourEnd: this.formatTimeForDB(resource.peakHourEnd ?? undefined) ?? null,
      highConsumptionThresholdKwh: resource.highConsumptionThresholdKwh ?? null,
      reportDaily: resource.reportDaily,
      reportWeekly: resource.reportWeekly,
      reportMonthly: resource.reportMonthly,
      reportFormatPdf: resource.reportFormatPdf,
      reportFormatCsv: resource.reportFormatCsv,
      twoFactorEnabled: resource.twoFactorEnabled,
      lastPasswordChange: resource.lastPasswordChange,
      savingRules: resource.savingRules?.map(r => ({
        id: r.id,
        name: r.name,
        isEnabled: r.isEnabled
      }))
    };
  }

  /**
   * Convierte tiempo de base de datos (HH:MM:SS.SSSSSS) a formato UI (HH:MM)
   */
  private formatTimeFromDB(timeValue: string | null): string | null {
    if (!timeValue) return null;
    
    // Si ya está en formato HH:MM, devolverlo tal como está
    if (/^\d{2}:\d{2}$/.test(timeValue)) {
      return timeValue;
    }
    
    // Si está en formato HH:MM:SS.SSSSSS, extraer solo HH:MM
    if (/^\d{2}:\d{2}:\d{2}/.test(timeValue)) {
      return timeValue.substring(0, 5);
    }
    
    return timeValue;
  }

  /**
   * Convierte tiempo de UI (HH:MM) a formato para base de datos
   */
  private formatTimeForDB(timeValue: string | undefined): string | undefined {
    if (!timeValue) return undefined;
    
    // Si ya está en formato correcto (HH:MM), devolverlo tal como está
    if (/^\d{2}:\d{2}$/.test(timeValue)) {
      return timeValue;
    }
    
    return timeValue;
  }
}
