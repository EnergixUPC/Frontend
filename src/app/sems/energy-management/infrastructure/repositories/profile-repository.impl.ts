import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileRepository } from '../../../energy-management/domain/model/repositories/profile.repository';
import { ProfileResponse } from '../../infrastructure/response/profile.response';

const BASE_URL = 'http://localhost:3000/users';

@Injectable({
  providedIn: 'root'
})
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private http: HttpClient) {}

  loadProfile(userId: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${BASE_URL}/${userId}`);
  }

  updateProfile(userId: string, request: any): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${BASE_URL}/${userId}`, request);
  }
}
