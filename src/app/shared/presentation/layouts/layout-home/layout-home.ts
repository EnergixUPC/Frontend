import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { WebsocketService } from '../../../../shared/infrastructure/services/websocket.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Sidebar,
    MatSnackBarModule
  ],
  templateUrl: './layout-home.html',
  styleUrl: './layout-home.css'
})
export class LayoutHome implements OnInit, OnDestroy {
  private alertSubscription?: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.websocketService.connect();
    
    // US06: Generar alertas de consumo elevado (alerta inmediata)
    this.alertSubscription = this.websocketService.getAlerts().subscribe((alert: any) => {
      // Assuming alert has a message or falls back to translation
      const message = alert.message || this.translate.instant('notifications.messages.usage_spike', { percent: alert.percent || '' });
      this.snackBar.open(message, this.translate.instant('common.close'), {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }

  ngOnDestroy(): void {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }
}

