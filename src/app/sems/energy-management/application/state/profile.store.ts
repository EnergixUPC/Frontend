import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileResource } from '../../../energy-management/infrastructure/resources/profile.resource';

@Injectable({
  providedIn: 'root'
})
export class ProfileStore {
  private readonly profileSubject = new BehaviorSubject<ProfileResource | null>(null);
  readonly profile$: Observable<ProfileResource | null> = this.profileSubject.asObservable();

  updateActiveProfile(profile: ProfileResource | null): void {
    this.profileSubject.next(profile);
  }

  clearActiveProfile(): void {
    this.profileSubject.next(null);
  }

  get currentProfile(): ProfileResource | null {
    return this.profileSubject.value;
  }
}
