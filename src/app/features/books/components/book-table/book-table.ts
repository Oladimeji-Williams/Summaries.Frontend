import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book, BookStatus, bookStatusLabel } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { TableState, ColumnDef } from '../../../../shared/table/table-state';
import { ColumnFilter } from '../../../../shared/components/column-filter/column-filter';
import { RatingBar } from '../rating-bar/rating-bar';
import { SortIndicator } from "../../../../shared/components/sort-indicator/sort-indicator";

@Component({
  selector: 'app-book-table',
  imports: [RouterLink, DatePipe, ColumnFilter, RatingBar, SortIndicator],
  templateUrl: './book-table.html',
  styleUrl: './book-table.scss',
})
export class BookTable {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly auth = inject(AuthStore);

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