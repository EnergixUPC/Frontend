import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';
import { NotificationEntity } from '../domain/model/notifications.entity';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/v1/notifications`;


  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getNotifications(): Observable<NotificationEntity[]> {
    return this.http.get<NotificationEntity[]>(this.apiUrl, { headers: this.getHeaders() });
  }


  markAsRead(notification: NotificationEntity): Observable<NotificationEntity> {
    return this.http.put<NotificationEntity>(`${this.apiUrl}/${notification.id}/read`, {}, { headers: this.getHeaders() });
  }
}
