import { Routes } from '@angular/router';

export const booksRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/book-list-page/book-list-page')
        .then(m => m.BookListPage),
  },

  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-book-page/create-book-page')
        .then(m => m.CreateBookPage),
  },

  {
    path: ':id',
    loadComponent: () =>
      import('./pages/book-details-page/book-details-page')
        .then(m => m.BookDetailsPage),
  },

  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/edit-book-page/edit-book-page')
        .then(m => m.EditBookPage),
  },

  {
    path: ':id/delete-book',
    loadComponent: () =>
      import('./pages/delete-book-page/delete-book-page')
        .then(m => m.DeleteBookPage),
  },
];