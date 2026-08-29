import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book, BookStatus, bookStatusLabel } from '../../models';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { RatingBar } from '../rating-bar/rating-bar';

@Component({
  selector: 'app-book-table',
  imports: [RouterLink, DatePipe, RatingBar],
  templateUrl: './book-table.html',
  styleUrl: './book-table.scss',
})
export class BookTable {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
  protected readonly auth = inject(AuthStore);
}