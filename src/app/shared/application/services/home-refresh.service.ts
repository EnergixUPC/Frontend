import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeRefreshService {
  private readonly refreshSubject = new Subject<void>();

  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  onRefresh(): Observable<void> {
    return this.refreshSubject.asObservable();
  }
}
