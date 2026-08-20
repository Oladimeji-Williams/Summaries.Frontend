import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookForm, BookFormValue } from '../../components/book-form/book-form';

@Component({
  selector: 'app-create-book-page',
  imports: [BookForm, RouterLink],
  templateUrl: './create-book-page.html',
  styleUrl: './create-book-page.scss',
})
export class CreateBookPage {
  private readonly router = inject(Router);
  protected readonly store = inject(BooksStore);

  async onSave(value: BookFormValue): Promise<void> {
    const book = await this.store.create(value);
    if (book) {
      void this.router.navigate(['/books', book.id]);
    }
  }
}