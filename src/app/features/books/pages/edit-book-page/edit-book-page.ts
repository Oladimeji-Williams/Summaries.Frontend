import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookForm } from '../../components/book-form/book-form';
import { BookFormValue, BookStatus } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Spinner } from "../../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-edit-book-page',
  imports: [BookForm, RouterLink, Spinner],
  templateUrl: './edit-book-page.html',
  styleUrl: './edit-book-page.scss',
})
export class EditBookPage {
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly store = inject(BooksStore);
  protected readonly auth = inject(AuthStore);
  protected readonly BookStatus = BookStatus;

  readonly id = input.required({ transform: numberAttribute });

  protected readonly currentStatus = computed<BookStatus>(
    () => this.store.selectedBook()?.myReadingStatus?.status ?? BookStatus.NotStarted,
  );

  /** Non-admins lose all access once Read; admins always keep metadata access. */
  protected readonly locked = computed(
    () => this.currentStatus() === BookStatus.Read && !this.auth.isAdmin(),
  );

  /** Status can be moved forward by anyone, but only before it reaches Read. */
  protected readonly statusEditable = computed(
    () => this.currentStatus() === BookStatus.InProgress,
  );

  protected readonly metadataEditable = computed(() => this.auth.isAdmin());

  protected readonly initialValue = computed<BookFormValue | null>(() => {
    const book = this.store.selectedBook();
    return book
      ? {
          title: book.title,
          author: book.author,
          description: book.description,
          isbn: book.isbn,
          publisher: book.publisher,
          publishedYear: book.publishedYear,
          genre: book.genre,
          pageCount: book.pageCount,
        }
      : null;
  });

  constructor() {
    effect(() => {
      this.store.loadBook(this.id());
    });
  }

  async onSave(value: BookFormValue): Promise<void> {
    if (this.metadataEditable()) {
      const success = await this.store.update(this.id(), {
        title: value.title,
        author: value.author,
        description: value.description,
        isbn: value.isbn,
        publisher: value.publisher,
        publishedYear: value.publishedYear,
        genre: value.genre,
        pageCount: value.pageCount,
      });
      if (!success) return;
    }

    if (this.statusEditable() && value.status === BookStatus.Read) {
      await this.store.markAsRead(this.id(), value.rating ?? null);
    }

    this.notifications.success(
      this.metadataEditable() ? 'Book updated successfully.' : 'Reading status updated.',
    );
    void this.router.navigate(['/books', this.id()]);
  }
}