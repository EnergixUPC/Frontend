import { Injectable } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client;
  private consumptionsSubject = new Subject<any>();
  private alertsSubject = new Subject<any>();

  constructor() {
    this.stompClient = new Client({
      // The backend is configured with .withSockJS(), so the raw websocket endpoint is /ws/websocket
      brokerURL: `${environment.apiUrl.replace(/^http/, 'ws')}/ws/websocket?token=${localStorage.getItem(environment.tokenKey)}`,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem(environment.tokenKey)}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      
      this.stompClient.subscribe('/topic/consumptions', (message: Message) => {
        if (message.body) {
          this.consumptionsSubject.next(JSON.parse(message.body));
        }
      });

      // US23 fix: /user/queue/alerts es un destino por-usuario (Spring UserDestinationMessageHandler,
      // resuelto en el backend vía StompAuthChannelInterceptor). El canal global /topic/alerts
      // anterior enviaba las alertas de todos los usuarios a todos los clientes conectados.
      this.stompClient.subscribe('/user/queue/alerts', (message: Message) => {
        if (message.body) {
          this.alertsSubject.next(JSON.parse(message.body));
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  }

  connect(): void {
    // Refresh token if needed
    this.stompClient.connectHeaders = {
      Authorization: `Bearer ${localStorage.getItem(environment.tokenKey)}`
    };
    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient.deactivate();
  }

  getConsumptions(): Observable<any> {
    return this.consumptionsSubject.asObservable();
  }

  getAlerts(): Observable<any> {
    return this.alertsSubject.asObservable();
  }
}
