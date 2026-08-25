import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth0 = inject(Auth0AuthService, { optional: true });

  readonly isAuthenticated = toSignal(
    this.auth0?.isAuthenticated$ ?? of(false),
    { initialValue: false },
  );
  readonly isLoading = toSignal(
    this.auth0?.isLoading$ ?? of(false),
    { initialValue: false },
  );
  readonly user = toSignal(
    this.auth0?.user$ ?? of(null),
    { initialValue: null },
  );

  login(): void {
    this.auth0?.loginWithRedirect();
  }

  logout(): void {
    this.auth0?.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}