import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book, BookStatus } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BooksStore } from '../../state/books.store';
import { DeleteBookButton } from '../delete-book-button/delete-book-button';

@Component({
  selector: 'app-book-grid',
  imports: [RouterLink, DeleteBookButton],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
})
export class BookGrid {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly auth = inject(AuthStore);
  private readonly booksStore = inject(BooksStore);

  protected readonly purchasingIds = signal<ReadonlySet<number>>(new Set());
  protected readonly downloadingIds = signal<ReadonlySet<number>>(new Set());

  protected canEdit(book: Book): boolean {
    return this.auth.isAdmin() || (book.myReadingStatus?.status ?? BookStatus.NotStarted) !== BookStatus.Read;
  }

  protected accessLabel(book: Book): string | null {
    if (!book.hasPdf) return null;
    if (book.priceKobo === null) return 'Free';
    if (book.isPurchased || this.auth.isAdmin()) return 'Owned';
    return `₦${(book.priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  protected accessClass(book: Book): string {
    if (book.priceKobo === null) return 'access-free';
    if (book.isPurchased || this.auth.isAdmin()) return 'access-owned';
    return 'access-buy';
  }

  protected canDownloadBook(book: Book): boolean {
    if (!book.hasPdf) return false;
    return book.priceKobo === null || book.isPurchased || this.auth.isAdmin();
  }

  async buyBook(book: Book): Promise<void> {
    this.purchasingIds.update((ids) => new Set(ids).add(book.id));
    const authorizationUrl = await this.booksStore.purchaseBook(book.id);
    if (authorizationUrl) {
      window.location.href = authorizationUrl;
    } else {
      this.purchasingIds.update((ids) => {
        const next = new Set(ids);
        next.delete(book.id);
        return next;
      });
    }
  }

  async downloadBook(book: Book): Promise<void> {
    this.downloadingIds.update((ids) => new Set(ids).add(book.id));
    const url = await this.booksStore.downloadBook(book.id);
    this.downloadingIds.update((ids) => {
      const next = new Set(ids);
      next.delete(book.id);
      return next;
    });
    if (url) {
      window.open(url, '_blank');
    }
  }
}