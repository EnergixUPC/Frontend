import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription } from 'rxjs';
import { AuthControllerService } from '../../../../sems/authentication/application/services/auth-controller.service';
import { LangSwitcher } from '../lang-switcher/lang-switcher';
import { NotificationsComponent } from '../../../../sems/notifications/presentation/views/notifications';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    LangSwitcher,
    NotificationsComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  userName: string = 'User';
  userAvatarUrl: string = 'assets/default-avatar.png';
  notificationCount: number = 2;
  showNotifications = false;

  private timeSubscription?: Subscription;
  private combinedSubscription?: Subscription;

  constructor(
    private authController: AuthControllerService
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateDateTime());

    // Suscribirse solo al estado de autenticación
    this.combinedSubscription = this.authController.getCurrentAuthState()
      .subscribe(authState => {
        console.log('🎯 Header - Auth state received:', authState);
        
        if (authState?.user) {
          const user = authState.user;
          console.log('🎯 Header - User found:', {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user.id
          });
          
          this.userName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email;
          
          this.userAvatarUrl = user.profilePhotoUrl || 'assets/default-avatar.png';
          
          console.log('🎯 Header - userName set to:', this.userName);
          console.log('🎯 Header - userAvatarUrl set to:', this.userAvatarUrl);
        } else {
          console.log('🎯 Header - No user found, using defaults');
          this.userName = 'User';
          this.userAvatarUrl = 'assets/default-avatar.png';
        }
      });


  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.combinedSubscription?.unsubscribe();
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

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
}
