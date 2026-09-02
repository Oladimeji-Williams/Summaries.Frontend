import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BookStatus, bookStatusClass, bookStatusLabel } from '../../models';
import { RatingBar } from '../../components/rating-bar/rating-bar';
import { DeleteBookButton } from '../../components/delete-book-button/delete-book-button';

@Component({
  selector: 'app-book-details-page',
  imports: [RouterLink, DatePipe, RatingBar, DeleteBookButton],
  templateUrl: './book-details-page.html',
  styleUrl: './book-details-page.scss',
})
export class BookDetailsPage {
  private readonly store = inject(BooksStore);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly book = this.store.selectedBook;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly bookStatusClass = bookStatusClass;

  constructor() {
    effect(() => {
      this.store.viewBook(this.id());
    });
  }

  protected canEdit(): boolean {
    const status = this.book()?.myReadingStatus?.status ?? BookStatus.NotStarted;
    return this.auth.isAdmin() || status !== BookStatus.Read;
  }

  onDeleted(): void {
    void this.router.navigateByUrl('/books');
  }
}