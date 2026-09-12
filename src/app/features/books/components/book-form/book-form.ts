import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { trimmedRequired } from '../../validators/book-form.validators';
import { BookStatus, BookFormValue, bookStatusLabel } from '../../models';
import { BooksApiService } from '../../data-access/books-api.service';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm {
  private readonly fb = inject(FormBuilder);
  private readonly booksApi = inject(BooksApiService);
  protected readonly auth = inject(AuthStore);

  readonly initialValue = input<BookFormValue | null>(null);
  readonly submitting = input(false);
  readonly submitLabel = input('Save');
  readonly submittingLabel = input('Saving...');
  readonly cancelLink = input('/books');
  readonly currentStatus = input<BookStatus | null>(null);
  readonly statusEditable = input(false);
  /** When false, title/author/description/etc. render as read-only text, not inputs. */
  readonly metadataEditable = input(true);

  /** Only set on the edit page — enables the price/PDF section below. */
  readonly bookId = input<number | null>(null);
  readonly currentPriceKobo = input<number | null>(null);
  readonly hasPdf = input(false);

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

  protected readonly priceNaira = signal<string>('');
  protected readonly priceSaving = signal(false);
  protected readonly priceError = signal<string | null>(null);
  protected readonly priceSaved = signal(false);

  protected readonly selectedPdf = signal<File | null>(null);
  protected readonly pdfUploading = signal(false);
  protected readonly pdfError = signal<string | null>(null);
  protected readonly pdfUploaded = signal(false);

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

    effect(() => {
      const kobo = this.currentPriceKobo();
      this.priceNaira.set(
        kobo !== null
          ? (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '',
      );
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

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedPdf.set(input.files?.[0] ?? null);
    this.pdfUploaded.set(false);
    this.pdfError.set(null);
  }

  async savePrice(): Promise<void> {
    const id = this.bookId();
    if (id === null) return;

    this.priceError.set(null);
    this.priceSaved.set(false);

    const trimmed = this.priceNaira().trim();
    let priceKobo: number | null;
    if (trimmed === '') {
      priceKobo = null;
    } else {
      const naira = Number(trimmed.replace(/,/g, ''));
      if (Number.isNaN(naira) || naira < 0) {
        this.priceError.set('Enter a valid price, or leave blank for a free book.');
        return;
      }
      priceKobo = Math.round(naira * 100);
    }

    this.priceSaving.set(true);
    try {
      await firstValueFrom(this.booksApi.updatePrice(id, priceKobo));
      this.priceSaved.set(true);
    } catch (err) {
      this.priceError.set(getApiErrorMessage(err, 'Unable to update price.'));
    } finally {
      this.priceSaving.set(false);
    }
  }

  async uploadPdf(): Promise<void> {
    const id = this.bookId();
    const file = this.selectedPdf();
    if (id === null || !file) return;

    this.pdfError.set(null);
    this.pdfUploading.set(true);
    try {
      await firstValueFrom(this.booksApi.uploadPdf(id, file));
      this.pdfUploaded.set(true);
      this.selectedPdf.set(null);
    } catch (err) {
      this.pdfError.set(getApiErrorMessage(err, 'Unable to upload PDF.'));
    } finally {
      this.pdfUploading.set(false);
    }
  }

  protected onPriceBlur(): void {
    const trimmed = this.priceNaira().trim();
    if (trimmed === '') return;

    const naira = Number(trimmed.replace(/,/g, ''));
    if (Number.isNaN(naira) || naira < 0) return;

    this.priceNaira.set(naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
}