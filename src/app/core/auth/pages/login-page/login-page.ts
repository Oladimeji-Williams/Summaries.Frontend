import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { AuthShell } from '../../components/auth-shell/auth-shell';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, AuthShell, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly awaitingTwoFactor = signal(false);
  protected readonly twoFactorToken = signal<string | null>(null);
  protected readonly twoFactorCode = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    const { success, twoFactorToken } = await this.store.login(this.form.getRawValue());
    if (success) {
      void this.router.navigateByUrl('/books');
    } else if (twoFactorToken) {
      this.twoFactorToken.set(twoFactorToken);
      this.awaitingTwoFactor.set(true);
    }
  }

  
  async onSubmitTwoFactor(): Promise<void> {
    const token = this.twoFactorToken();
    if (!token) return;
    const success = await this.store.completeTwoFactorLogin(token, this.twoFactorCode());
    if (success) {
      void this.router.navigateByUrl('/books');
    }
  }
}