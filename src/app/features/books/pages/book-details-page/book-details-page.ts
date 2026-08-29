import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BookStatus, bookStatusLabel } from '../../models';
import { RatingBar } from '../../components/rating-bar/rating-bar';

@Component({
  selector: 'app-book-details-page',
  imports: [RouterLink, DatePipe, RatingBar],
  templateUrl: './book-details-page.html',
  styleUrl: './book-details-page.scss',
})
export class BookDetailsPage {
  private readonly store = inject(BooksStore);
  protected readonly auth = inject(AuthStore);
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