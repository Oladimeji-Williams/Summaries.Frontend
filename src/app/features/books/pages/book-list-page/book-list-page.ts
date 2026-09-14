import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { AuthStore } from '../../../../core/auth/state/auth.store';
import { BookViewMode } from '../../models';
import { BookGrid } from '../../components/book-grid/book-grid';
import { BookTable } from '../../components/book-table/book-table';
import { BookTableSkeleton } from '../../components/book-table-skeleton/book-table-skeleton';
import { LocalStorageService } from '../../../../infrastructure/storage/local-storage.service';

const VIEW_MODE_STORAGE_KEY = 'summaries.books.view-mode';

@Component({
  selector: 'app-book-list-page',
  imports: [RouterLink, BookGrid, BookTable, BookTableSkeleton],
  templateUrl: './book-list-page.html',
  styleUrl: './book-list-page.scss',
})
export class BookListPage implements OnInit {
  readonly state = inject(BooksStore);
  protected readonly auth = inject(AuthStore);
  private readonly storage = inject(LocalStorageService);

  readonly viewMode = signal<BookViewMode>(this.getInitialViewMode());

  ngOnInit(): void {
    this.state.load();
  }

  setViewMode(mode: BookViewMode): void {
    this.viewMode.set(mode);
    this.storage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }

  private getInitialViewMode(): BookViewMode {
    const stored = this.storage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'table' ? 'table' : 'grid';
  }
}