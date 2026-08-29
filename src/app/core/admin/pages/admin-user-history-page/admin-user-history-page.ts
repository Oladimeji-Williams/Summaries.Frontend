import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../data-access/admin-api.service';
import { UserReadingHistory } from '../../models/admin.model';
import { bookStatusLabel } from '../../../../features/books/models';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-admin-user-history-page',
  imports: [DatePipe],
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

  constructor() {
    effect(() => {
      const id = this.userId();
      this.loading.set(true);
      this.error.set(null);
      this.adminApi.getUserReadingHistory(id).subscribe({
        next: (h) => { this.history.set(h); this.loading.set(false); },
        error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load reading history.')); this.loading.set(false); },
      });
    });
  }
}