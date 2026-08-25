import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book, BookStatus } from '../../models';

@Component({
  selector: 'app-book-grid',
  imports: [RouterLink],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
})
export class BookGrid {
  readonly books = input.required<readonly Book[]>();
  protected readonly BookStatus = BookStatus;
}