import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: 'users', loadComponent: () => import('./pages/admin-users-page/admin-users-page').then(m => m.AdminUsersPage) },
  { path: 'users/:userId', loadComponent: () => import('./pages/admin-user-history-page/admin-user-history-page').then(m => m.AdminUserHistoryPage) },
  { path: 'books/:bookId/readers', loadComponent: () => import('./pages/admin-book-readers-page/admin-book-readers-page').then(m => m.AdminBookReadersPage) },
];