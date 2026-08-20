import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookStatus } from '../../models/book-status.model';
import { bookStatusLabel } from '../../models/book-status.util';

@Component({
  selector: 'app-book-details-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './book-details-page.html',
  styleUrl: './book-details-page.scss',
})
export class BookDetailsPage {
  private readonly store = inject(BooksStore);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = this.store.selectedBook;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;

  constructor() {
    effect(() => {
      this.store.viewBook(this.id());
    });
  }
}