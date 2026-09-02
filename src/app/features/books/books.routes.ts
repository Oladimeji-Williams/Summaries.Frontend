import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/admin.guard';
import { authGuard } from '../../core/auth/auth.guard';

export const booksRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/book-list-page/book-list-page').then(m => m.BookListPage),
  },
  {
    path: 'create',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/create-book-page/create-book-page').then(m => m.CreateBookPage),
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/book-details-page/book-details-page').then(m => m.BookDetailsPage),
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/edit-book-page/edit-book-page').then(m => m.EditBookPage),
  },
];