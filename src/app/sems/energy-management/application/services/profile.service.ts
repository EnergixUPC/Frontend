import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ProfileRepositoryImpl } from '../../infrastructure/repositories/profile-repository.impl';
import { ProfileStore } from '../state/profile.store';
import { ProfileAssembler } from '../../infrastructure/assemblers/profile.assembler';
import { ProfileResource } from '../../../energy-management/infrastructure/resources/profile.resource';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private repo: ProfileRepositoryImpl,
    private store: ProfileStore,
    private assembler: ProfileAssembler
  ) {}

  loadUserProfile(userId: string): Observable<ProfileResource> {
    return this.repo.loadProfile(userId).pipe(
      map(dto => this.assembler.toResource(dto)),
      tap(res => this.store.updateActiveProfile(res))
    );
  }

  updateProfile(userId: string, resource: ProfileResource): Observable<ProfileResource> {
    const req = this.assembler.toRequest(resource);
    return this.repo.updateProfile(userId, req).pipe(
      map(dto => this.assembler.toResource(dto)),
      tap(res => this.store.updateActiveProfile(res))
    );
  }

  updateLanguage(language: string): Observable<any> {
    return this.repo.updateLanguage(language);
  }

}
