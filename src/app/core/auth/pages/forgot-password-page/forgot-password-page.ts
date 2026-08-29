import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, AuthShell, RouterLink],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})

export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);
  /** DEV ONLY — remove once real email delivery is wired up. */
  protected readonly devResetToken = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.authApi.forgotPassword(this.form.getRawValue()).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.devResetToken.set(result.resetToken);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to process request.'));
      },
    });
  }
}