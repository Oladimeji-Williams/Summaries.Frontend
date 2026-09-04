import { Component, input } from '@angular/core';

@Component({
  selector: 'app-book-table-skeleton',
  imports: [],
  templateUrl: './book-table-skeleton.html',
  styleUrl: './book-table-skeleton.scss',
})
export class BookTableSkeleton {
  readonly rows = input(5);
}