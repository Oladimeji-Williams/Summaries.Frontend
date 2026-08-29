import { BookStatus } from '../../../features/books/models';

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly createdAtUtc: string;
}

export interface BookReadingEntry {
  readonly bookId: number;
  readonly title: string;
  readonly author: string;
  readonly status: BookStatus;
  readonly rating: number | null;
  readonly dateStarted: string | null;
  readonly dateRead: string | null;
}

export interface UserReadingHistory {
  readonly userId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly books: readonly BookReadingEntry[];
}

export interface ReaderEntry {
  readonly userId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: BookStatus;
  readonly rating: number | null;
  readonly dateStarted: string | null;
  readonly dateRead: string | null;
}

export interface BookReaders {
  readonly bookId: number;
  readonly title: string;
  readonly author: string;
  readonly readers: readonly ReaderEntry[];
}