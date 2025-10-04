import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/presentation/layouts/layout-login/layout-login').then(m => m.LayoutLogin),
    children: [
      {
        path: '',
        loadComponent: () => import('./sems/authentication/presentation/views/login/login').then(m => m.Login)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./shared/presentation/layouts/layout-home/layout-home').then(m => m.LayoutHome),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./sems/energy-management/presentation/views/home/home').then(m => m.Home)
      },
      {
        path: 'profile',
        loadComponent: () => import('./sems/energy-management/presentation/views/profile/profile').then(m => m.Profile)
      },
      {
        path: 'devices',
        loadComponent: () => import('./sems/energy-management/presentation/views/devices/devices').then(m => m.Devices)
      },
      {
        path: 'reports',
        loadComponent: () => import('./sems/energy-management/presentation/views/reports/reports').then(m => m.Reports)
      },
      {
        path: 'settings',
        loadComponent: () => import('./sems/energy-management/presentation/views/settings/settings').then(m => m.Settings)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound)
  }
];
