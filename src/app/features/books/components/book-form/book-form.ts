import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trimmedRequired } from '../../validators/book-form.validators';
import { BookStatus, BookFormValue, bookStatusLabel } from '../../models';

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
  readonly currentStatus = input<BookStatus | null>(null);
  readonly statusEditable = input(false);

  readonly save = output<BookFormValue>();

  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;

  readonly form = this.fb.nonNullable.group({
    title: ['', [trimmedRequired(), Validators.maxLength(200)]],
    author: ['', [trimmedRequired(), Validators.maxLength(200)]],
    description: ['', [trimmedRequired(), Validators.maxLength(5000)]],
    status: [BookStatus.InProgress as BookStatus],
    rating: [null as number | null, [Validators.min(0), Validators.max(5)]],
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

  protected get wantsToMarkAsRead(): boolean {
    return this.form.controls.status.value === BookStatus.Read;
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
      ...(this.statusEditable() ? { status: raw.status, rating: raw.rating } : {}),
    });
  }
}