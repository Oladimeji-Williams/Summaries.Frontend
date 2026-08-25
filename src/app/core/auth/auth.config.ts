import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';

export const auth0Config: AuthConfig = {
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: {
    redirect_uri: redirectUri,
    audience: environment.auth0.audience,
  },
  httpInterceptor: {
    allowedList: [`${environment.apiBaseUrl}/*`],
  },
};