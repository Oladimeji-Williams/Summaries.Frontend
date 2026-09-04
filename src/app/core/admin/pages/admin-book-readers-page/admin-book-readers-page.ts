import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../data-access/admin-api.service';
import { BookReaders, ReaderEntry } from '../../models/admin.model';
import { bookStatusLabel } from '../../../../features/books/models';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { formatReadingDuration } from '../../utils/reading-duration.util';
import { TableState, ColumnDef } from '../../../../shared/table/table-state';
import { ColumnFilter } from '../../../../shared/components/column-filter/column-filter';
import { SortIndicator } from '../../../../shared/components/sort-indicator/sort-indicator';
import { Spinner } from "../../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-admin-book-readers-page',
  imports: [DatePipe, ColumnFilter, SortIndicator, Spinner],
  templateUrl: './admin-book-readers-page.html',
  styleUrl: './admin-book-readers-page.scss',
})
export class AdminBookReadersPage {
  private readonly adminApi = inject(AdminApiService);

  readonly bookId = input.required({ transform: numberAttribute });

  protected readonly readers = signal<BookReaders | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly formatReadingDuration = formatReadingDuration;

  private readonly rows = signal<readonly ReaderEntry[]>([]);

  private dateLabel(d: string | null): string {
    return d ? new Date(d).toLocaleString() : 'Not set';
  }

  private readonly columns: ColumnDef<ReaderEntry>[] = [
    { key: 'name', label: 'Reader', value: (r) => `${r.firstName} ${r.lastName}`, sortable: true, filterable: true },
    { key: 'email', label: 'Email', value: (r) => r.email, sortable: true, filterable: true },
    { key: 'status', label: 'Status', value: (r) => bookStatusLabel(r.status), sortable: true, filterable: true },
    {
      key: 'rating', label: 'Rating', sortable: true, filterable: true,
      value: (r) => r.rating != null ? `${r.rating}` : '—',
      sortValue: (r) => r.rating ?? -1,
    },
    {
      key: 'started', label: 'Started', sortable: true, filterable: true,
      value: (r) => this.dateLabel(r.dateStarted),
      sortValue: (r) => r.dateStarted ? new Date(r.dateStarted).getTime() : -1,
    },
    {
      key: 'read', label: 'Read', sortable: true, filterable: true,
      value: (r) => this.dateLabel(r.dateRead),
      sortValue: (r) => r.dateRead ? new Date(r.dateRead).getTime() : -1,
    },
    {
      key: 'duration', label: 'Reading time', sortable: true, filterable: true,
      value: (r) => formatReadingDuration(r.readingDurationHours),
      sortValue: (r) => r.readingDurationHours ?? -1,
    },
  ];

  protected readonly table = new TableState(this.rows, this.columns);

  constructor() {
    effect(() => {
      const id = this.bookId();
      this.loading.set(true);
      this.error.set(null);
      this.adminApi.getBookReaders(id).subscribe({
        next: (r) => {
          this.readers.set(r);
          this.rows.set(r.readers);
          this.loading.set(false);
        },
        error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load readers.')); this.loading.set(false); },
      });
    });
  }
}