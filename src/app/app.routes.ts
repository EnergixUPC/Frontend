import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
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
        path: 'register',
        loadComponent: () => import('./shared/presentation/layouts/layout-login/layout-login').then(m => m.LayoutLogin),
        children: [
          {
            path: '',
            loadComponent: () => import('./sems/authentication/presentation/views/register/register').then(m => m.Register)
          }
        ]
      }
    ]
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
    path: 'register',
    loadComponent: () => import('./shared/presentation/layouts/layout-login/layout-login').then(m => m.LayoutLogin),
    children: [
      {
        path: '',
        loadComponent: () => import('./sems/authentication/presentation/views/register/register').then(m => m.Register)
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
        loadComponent: () => import('./sems/energy-management/presentation/views/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'devices',
        loadComponent: () => import('./sems/energy-management/presentation/views/devices/devices').then(m => m.Devices)
      },
      {
        path: 'devices/add',
        loadComponent: () => import('./sems/energy-management/presentation/views/add-device/add-device').then(m => m.AddDevice)
      },
      {
        path: 'device-preferences',
        loadComponent: () => import('./sems/energy-management/presentation/views/device-preferences/device-preferences').then(m => m.DevicePreferences)
      },
      {
        path: 'reports',
        loadComponent: () => import('./sems/energy-management/presentation/views/reports/reports').then(m => m.Reports)
      },
      {
        path: 'settings',
        loadComponent: () => import('./sems/energy-management/presentation/views/settings/settings').then(m => m.Settings)
      },
      {
        path: 'settings-suports',
        loadComponent: () => import('./sems/energy-management/presentation/views/settings-suports/settings-suports').then(m => m.SettingsSuports)
      },
      {
        path: 'plans',
        loadComponent: () => import('./sems/plans/presentation/views/plans/plans').then(m => m.Plans)
      },
      {
        path: 'plans/payments',
        loadComponent: () => import('./sems/payments/presentation/views/payments/payments').then(m => m.Payments)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound)
  }
];
