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
  /** When false, title/author/description/etc. render as read-only text, not inputs. */
  readonly metadataEditable = input(true);

  readonly save = output<BookFormValue>();

  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;

  readonly form = this.fb.nonNullable.group({
    title: ['', [trimmedRequired(), Validators.maxLength(200)]],
    author: ['', [trimmedRequired(), Validators.maxLength(200)]],
    description: ['', [trimmedRequired(), Validators.maxLength(5000)]],
    isbn: ['', [Validators.maxLength(20)]],
    publisher: ['', [Validators.maxLength(200)]],
    publishedYear: [null as number | null],
    genre: ['', [Validators.maxLength(100)]],
    pageCount: [null as number | null],
    status: [BookStatus.InProgress as BookStatus],
    rating: [null as number | null, [Validators.min(0), Validators.max(5)]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.patchValue({
          title: value.title,
          author: value.author,
          description: value.description,
          isbn: value.isbn ?? '',
          publisher: value.publisher ?? '',
          publishedYear: value.publishedYear,
          genre: value.genre ?? '',
          pageCount: value.pageCount,
        });
      }
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
      isbn: raw.isbn.trim() || null,
      publisher: raw.publisher.trim() || null,
      publishedYear: raw.publishedYear,
      genre: raw.genre.trim() || null,
      pageCount: raw.pageCount,
      ...(this.statusEditable() ? { status: raw.status, rating: raw.rating } : {}),
    });
  }
}