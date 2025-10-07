import { Observable } from 'rxjs';
import { ProfileResponse } from '../../../../energy-management/infrastructure/response/profile.response';
import {ProfileRequest} from '../../../infrastructure/request/profile.request';

export interface ProfileRepository {
  loadProfile(userId: string): Observable<ProfileResponse>;
  updateProfile?(userId: string, request: ProfileRequest): Observable<ProfileResponse>;
}
