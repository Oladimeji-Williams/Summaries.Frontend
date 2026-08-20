import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';

@Component({
  selector: 'app-delete-book-page',
  imports: [RouterLink],
  templateUrl: './delete-book-page.html',
  styleUrl: './delete-book-page.scss',
})
export class DeleteBookPage {
  private readonly router = inject(Router);
  protected readonly store = inject(BooksStore);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = this.store.selectedBook;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;

  constructor() {
    effect(() => {
      this.store.loadBook(this.id());
    });
  }

  async deleteBook(): Promise<void> {
    const book = this.book();
    if (!book) return;
    const success = await this.store.delete(book.id);
    if (success) {
      void this.router.navigate(['/books']);
    }
  }

  cancel(): void {
    void this.router.navigate(['/books', this.id()]);
  }
}