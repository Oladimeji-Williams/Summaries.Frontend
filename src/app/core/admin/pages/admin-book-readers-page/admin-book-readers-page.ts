import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../data-access/admin-api.service';
import { BookReaders } from '../../models/admin.model';
import { bookStatusLabel } from '../../../../features/books/models';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-admin-book-readers-page',
  imports: [DatePipe],
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

  constructor() {
    effect(() => {
      const id = this.bookId();
      this.loading.set(true);
      this.error.set(null);
      this.adminApi.getBookReaders(id).subscribe({
        next: (r) => { this.readers.set(r); this.loading.set(false); },
        error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load readers.')); this.loading.set(false); },
      });
    });
  }
}