import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trimmedRequired } from '../../validators/book-form.validators';
import { BookStatus } from '../../models/book-status.model';

export interface BookFormValue {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly rating: number | null;
  /** Present only when the status control is shown and editable. */
  readonly status?: BookStatus;
}

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm {
  private readonly fb = inject(FormBuilder);

  readonly initialValue = input<BookFormValue | null>(null);
  readonly submitting = input(false);
  readonly submitLabel = input('Save');
  readonly submittingLabel = input('Saving...');
  readonly cancelLink = input('/books');

  /** Pass the book's current status to show a status field at all (edit page only). */
  readonly currentStatus = input<BookStatus | null>(null);
  /** Only InProgress books allow choosing a new status (-> Read). */
  readonly statusEditable = input(false);

  readonly save = output<BookFormValue>();

  protected readonly BookStatus = BookStatus;

  readonly form = this.fb.nonNullable.group({
    title: ['', [trimmedRequired(), Validators.maxLength(200)]],
    author: ['', [trimmedRequired(), Validators.maxLength(200)]],
    description: ['', [trimmedRequired(), Validators.maxLength(5000)]],
    rating: [null as number | null, [Validators.min(0), Validators.max(1)]],
    status: [BookStatus.InProgress as BookStatus],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) this.form.patchValue(value);
    });
    effect(() => {
      const status = this.currentStatus();
      if (status) this.form.controls.status.setValue(status);
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.save.emit({
      title: raw.title.trim(),
      author: raw.author.trim(),
      description: raw.description.trim(),
      rating: raw.rating === null || raw.rating === undefined ? null : Number(raw.rating.toFixed(2)),
      ...(this.statusEditable() ? { status: raw.status } : {}),
    });
  }
}