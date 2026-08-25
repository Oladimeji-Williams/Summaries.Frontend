import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0AuthService } from '@auth0/auth0-angular';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: '',
})
export class HomeRedirectPage {
  constructor() {
    const auth0 = inject(Auth0AuthService, { optional: true });
    const router = inject(Router);

    if (!auth0) {
      return; // server-side: nothing to wait on, render stays empty
    }

    auth0.isLoading$
      .pipe(filter((isLoading) => !isLoading), take(1))
      .subscribe(() => router.navigateByUrl('/books'));
  }
}