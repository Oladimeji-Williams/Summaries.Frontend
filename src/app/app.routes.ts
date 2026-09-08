import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/pages/login-page/login-page')
        .then(m => m.LoginPage),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./core/auth/pages/register-page/register-page')
        .then(m => m.RegisterPage),
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./core/auth/pages/forgot-password-page/forgot-password-page')
        .then(m => m.ForgotPasswordPage),
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./core/auth/pages/reset-password-page/reset-password-page')
        .then(m => m.ResetPasswordPage),
  },

  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./core/auth/pages/confirm-email-page/confirm-email-page')
        .then(m => m.ConfirmEmailPage),
  },

  // MUST come before **
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./core/auth/pages/auth-callback-page/auth-callback-page')
        .then(m => m.AuthCallbackPage),
  },

  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        redirectTo: 'books',
        pathMatch: 'full',
      },

      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./core/auth/pages/profile-page/profile-page')
            .then(m => m.ProfilePage),
      },

      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./core/auth/pages/change-password-page/change-password-page')
            .then(m => m.ChangePasswordPage),
      },

      {
        path: 'books',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/books/books.routes')
            .then(m => m.booksRoutes),
      },

      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./core/admin/admin.routes')
            .then(m => m.adminRoutes),
      },

      // ALWAYS LAST
      {
        path: '**',
        redirectTo: 'books',
      },
    ],
  },
];