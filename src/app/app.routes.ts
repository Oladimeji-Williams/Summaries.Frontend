import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/auth/home-redirect-page').then(m => m.HomeRedirectPage),
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./features/books/books.routes').then(m => m.booksRoutes),
  },
  {
    path: '**',
    redirectTo: 'books',
  },
];