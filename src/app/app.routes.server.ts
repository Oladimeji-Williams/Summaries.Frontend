import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'forgot-password', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },
  { path: 'change-password', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'books', renderMode: RenderMode.Client },
  { path: 'books/create', renderMode: RenderMode.Client },
  { path: 'books/:id', renderMode: RenderMode.Client },
  { path: 'books/:id/edit', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];