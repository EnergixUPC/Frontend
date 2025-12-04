// src/app/sems/energy-management/application/services/settings.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SettingsRepositoryImpl } from '../../infrastructure/repositories/settings-repository.impl';
import { SettingsStore } from '../state/settings.store';
import { SettingsAssembler } from '../../infrastructure/assemblers/settings.assembler';
import { SettingsResource, SavingRule } from '../../infrastructure/resources/settings.resource';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private repo: SettingsRepositoryImpl,
    private store: SettingsStore,
    private assembler: SettingsAssembler
  ) { }

  loadUserSettings(userId: string): Observable<SettingsResource> {
    return this.repo.getUserSettings(userId).pipe(
      map(dto => this.assembler.toResource(dto)),
      tap(res => this.store.updateActiveSettings(res))
    );
  }

  updateSettings(userId: string, resource: Partial<SettingsResource>): Observable<SettingsResource> {
    const req = this.assembler.toRequest(resource);
    return this.repo.updateSettings(userId, req).pipe(
      map(dto => {
        const responseResource = this.assembler.toResource(dto);
        // Optimistic update: Merge request data over response to ensure UI reflects changes
        // even if backend returns stale data.
        return { ...responseResource, ...resource };
      }),
      tap(res => this.store.updateActiveSettings(res))
    );
  }

  createRule(rule: Partial<SavingRule>): Observable<SavingRule> {
    return this.repo.createRule(rule);
  }

  updateRule(ruleId: string, rule: Partial<SavingRule>): Observable<SavingRule> {
    return this.repo.updateRule(ruleId, rule);
  }

  deleteRule(ruleId: string): Observable<void> {
    return this.repo.deleteRule(ruleId);
  }

  resetToDefaults(userId: string): Observable<SettingsResource> {
    return this.repo.resetToDefaults(userId).pipe(
      map(dto => this.assembler.toResource(dto)),
      tap(res => this.store.updateActiveSettings(res))
    );
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.repo.changePassword(userId, oldPassword, newPassword);
  }

  enableTwoFactor(userId: string): Observable<{ qrCode: string; secret: string }> {
    return this.repo.enableTwoFactor(userId);
  }
}
