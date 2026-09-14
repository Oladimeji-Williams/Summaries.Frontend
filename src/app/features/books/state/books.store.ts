import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity, removeEntity, upsertEntity } from '@ngrx/signals/entities';
import { firstValueFrom } from 'rxjs';

import { BooksApiService } from '../data-access/books-api.service';
import { Book } from '../models/book.model';
import { BookStatus } from '../models/book-status.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';
import { getApiErrorMessage } from '../../../infrastructure/api/api-error.util';
import { withRequestStatus } from '../../../core/state/with-request-status.feature';

type BooksState = {
  selectedId: number | null;
};

const initialState: BooksState = { selectedId: null };

export const BooksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withRequestStatus(),
  withEntities<Book>(),
  withComputed(({ entities, selectedId }) => ({
    books: computed(() => entities()),
    hasBooks: computed(() => entities().length > 0),
    selectedBook: computed(() => entities().find((b) => b.id === selectedId()) ?? null),
  })),
  withMethods((store, booksApi = inject(BooksApiService)) => ({
    async load(): Promise<void> {
      store.setPending();
      try {
        const books = await firstValueFrom(booksApi.getAll());
        patchState(store, setAllEntities([...books]));
        store.setFulfilled();
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to load books.'));
      }
    },

    /** Plain fetch — edit page, delete-confirmation page. No side effects. */
    async loadBook(id: number): Promise<void> {
      patchState(store, { selectedId: id });
      store.setPending();
      try {
        const book = await firstValueFrom(booksApi.getById(id));
        patchState(store, upsertEntity(book));
        store.setFulfilled();
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to load the book.'));
      }
    },

    /** Details page only — viewing an unstarted book starts it. */
    async viewBook(id: number): Promise<void> {
      patchState(store, { selectedId: id });
      store.setPending();
      try {
        let book = await firstValueFrom(booksApi.getById(id));
        const status = book.myReadingStatus?.status ?? BookStatus.NotStarted;
        if (status === BookStatus.NotStarted) {
          await firstValueFrom(booksApi.startReading(id));
          book = await firstValueFrom(booksApi.getById(id));
        }
        patchState(store, upsertEntity(book));
        store.setFulfilled();
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to load the book.'));
      }
    },

    async create(request: CreateBook): Promise<Book | null> {
      store.setPending();
      try {
        const book = await firstValueFrom(booksApi.create(request));
        patchState(store, upsertEntity(book));
        store.setFulfilled();
        return book;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to create book.'));
        return null;
      }
    },

    async update(id: number, request: UpdateBook): Promise<boolean> {
      store.setPending();
      try {
        await firstValueFrom(booksApi.update(id, request));
        const book = await firstValueFrom(booksApi.getById(id));
        patchState(store, upsertEntity(book));
        store.setFulfilled();
        return true;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to update book.'));
        return false;
      }
    },

    async delete(id: number): Promise<boolean> {
      store.setPending();
      try {
        await firstValueFrom(booksApi.delete(id));
        patchState(store, removeEntity(id));
        if (store.selectedId() === id) {
          patchState(store, { selectedId: null });
        }
        store.setFulfilled();
        return true;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to delete book.'));
        return false;
      }
    },

    async markAsRead(id: number, rating: number | null): Promise<boolean> {
      store.setPending();
      try {
        await firstValueFrom(booksApi.markAsRead(id, { rating }));
        const book = await firstValueFrom(booksApi.getById(id));
        patchState(store, upsertEntity(book));
        store.setFulfilled();
        return true;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to mark as read.'));
        return false;
      }
    },

    async purchaseBook(id: number): Promise<string | null> {
      store.setPending();
      try {
        const result = await firstValueFrom(booksApi.purchase(id));
        store.setFulfilled();
        return result.authorizationUrl;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to start purchase.'));
        return null;
      }
    },

    async downloadBook(id: number): Promise<string | null> {
      store.setPending();
      try {
        const url = await firstValueFrom(booksApi.getDownloadUrl(id));
        store.setFulfilled();
        return url;
      } catch (err) {
        store.setError(getApiErrorMessage(err, 'Unable to download book.'));
        return null;
      }
    },

    /**
     * Price and PDF changes go through the store too, so the cached entity never goes
     * stale. Errors are left to propagate — callers (e.g. the book form) show their own
     * field-level error messages rather than the store's shared request status.
     */
    async updatePrice(id: number, priceKobo: number | null): Promise<void> {
      await firstValueFrom(booksApi.updatePrice(id, priceKobo));
      const book = await firstValueFrom(booksApi.getById(id));
      patchState(store, upsertEntity(book));
    },

    async uploadPdf(id: number, file: File): Promise<void> {
      await firstValueFrom(booksApi.uploadPdf(id, file));
      const book = await firstValueFrom(booksApi.getById(id));
      patchState(store, upsertEntity(book));
    },
  })),
);
