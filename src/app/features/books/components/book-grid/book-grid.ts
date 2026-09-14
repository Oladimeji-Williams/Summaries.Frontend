import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book, BookStatus, canEditBook, canDownloadBook, bookAccessClass, bookAccessLabel } from '../../models';
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
    return canEditBook(book, this.auth.isAdmin());
  }

  protected accessLabel(book: Book): string | null {
    return bookAccessLabel(book, this.auth.isAdmin());
  }

  protected accessClass(book: Book): string {
    return bookAccessClass(book, this.auth.isAdmin());
  }

  protected canDownloadBook(book: Book): boolean {
    return canDownloadBook(book, this.auth.isAdmin());
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