import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { environment } from '../../../../../environments/environment';

type LoginStep = 'email' | 'password' | 'awaitingEmailCode' | 'accountNotFound' | 'noPasswordSet';

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

  protected readonly step = signal<LoginStep>('email');
  protected readonly checkingEmail = signal(false);
  protected readonly emailControl = this.fb.nonNullable.control('', [Validators.required, Validators.email]);

  protected readonly emailCode = signal('');
  protected readonly verifyingCode = signal(false);
  protected readonly codeDigits = [0, 1, 2, 3, 4, 5];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onEmailContinue(): Promise<void> {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    const email = this.emailControl.value.trim();
    this.checkingEmail.set(true);
    const outcome = await this.store.startLogin(email);
    this.checkingEmail.set(false);

    if (outcome === 'AccountNotFound') {
      this.step.set('accountNotFound');
    } else if (outcome === 'EmailCodeSent') {
      this.step.set('awaitingEmailCode');
    } else if (outcome === 'EmailDeliveryFailed') {
      this.store.setError('We could not send the sign-in email. Please try again shortly.');
    } else if (outcome === 'NoPasswordSet') {
      this.form.controls.email.setValue(email);
      this.step.set('noPasswordSet');
    } else if (outcome === 'UsePassword') {
      this.form.controls.email.setValue(email);
      this.step.set('password');
    }
  }

  goToRegister(): void {
    void this.router.navigate(['/register'], { queryParams: { email: this.emailControl.value.trim() } });
  }

  backToEmail(): void {
    this.step.set('email');
    this.form.reset();
    this.emailCode.set('');
    this.store.clearError();
  }

  async onSubmit(): Promise<void> {
    const { success, twoFactorToken } = await this.store.login(this.form.getRawValue());
    if (success) {
      void this.router.navigateByUrl('/books');
    } else if (twoFactorToken) {
      void this.router.navigate(['/login/two-factor'], { state: { twoFactorToken } });
    }
  }

  async onVerifyEmailCode(event: Event): Promise<void> {
    event.preventDefault();
    await this.verifyEmailCode();
  }

  protected onCodeInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const digit = target.value.replace(/\D/g, '').slice(-1);
    const code = this.emailCode().padEnd(6, '').split('');
    code[index] = digit;
    this.emailCode.set(code.join('').slice(0, 6));

    if (digit && index < 5) {
      this.focusCodeInput(index + 1);
    }
    if (code.every(Boolean)) {
      void this.verifyEmailCode();
    }
  }

  protected onCodeKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.emailCode()[index] && index > 0) {
      this.focusCodeInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusCodeInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusCodeInput(index + 1);
    }
  }

  protected onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedCode = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    this.emailCode.set(pastedCode);
    if (pastedCode.length === 6) {
      void this.verifyEmailCode();
    }
  }

  private focusCodeInput(index: number): void {
    document.getElementById(`emailCode-${index}`)?.focus();
  }

  private async verifyEmailCode(): Promise<void> {
    const email = this.emailControl.value.trim();
    const code = this.emailCode();
    if (code.length !== 6 || this.verifyingCode()) return;
    this.verifyingCode.set(true);
    const success = await this.store.completeEmailSignInWithCode(email, code);
    this.verifyingCode.set(false);
    if (success) {
      void this.router.navigateByUrl('/books');
    }
  }

  externalLoginUrl(provider: string): string {
    return `${environment.oauthBaseUrl}/v1/auth/external-login/${provider}`;
  }
}