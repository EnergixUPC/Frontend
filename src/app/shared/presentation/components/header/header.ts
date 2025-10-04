import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription } from 'rxjs';
import { AuthControllerService } from '../../../../sems/authentication/application/services/auth-controller.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  userName: string = '';
  notificationCount: number = 2;
  private timeSubscription?: Subscription;

  constructor(private authController: AuthControllerService) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.timeSubscription = interval(1000).subscribe(() => {
      this.updateDateTime();
    });

    const currentUser = this.authController.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.firstName || currentUser.email.split('@')[0];
    }
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  updateDateTime(): void {
    this.currentDate = new Date();
  }

  getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.currentDate.getDay()];
  }

  getFormattedDate(): string {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    return `${months[this.currentDate.getMonth()]} ${this.currentDate.getDate()}th, ${this.currentDate.getFullYear()}`;
  }

  getFormattedTime(): string {
    return this.currentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  onNotificationClick(): void {
    // Navigate to notifications page
    console.log('Navigate to notifications');
  }
}
