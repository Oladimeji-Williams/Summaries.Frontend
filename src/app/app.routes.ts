import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/pages/login-page/login-page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./core/auth/pages/register-page/register-page').then(m => m.RegisterPage),
  },
  {
    path: 'books',
    canActivate: [authGuard],
    loadChildren: () => import('./features/books/books.routes').then(m => m.booksRoutes),
  },
  { path: '**', redirectTo: 'books' },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./core/auth/pages/profile-page/profile-page').then(m => m.ProfilePage),
  },
];