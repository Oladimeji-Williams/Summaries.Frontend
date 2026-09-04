import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BookViewMode } from '../../models';
import { BookGrid } from '../../components/book-grid/book-grid';
import { BookTable } from '../../components/book-table/book-table';
import { BookTableSkeleton } from '../../components/book-table-skeleton/book-table-skeleton';

@Component({
  selector: 'app-book-list-page',
  imports: [RouterLink, BookGrid, BookTable, BookTableSkeleton],
  templateUrl: './book-list-page.html',
  styleUrl: './book-list-page.scss',
})
export class BookListPage implements OnInit {
  readonly state = inject(BooksStore);
  protected readonly auth = inject(AuthStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly viewModeStorageKey = 'summaries.books.view-mode';

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