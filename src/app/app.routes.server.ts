import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: 'books',
    renderMode: RenderMode.Client,
  },
  {
    path: 'books/create',
    renderMode: RenderMode.Client,
  },
  {
    path: 'books/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'books/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'books/:id/delete-book',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];