import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { matchValidator } from '../../validators/match.validator';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-change-password-page',
  imports: [ReactiveFormsModule, AuthShell],
  templateUrl: './change-password-page.html',
  styleUrl: './change-password-page.scss',
})
export class ChangePasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly notifications = inject(NotificationService);


  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchValidator('newPassword', 'confirmPassword') },
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.authApi.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/profile');
        this.notifications.success('Password changed successfully.');
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to change password.'));
      },
    });
  }
}