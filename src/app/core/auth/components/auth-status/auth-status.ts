import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-auth-status',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './auth-status.html',
  styleUrl: './auth-status.scss',
})
export class AuthStatus {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);
  protected readonly showLogoutConfirm = signal(false);

  protected get initials(): string {
    const name = this.store.displayName() ?? '';
    return name.split(' ').map((p) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  requestLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  async confirmLogout(): Promise<void> {
    this.showLogoutConfirm.set(false);
    await this.store.logout();
    void this.router.navigateByUrl('/login');
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }
}