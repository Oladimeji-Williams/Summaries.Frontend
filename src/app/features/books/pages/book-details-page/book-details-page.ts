import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BookStatus, bookStatusClass, bookStatusLabel } from '../../models';
import { RatingBar } from '../../components/rating-bar/rating-bar';
import { DeleteBookButton } from '../../components/delete-book-button/delete-book-button';
import { Spinner } from "../../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-book-details-page',
  imports: [RouterLink, DatePipe, RatingBar, DeleteBookButton, Spinner],
  templateUrl: './book-details-page.html',
  styleUrl: './book-details-page.scss',
})
export class BookDetailsPage {
  private readonly store = inject(BooksStore);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = this.store.selectedBook;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly bookStatusClass = bookStatusClass;

  protected readonly purchasing = signal(false);
  protected readonly downloading = signal(false);

  constructor() {
    effect(() => {
      this.store.viewBook(this.id());
    });
  }

  protected canEdit(): boolean {
    const status = this.book()?.myReadingStatus?.status ?? BookStatus.NotStarted;
    return this.auth.isAdmin() || status !== BookStatus.Read;
  }

  protected canDownload(): boolean {
    const book = this.book();
    if (!book || !book.hasPdf) return false;
    return book.priceKobo === null || book.isPurchased || this.auth.isAdmin();
  }

  protected formattedPrice(priceKobo: number): string {
    return (priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async buyBook(): Promise<void> {
    const book = this.book();
    if (!book) return;
    this.purchasing.set(true);
    const authorizationUrl = await this.store.purchaseBook(book.id);
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    } else {
      this.purchasing.set(false);
    }
  }

  async downloadBook(): Promise<void> {
    const book = this.book();
    if (!book) return;
    this.downloading.set(true);
    const url = await this.store.downloadBook(book.id);
    this.downloading.set(false);
    if (url) {
      window.open(url, '_blank');
    }
  }

  onDeleted(): void {
    void this.router.navigateByUrl('/books');
  }
}