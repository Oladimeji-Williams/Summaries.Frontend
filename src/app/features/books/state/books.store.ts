import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  updateEntity,
  removeEntity,
  upsertEntity,
} from '@ngrx/signals/entities';
import { firstValueFrom } from 'rxjs';

import { BooksApiService } from '../data-access/books-api.service';
import { Book } from '../models/book.model';
import { BookStatus } from '../models/book-status.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';
import { getApiErrorMessage } from '../../../infrastructure/api/api-error.util';

type BooksState = {
  loading: boolean;
  error: string | null;
  selectedId: number | null;
};

const initialState: BooksState = {
  loading: false,
  error: null,
  selectedId: null,
};

export const BooksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Book>(),
  withComputed(({ entities, selectedId }) => ({
    books: computed(() => entities()),
    hasBooks: computed(() => entities().length > 0),
    selectedBook: computed(() => entities().find((b) => b.id === selectedId()) ?? null),
  })),
  withMethods((store, booksApi = inject(BooksApiService)) => ({
    /** List page. */
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const books = await firstValueFrom(booksApi.getAll());
        patchState(store, setAllEntities([...books]), { loading: false });
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to load books.'),
          loading: false,
        });
      }
    },

    /** Plain fetch — edit page, delete-confirmation page. No side effects. */
    async loadBook(id: number): Promise<void> {
      patchState(store, { loading: true, error: null, selectedId: id });
      try {
        const book = await firstValueFrom(booksApi.getById(id));
        patchState(store, upsertEntity(book), { loading: false });
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to load the book.'),
          loading: false,
        });
      }
    },

    /** Details page only — viewing an unstarted book starts it. This is a
     *  domain rule, so it lives here rather than in the component. */
    async viewBook(id: number): Promise<void> {
      patchState(store, { loading: true, error: null, selectedId: id });
      try {
        let book = await firstValueFrom(booksApi.getById(id));
        if (book.status === BookStatus.NotStarted) {
          await firstValueFrom(booksApi.startReading(id));
          book = await firstValueFrom(booksApi.getById(id));
        }
        patchState(store, upsertEntity(book), { loading: false });
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to load the book.'),
          loading: false,
        });
      }
    },

    async create(request: CreateBook): Promise<Book | null> {
      patchState(store, { loading: true, error: null });
      try {
        const book = await firstValueFrom(booksApi.create(request));
        patchState(store, upsertEntity(book), { loading: false });
        return book;
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to create book.'),
          loading: false,
        });
        return null;
      }
    },

    async update(id: number, request: UpdateBook): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(booksApi.update(id, request));
        patchState(store, updateEntity({ id, changes: request }), { loading: false });
        return true;
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to update book.'),
          loading: false,
        });
        return false;
      }
    },

    async delete(id: number): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(booksApi.delete(id));
        patchState(store, removeEntity(id), { loading: false });
        if (store.selectedId() === id) {
          patchState(store, { selectedId: null });
        }
        return true;
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to delete book.'),
          loading: false,
        });
        return false;
      }
    },

    async markAsRead(id: number): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(booksApi.markAsRead(id));
        const book = await firstValueFrom(booksApi.getById(id));
        patchState(store, upsertEntity(book), { loading: false });
        return true;
      } catch (err) {
        patchState(store, {
          error: getApiErrorMessage(err, 'Unable to mark as read.'),
          loading: false,
        });
        return false;
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);