import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
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
    CommonModule, TranslateModule, MatIconModule,
    MatBadgeModule, MatButtonModule, LangSwitcher, NotificationsComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  dayOfWeek: string = '';
  formattedDate: string = '';
  formattedTime: string = '';
  userName: string = 'User';
  userAvatarUrl: string | null = null;
  userInitials: string = '?';
  notificationCount: number = 2;
  showNotifications = false;

  private timeSubscription?: Subscription;
  private combinedSubscription?: Subscription;

  constructor(
    private authController: AuthControllerService,
    private translate: TranslateService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.updateDateTime();
    this.ngZone.runOutsideAngular(() => {
      this.timeSubscription = interval(1000).subscribe(() => {
        this.ngZone.run(() => this.updateDateTime());
      });
    });
    this.translate.onLangChange.subscribe(() => {
      this.updateDateTime();
    });

    this.combinedSubscription = this.authController.getCurrentAuthState()
      .subscribe(authState => {
        if (authState?.user) {
          const user = authState.user;
          this.userName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email;

          const photo = user.profilePhotoUrl;
          this.userAvatarUrl = photo && photo.trim() !== '' ? photo : null;

          const first = (user.firstName || '').charAt(0).toUpperCase();
          const last = (user.lastName || '').charAt(0).toUpperCase();
          this.userInitials = first + last || '?';
        } else {
          this.userName = 'User';
          this.userAvatarUrl = null;
          this.userInitials = '?';
        }
      });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.combinedSubscription?.unsubscribe();
  }

  updateDateTime(): void {
    this.currentDate = new Date();
    const lang = this.translate.currentLang || this.translate.defaultLang || 'es';
    
    const day = this.currentDate.toLocaleDateString(lang, { weekday: 'long' });
    this.dayOfWeek = day.charAt(0).toUpperCase() + day.slice(1);
    
    const dateStr = this.currentDate.toLocaleDateString(lang, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    this.formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    this.formattedTime = this.currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  onAvatarError(): void {
    this.userAvatarUrl = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showNotifications) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-button') && !target.closest('app-notifications')) {
      this.showNotifications = false;
    }
  }
}
