import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchValidator('password', 'confirmPassword') },
  );

  async onSubmit(): Promise<void> {
    const { confirmPassword, ...request } = this.form.getRawValue();
    const success = await this.store.register(request);
    if (success) {
      void this.router.navigateByUrl('/login');
    }
  }
}