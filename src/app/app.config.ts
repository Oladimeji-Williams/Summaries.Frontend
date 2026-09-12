import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { httpInterceptors } from './core/interceptors';
import { authInterceptor } from './core/auth/auth.interceptor';
import { API_CONFIG } from './core/config/api-config';
import { environment } from '../environments/environment';
import { AuthStore } from './core/auth/state/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, ...httpInterceptors])),
    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },
    provideAppInitializer(() => {
      const auth = inject(AuthStore);
      auth.restoreSession();
    }),
  ],
};