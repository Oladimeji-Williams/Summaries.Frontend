import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStatus } from '../../core/auth/components/auth-status/auth-status';
import { AuthStore } from '../../core/auth/state/auth.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AuthStatus],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth = inject(AuthStore);
}