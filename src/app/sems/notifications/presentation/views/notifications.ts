import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {CommonModule, NgClass, DatePipe, NgIf} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../infrastructure/notifications.service';
import { NotificationEntity } from '../../domain/model/notifications.entity';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  imports: [
    CommonModule,
    NgClass,
    DatePipe,
    NgIf,
    TranslateModule
  ]
})
export class NotificationsComponent implements OnInit {
  showNotifications = false;
  notifications: NotificationEntity[] = [];

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadNotifications();
    this.showNotifications = false;
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data.map(n => ({ ...n, read: n.isRead }));
        this.cdr.detectChanges();
        console.log('Notification types:', data.map(n => n.type));

      },
      error: (err) => console.error(err)
    });
  }
  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
      document.body.classList.add('show-notifications');
    } else {
      document.body.classList.remove('show-notifications');
    }
  }





  markAsRead(notification: NotificationEntity) {
    if (notification.read) return;
    this.notificationService.markAsRead(notification).subscribe({
      next: () => notification.read = true,
      error: (err) => console.error('Error marking as read:', err)
    });
  }



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-popup') && !target.closest('.notification-icon')) {
      this.showNotifications = false;
    }
  }

}
