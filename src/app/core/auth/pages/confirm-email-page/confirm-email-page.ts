import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../data-access/auth-api.service';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

type ConfirmMode = 'confirming' | 'success' | 'error' | 'resend';

@Component({
  selector: 'app-confirm-email-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './confirm-email-page.html',
  styleUrl: './confirm-email-page.scss',
})
export class ConfirmEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly mode = signal<ConfirmMode>('confirming');
  protected readonly error = signal<string | null>(null);
  protected readonly resendSubmitted = signal(false);
  protected readonly resending = signal(false);

  protected readonly resendForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.mode.set('resend');
      return;
    }

    this.authApi.confirmEmail({ email, token }).subscribe({
      next: () => this.mode.set('success'),
      error: (err) => {
        this.error.set(getApiErrorMessage(err, 'This confirmation link is invalid or has expired.'));
        this.mode.set('error');
      },
    });
  }

  showResendForm(): void {
    this.mode.set('resend');
  }

  onResend(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }
    this.resending.set(true);
    const confirmEmailUrlBase = `${window.location.origin}/confirm-email`;
    this.authApi
      .resendConfirmation({ email: this.resendForm.controls.email.value, confirmEmailUrlBase })
      .subscribe({
        next: () => {
          this.resending.set(false);
          this.resendSubmitted.set(true);
        },
        error: () => {
          this.resending.set(false);
          this.resendSubmitted.set(true);
        },
      });
  }
}