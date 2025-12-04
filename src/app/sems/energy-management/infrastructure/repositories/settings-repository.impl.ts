// src/app/sems/energy-management/infrastructure/repositories/settings-repository.impl.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SettingsRepository } from '../../domain/model/repositories/settings.repository';
import { SettingsResponse } from '../response/settings.response';
import { SettingsRequest } from '../request/settings.request';
import { environment } from '../../../../../environments/environments';
import { SavingRule } from '../resources/settings.resource';

const BASE_URL = `${environment.apiUrl}/api/v1/settings`;

@Injectable({
  providedIn: 'root'
})
export class SettingsRepositoryImpl implements SettingsRepository {
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUserSettings(userId: string): Observable<SettingsResponse> {
    // Backend likely infers user from token, but keeping userId if required by specific endpoint design
    // Based on screenshot: GET /api/v1/settings
    return this.http.get<SettingsResponse>(`${BASE_URL}`, {
      headers: this.getHeaders()
    });
  }

  updateSettings(userId: string, request: SettingsRequest): Observable<SettingsResponse> {
    // Based on screenshot: PUT /api/v1/settings
    console.log('Saving settings at:', BASE_URL, 'with body:', request);

    if (request.id) {
      // Update existing settings
      return this.http.put<SettingsResponse>(`${BASE_URL}`, request, {
        headers: this.getHeaders()
      });
    } else {
      // Create new settings (if they don't exist)
      return this.http.post<SettingsResponse>(`${BASE_URL}`, request, {
        headers: this.getHeaders()
      });
    }
  }

  // Rules Management
  createRule(rule: Partial<SavingRule>): Observable<SavingRule> {
    // POST /api/v1/settings/rules
    console.log('SettingsRepository - Creating rule:', JSON.stringify(rule, null, 2));
    console.log('SettingsRepository - URL:', `${BASE_URL}/rules`);
    
    return this.http.post<SavingRule>(`${BASE_URL}/rules`, rule, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('SettingsRepository - Rule creation response:', JSON.stringify(response, null, 2));
      })
    );
  }

  updateRule(ruleId: string, rule: Partial<SavingRule>): Observable<SavingRule> {
    // PUT /api/v1/settings/rules/{ruleId}
    return this.http.put<SavingRule>(`${BASE_URL}/rules/${ruleId}`, rule, {
      headers: this.getHeaders()
    });
  }

  deleteRule(ruleId: string): Observable<void> {
    // DELETE /api/v1/settings/rules/{ruleId}
    return this.http.delete<void>(`${BASE_URL}/rules/${ruleId}`, {
      headers: this.getHeaders()
    });
  }

  resetToDefaults(userId: string): Observable<SettingsResponse> {
    return this.http.post<SettingsResponse>(`${BASE_URL}/reset`, {}, {
      headers: this.getHeaders()
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/password`, {
      oldPassword,
      newPassword
    }, {
      headers: this.getHeaders()
    });
  }

  enableTwoFactor(userId: string): Observable<{ qrCode: string; secret: string }> {
    return this.http.post<{ qrCode: string; secret: string }>(
      `${BASE_URL}/2fa/enable`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
