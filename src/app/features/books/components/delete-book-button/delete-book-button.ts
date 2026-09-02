import { Component, inject, input, output, signal } from '@angular/core';
import { BooksStore } from '../../state/books.store';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-delete-book-button',
  imports: [ConfirmDialog],
  templateUrl: './delete-book-button.html',
  styleUrl: './delete-book-button.scss',
})
export class DeleteBookButton {
  readonly bookId = input.required<number>();
  readonly small = input(false);
  readonly deleted = output<void>();

  private readonly store = inject(BooksStore);
  private readonly notifications = inject(NotificationService);

  protected readonly showConfirm = signal(false);
  protected readonly deleting = signal(false);

  requestDelete(): void {
    this.showConfirm.set(true);
  }

  cancel(): void {
    this.showConfirm.set(false);
  }

  async confirmDelete(): Promise<void> {
    this.deleting.set(true);
    const success = await this.store.delete(this.bookId());
    this.deleting.set(false);
    this.showConfirm.set(false);

    if (success) {
      this.notifications.success('Book deleted successfully.');
      this.deleted.emit();
    } else {
      this.notifications.error('Unable to delete book.');
    }
  }
}