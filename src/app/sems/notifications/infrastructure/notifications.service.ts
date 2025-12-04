import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';
import { TokenService } from '../../authentication/infrastructure/services/token.service';
import { NotificationEntity } from '../domain/model/notifications.entity';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/v1/notifications`;


  constructor(private http: HttpClient, private tokenService: TokenService) {
  }

  private getHeaders(): HttpHeaders {
    const authHeader = this.tokenService.getAuthorizationHeader();
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else {
      // Fallback: try reading token directly from localStorage for extra debug visibility
      const fallbackToken = localStorage.getItem(environment.tokenKey);
      if (fallbackToken) {
        headers['Authorization'] = `Bearer ${fallbackToken}`;
        console.warn('NotificationService - Using fallback token from localStorage (token found).');
      } else {
        console.warn('NotificationService - No authorization header available. Requests may be rejected with 401.');
      }
    }

    return new HttpHeaders(headers);
  }

  getNotifications(): Observable<NotificationEntity[]> {
    // Use TokenService to obtain the currently saved user (if any).
    const currentUser = this.tokenService.getUser();
    const userId = currentUser ? Number(currentUser.id) : null;
    const url = userId ? `${this.apiUrl}?user_id=${userId}` : this.apiUrl;

    console.log('NotificationService - Fetching notifications from:', url);
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(res => console.log('NotificationService - Raw response length:', Array.isArray(res) ? res.length : 'not-array', res)),
      map(rawNotifs => {
        const currentUserLog = currentUser ? currentUser.id : null;
        console.log('NotificationService - currentUser id for filtering:', currentUserLog);

        const parsed = (Array.isArray(rawNotifs) ? rawNotifs : []).map(item => {
          // extract id from possibly nested objects
          const idCandidate = item.notificationId ?? item.notification_id ?? item.id ?? item.notificationIdValue;
          const id = typeof idCandidate === 'object' ? (idCandidate.id ?? idCandidate.notification_id ?? idCandidate.value ?? idCandidate['$oid'] ?? null) : idCandidate;

          const userCandidate = item.userId ?? item.user_id ?? item.user;
          const userVal = typeof userCandidate === 'object' ? (userCandidate.id ?? userCandidate.user_id ?? userCandidate.value ?? null) : userCandidate;

          console.log('NotificationService - raw item userCandidate:', userCandidate, '-> extracted userVal:', userVal);

          const deviceCandidate = item.deviceId ?? item.device_id ?? item.device;
          const deviceVal = typeof deviceCandidate === 'object' ? (deviceCandidate.id ?? deviceCandidate.device_id ?? deviceCandidate.value ?? null) : deviceCandidate;

          const message = item.message ?? item.msg ?? '';
          const type = item.type ?? 'info';
          const timestamp = item.timestamp ?? item.createdAt ?? item.created_at ?? item.time ?? '';
          const isRead = !!(item.isRead || item.read || item.leido || item.read_at);
          const title = item.title ?? item.subject ?? '';

          return {
            id: id != null ? Number(id) : 0,
            title,
            message,
            type,
            timestamp,
            isRead,
            _userId: userVal != null ? Number(userVal) : null,
            _deviceId: deviceVal != null ? Number(deviceVal) : null
          } as any;
        });

        // filter by user id if available
        console.log('NotificationService - parsed entries (with _userId):', parsed.map(p => ({id: p.id, _userId: p._userId})));
        const filtered = userId != null ? parsed.filter(n => n._userId == userId) : parsed;

        // map to NotificationEntity shape
        // Heuristic mapping to i18n keys based on message contents or device id/type.
        const mapToI18n = (rawMsg: string) => {
          if (!rawMsg) return { key: undefined, params: undefined };
          const lower = rawMsg.toLowerCase();
          if (lower.includes('mantenimiento') || lower.includes('mantenimiento preventivo')) {
            return { key: 'notifications.messages.maintenance', params: {} };
          }
          if (lower.includes('ha estado encendida por') || lower.includes('ha estado encendida')) {
            return { key: 'notifications.messages.uptime_warning', params: {} };
          }
          if (lower.includes('se ha actualizado') || lower.includes('actualizado')) {
            return { key: 'notifications.messages.updated', params: {} };
          }
          if (lower.includes('ha optimizado su consumo') || lower.includes('ahorrando')) {
            // try to extract percent
            const m = rawMsg.match(/(\d+)%/);
            return { key: 'notifications.messages.optimized', params: { percent: m ? m[1] : '' } };
          }
          if (lower.includes('pico de uso') || lower.includes('pico de')) {
            const m = rawMsg.match(/(\d+)%/);
            return { key: 'notifications.messages.usage_spike', params: { percent: m ? m[1] : '' } };
          }
          // Default: no key
          return { key: undefined, params: undefined };
        };

        return filtered.map(n => {
          const i18nInfo = mapToI18n(n.message);
          return ({
            id: n.id,
            title: n.title || '',
            message: n.message,
            messageKey: i18nInfo.key,
            messageParams: i18nInfo.params,
            type: n.type,
            timestamp: n.timestamp,
            isRead: n.isRead
          } as NotificationEntity);
        });
      }),
      catchError(err => {
        console.error('NotificationService - Error fetching notifications:', err);
        return of([] as NotificationEntity[]);
      })
    );
  }


  markAsRead(notification: NotificationEntity): Observable<NotificationEntity> {
    return this.http.put<NotificationEntity>(`${this.apiUrl}/${notification.id}/read`, {}, { headers: this.getHeaders() });
  }
}
