import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslateService } from '@ngx-translate/core';
import { AuthControllerService } from '../../../../sems/authentication/application/services/auth-controller.service';

interface MenuItem {
  labelKey: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  menuItems: MenuItem[] = [
    { labelKey: 'sidebar.home', icon: 'home', route: '/home', active: true },
    { labelKey: 'sidebar.profile', icon: 'person', route: '/profile', active: false },
    { labelKey: 'sidebar.devices', icon: 'devices', route: '/devices', active: false },
    { labelKey: 'sidebar.reports', icon: 'assessment', route: '/reports', active: false },
    { labelKey: 'sidebar.settings', icon: 'settings', route: '/settings', active: false }
  ];

  constructor(
    private router: Router,
    private authController: AuthControllerService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateActiveRoute();
  }

  updateActiveRoute(): void {
    const currentRoute = this.router.url;
    this.menuItems.forEach(item => {
      item.active = currentRoute.includes(item.route);
    });
  }

  onMenuItemClick(item: MenuItem): void {
    this.menuItems.forEach(menuItem => {
      menuItem.active = false;
    });
    item.active = true;
    this.router.navigate([item.route]);
  }

  onLogout(): void {
    this.authController.executeLogout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getLabel(labelKey: string): string {
    return this.translate.instant(labelKey);
  }

  getLogoutLabel(): string {
    return this.translate.instant('sidebar.logout');
  }
}
