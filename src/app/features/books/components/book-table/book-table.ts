import { Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book, BookStatus, bookStatusClass, bookStatusLabel } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BooksStore } from '../../state/books.store';
import { TableState, ColumnDef } from '../../../../shared/table/table-state';
import { ColumnFilter } from '../../../../shared/components/column-filter/column-filter';
import { SortIndicator } from '../../../../shared/components/sort-indicator/sort-indicator';
import { RatingBar } from '../rating-bar/rating-bar';
import { DeleteBookButton } from '../delete-book-button/delete-book-button';

@Component({
  selector: 'app-book-table',
  imports: [RouterLink, DatePipe, ColumnFilter, SortIndicator, RatingBar, DeleteBookButton],
  templateUrl: './book-table.html',
  styleUrl: './book-table.scss',
})
export class BookTable {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly auth = inject(AuthStore);
  protected readonly bookStatusClass = bookStatusClass;
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

  private ratingLabel(b: Book): string {
    return b.myReadingStatus?.rating != null ? `${b.myReadingStatus.rating}/5` : 'Not rated';
  }

  private dateLabel(d: string | null | undefined): string {
    return d ? new Date(d).toLocaleString() : 'Not set';
  }

  private readonly columns: ColumnDef<Book>[] = [
    { key: 'title', label: 'Title', value: (b) => b.title, sortable: true, filterable: true },
    { key: 'author', label: 'Author', value: (b) => b.author, sortable: true, filterable: true },
    { key: 'description', label: 'Description', value: (b) => b.description, sortable: true },
    {
      key: 'rating', label: 'Rating', sortable: true, filterable: true,
      value: (b) => this.ratingLabel(b),
      sortValue: (b) => b.myReadingStatus?.rating ?? -1,
    },
    {
      key: 'started', label: 'Started', sortable: true, filterable: true,
      value: (b) => this.dateLabel(b.myReadingStatus?.dateStarted),
      sortValue: (b) => b.myReadingStatus?.dateStarted ? new Date(b.myReadingStatus.dateStarted).getTime() : -1,
    },
    {
      key: 'read', label: 'Read', sortable: true, filterable: true,
      value: (b) => this.dateLabel(b.myReadingStatus?.dateRead),
      sortValue: (b) => b.myReadingStatus?.dateRead ? new Date(b.myReadingStatus.dateRead).getTime() : -1,
    },
    {
      key: 'status', label: 'Status', sortable: true, filterable: true,
      value: (b) => bookStatusLabel(b.myReadingStatus?.status ?? BookStatus.NotStarted),
    },
  ];

  protected readonly table = new TableState(this.books, this.columns);
}