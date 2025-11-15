import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription, combineLatest } from 'rxjs';
import { ProfileStore } from '../../../../sems/energy-management/application/state/profile.store';
import { AuthControllerService } from '../../../../sems/authentication/application/services/auth-controller.service';
import { LangSwitcher } from '../lang-switcher/lang-switcher';
import { NotificationsComponent } from '../../../../sems/notifications/presentation/views/notifications';
import { environment } from '../../../../../environments/environments';
import { distinctUntilChanged } from 'rxjs/operators';


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
    private authController: AuthControllerService,
    private profileStore: ProfileStore
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateDateTime());

    this.combinedSubscription = combineLatest([
      this.authController.getCurrentAuthState(),
      this.profileStore.profile$
    ]).pipe(
      distinctUntilChanged((prev, curr) =>
        prev[0]?.user?.id === curr[0]?.user?.id &&
        prev[1]?.id === curr[1]?.id
      )
    ).subscribe(async ([authState, profile]) => {
      if (authState?.user && !profile) {
        const token = localStorage.getItem(environment.tokenKey);
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenPayload.userId || tokenPayload.id;

          try {
            const res = await fetch(`${environment.apiUrl}/api/profile/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (res.ok) {
              const data = await res.json();
              this.profileStore.updateActiveProfile(data);
            }
          } catch (err) {
            console.error('Error cargando perfil:', err);
          }
        }
      }

      if (profile) {
        this.userName = profile.fullName || `${profile.firstName} ${profile.lastName}`;
        this.userAvatarUrl = profile.profilePhotoUrl || 'assets/default-avatar.png';
      } else {
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
