import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
})
export class AuthShell {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly form = input.required<FormGroup>();
  readonly error = input<string | null>(null);
  readonly submitting = input(false);
  readonly submitLabel = input('Submit');
  readonly submittingLabel = input('Submitting...');
  readonly switchPrompt = input('');
  readonly switchLinkText = input('');
  readonly switchLinkPath = input('/');

  readonly formSubmit = output<void>();

  submit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }
    this.formSubmit.emit();
  }
}