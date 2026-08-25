import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService as Auth0AuthService } from '@auth0/auth0-angular';
import { filter, map, switchMap, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth0 = inject(Auth0AuthService);

  return auth0.isLoading$.pipe(
    filter((isLoading) => !isLoading),
    take(1),
    switchMap(() => auth0.isAuthenticated$),
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      auth0.loginWithRedirect();
      return false;
    }),
  );
};