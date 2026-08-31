import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookForm } from '../../components/book-form/book-form';
import { BookFormValue, BookStatus } from '../../models';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-edit-book-page',
  imports: [BookForm, RouterLink],
  templateUrl: './edit-book-page.html',
  styleUrl: './edit-book-page.scss',
})
export class EditBookPage {
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly store = inject(BooksStore);
  protected readonly BookStatus = BookStatus;

  readonly id = input.required({ transform: numberAttribute });

  protected readonly currentStatus = computed<BookStatus>(
    () => this.store.selectedBook()?.myReadingStatus?.status ?? BookStatus.NotStarted,
  );

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

    if (value.status === BookStatus.Read) {
      await this.store.markAsRead(this.id(), value.rating ?? null);
    }

    this.notifications.success('Book updated successfully.');
    void this.router.navigate(['/books', this.id()]);
  }
}