import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../data-access/admin-api.service';
import { UserReadingHistory, BookReadingEntry } from '../../models/admin.model';
import { bookStatusLabel } from '../../../../features/books/models';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { formatReadingDuration } from '../../utils/reading-duration.util';
import { TableState, ColumnDef } from '../../../../shared/table/table-state';
import { ColumnFilter } from '../../../../shared/components/column-filter/column-filter';
import { SortIndicator } from '../../../../shared/components/sort-indicator/sort-indicator';
import { Spinner } from "../../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-admin-user-history-page',
  imports: [DatePipe, ColumnFilter, SortIndicator, Spinner],
  templateUrl: './admin-user-history-page.html',
  styleUrl: './admin-user-history-page.scss',
})
export class AdminUserHistoryPage {
  private readonly adminApi = inject(AdminApiService);

  readonly userId = input.required<string>();

  protected readonly history = signal<UserReadingHistory | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly formatReadingDuration = formatReadingDuration;

  private readonly books = signal<readonly BookReadingEntry[]>([]);

  private dateLabel(d: string | null): string {
    return d ? new Date(d).toLocaleString() : 'Not set';
  }

  private readonly columns: ColumnDef<BookReadingEntry>[] = [
    { key: 'title', label: 'Title', value: (b) => b.title, sortable: true, filterable: true },
    { key: 'author', label: 'Author', value: (b) => b.author, sortable: true, filterable: true },
    { key: 'status', label: 'Status', value: (b) => bookStatusLabel(b.status), sortable: true, filterable: true },
    {
      key: 'rating', label: 'Rating', sortable: true, filterable: true,
      value: (b) => b.rating != null ? `${b.rating}` : '—',
      sortValue: (b) => b.rating ?? -1,
    },
    {
      key: 'started', label: 'Started', sortable: true, filterable: true,
      value: (b) => this.dateLabel(b.dateStarted),
      sortValue: (b) => b.dateStarted ? new Date(b.dateStarted).getTime() : -1,
    },
    {
      key: 'read', label: 'Read', sortable: true, filterable: true,
      value: (b) => this.dateLabel(b.dateRead),
      sortValue: (b) => b.dateRead ? new Date(b.dateRead).getTime() : -1,
    },
    {
      key: 'duration', label: 'Reading time', sortable: true, filterable: true,
      value: (b) => formatReadingDuration(b.readingDurationHours),
      sortValue: (b) => b.readingDurationHours ?? -1,
    },
  ];

  protected readonly table = new TableState(this.books, this.columns);

  constructor() {
    effect(() => {
      const id = this.userId();
      this.loading.set(true);
      this.error.set(null);
      this.adminApi.getUserReadingHistory(id).subscribe({
        next: (h) => {
          this.history.set(h);
          this.books.set(h.books);
          this.loading.set(false);
        },
        error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load reading history.')); this.loading.set(false); },
      });
    });
  }
}