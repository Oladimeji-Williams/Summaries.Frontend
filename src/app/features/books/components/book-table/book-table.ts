import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book, BookStatus, bookStatusLabel } from '../../models';

@Component({
  selector: 'app-book-table',
  imports: [RouterLink, DatePipe],
  templateUrl: './book-table.html',
  styleUrl: './book-table.scss',
})
export class BookTable {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;
}