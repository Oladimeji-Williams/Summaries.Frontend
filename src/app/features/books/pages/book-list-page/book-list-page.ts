import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookStatus } from '../../models/book-status.model';
import { bookStatusLabel } from '../../models/book-status.util';

type BookViewMode = 'grid' | 'table';

@Component({
  selector: 'app-book-list-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './book-list-page.html',
  styleUrl: './book-list-page.scss',
})
export class BookListPage implements OnInit {
  readonly state = inject(BooksStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly viewModeStorageKey = 'summaries.books.view-mode';

  protected readonly BookStatus = BookStatus;
  protected readonly bookStatusLabel = bookStatusLabel;

  readonly viewMode = signal<BookViewMode>(this.getInitialViewMode());

  ngOnInit(): void {
    this.state.load();
  }

  setViewMode(mode: BookViewMode): void {
    this.viewMode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.viewModeStorageKey, mode);
    }
  }

  private getInitialViewMode(): BookViewMode {
    if (!isPlatformBrowser(this.platformId)) return 'grid';
    const stored = localStorage.getItem(this.viewModeStorageKey);
    return stored === 'table' ? 'table' : 'grid';
  }
}