import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-auth-status',
  imports: [RouterLink],
  templateUrl: './auth-status.html',
  styleUrl: './auth-status.scss',
})
export class AuthStatus {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected get initials(): string {
    const name = this.store.displayName() ?? '';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async logout(): Promise<void> {
    await this.store.logout();
    void this.router.navigateByUrl('/login');
  }
}