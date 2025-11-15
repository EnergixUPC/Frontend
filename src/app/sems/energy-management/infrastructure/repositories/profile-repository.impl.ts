import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileRepository } from '../../../energy-management/domain/model/repositories/profile.repository';
import { ProfileResponse } from '../../infrastructure/response/profile.response';
import { environment } from '../../../../../environments/environments';

const BASE_URL = `${environment.apiUrl}/api/profile`;

@Injectable({
  providedIn: 'root'
})
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadProfile(userId: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${BASE_URL}/${userId}`, { headers: this.getHeaders() });
  }

  updateProfile(userId: string, request: any): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${BASE_URL}/${userId}`, request, { headers: this.getHeaders() });
  }
}
