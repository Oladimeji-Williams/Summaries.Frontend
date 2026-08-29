import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { matchValidator } from '../../validators/match.validator';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, AuthShell],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);

  private readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  protected loading = false;
  protected error: string | null = null;

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchValidator('newPassword', 'confirmPassword') },
  );

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    this.authApi
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: this.form.controls.newPassword.value,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          void this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.loading = false;
          this.error = getApiErrorMessage(err, 'Unable to reset password.');
        },
      });
  }
}