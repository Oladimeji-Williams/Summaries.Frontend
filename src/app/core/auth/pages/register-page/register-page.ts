import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../state/auth.store';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { matchValidator } from '../../validators/match.validator';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, AuthShell],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(AuthStore);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchValidator('password', 'confirmPassword') },
  );

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    const confirmEmailUrlBase = `${window.location.origin}/confirm-email`;
    const success = await this.store.register({ email, password, confirmEmailUrlBase });
    if (success) {
      this.submitted.set(true);
    }
  }
}