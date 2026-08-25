import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { auth0Config } from './core/auth/auth.config';
import { routes } from './app.routes';
import { httpInterceptors } from './core/interceptors';
import { API_CONFIG } from './core/config/api-config';
import { environment } from '../environments/environment';

const isBrowser = typeof window !== 'undefined';

const interceptors = isBrowser
  ? [authHttpInterceptorFn, ...httpInterceptors]
  : httpInterceptors;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors(interceptors)),
    ...(isBrowser ? [provideAuth0(auth0Config)] : []),
    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },
  ],
};