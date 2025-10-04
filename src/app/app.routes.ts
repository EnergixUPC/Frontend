import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./sems/authentication/presentation/views/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./sems/energy-management/presentation/views/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound)
  }
];
