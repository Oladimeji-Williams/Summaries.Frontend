import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book, BookStatus } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { DeleteBookButton } from '../delete-book-button/delete-book-button';

@Component({
  selector: 'app-book-grid',
  imports: [RouterLink, DeleteBookButton],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
})
export class BookGrid {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly auth = inject(AuthStore);

  protected canEdit(book: Book): boolean {
    return this.auth.isAdmin() || (book.myReadingStatus?.status ?? BookStatus.NotStarted) !== BookStatus.Read;
  }
}