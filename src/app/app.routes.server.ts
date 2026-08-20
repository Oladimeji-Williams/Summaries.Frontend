import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'books',
    renderMode: RenderMode.Server,
  },
  {
    path: 'books/create',
    renderMode: RenderMode.Server,
  },
  {
    path: 'books/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'books/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'books/:id/delete-book',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];