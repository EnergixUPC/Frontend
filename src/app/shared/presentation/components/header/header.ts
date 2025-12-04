import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
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
    private authController: AuthControllerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.updateDateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateDateTime());

    // Update date when language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateDateTime();
    });

    // Subscribe only to authentication state
    this.combinedSubscription = this.authController.getCurrentAuthState()
      .subscribe(authState => {
        console.log('Header - Auth state received:', authState);

        if (authState?.user) {
          const user = authState.user;
          console.log('Header - User found:', {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user.id
          });

          this.userName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email;

          this.userAvatarUrl = user.profilePhotoUrl || 'assets/default-avatar.png';

          console.log('Header - userName set to:', this.userName);
          console.log('Header - userAvatarUrl set to:', this.userAvatarUrl);
        } else {
          console.log('Header - No user found, using defaults');
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
    const day = this.currentDate.toLocaleDateString(this.translate.currentLang, { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  getFormattedDate(): string {
    const dateStr = this.currentDate.toLocaleDateString(this.translate.currentLang, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // If notifications are not shown, do nothing
    if (!this.showNotifications) return;

    const target = event.target as HTMLElement;

    // Check if click is inside the notification button
    const isInsideButton = target.closest('.notification-button');

    // Check if click is inside the notification popup (which is inside app-notifications)
    // We need to check for the app-notifications element or its children
    const isInsidePopup = target.closest('app-notifications');

    // If click is outside both, close notifications
    if (!isInsideButton && !isInsidePopup) {
      this.showNotifications = false;
    }
  }
}
