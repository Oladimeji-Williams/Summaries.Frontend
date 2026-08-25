import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookForm } from '../../components/book-form/book-form';
import { BookFormValue, BookStatus } from '../../models';

@Component({
  selector: 'app-edit-book-page',
  imports: [BookForm, RouterLink],
  templateUrl: './edit-book-page.html',
  styleUrl: './edit-book-page.scss',
})
export class EditBookPage {
  private readonly router = inject(Router);
  protected readonly store = inject(BooksStore);
  protected readonly BookStatus = BookStatus;

  readonly id = input.required({ transform: numberAttribute });

  protected readonly initialValue = computed<BookFormValue | null>(() => {
    const book = this.store.selectedBook();
    return book
      ? { title: book.title, author: book.author, description: book.description, rating: book.rating }
      : null;
  });

  constructor() {
    effect(() => {
      this.store.loadBook(this.id());
    });
  }

  async onSave(value: BookFormValue): Promise<void> {
    const book = this.store.selectedBook();
    if (!book) return;

    const success = await this.store.update(this.id(), {
      title: value.title,
      author: value.author,
      description: value.description,
      rating: value.rating,
    });
    if (!success) return;

    if (value.status === BookStatus.Read && book.status !== BookStatus.Read) {
      await this.store.markAsRead(this.id());
    }

    void this.router.navigate(['/books', this.id()]);
  }
}