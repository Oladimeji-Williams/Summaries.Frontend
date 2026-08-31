import { BookStatus } from './book-status.model';

export interface ReadingStatus {
  readonly status: BookStatus;
  readonly rating: number | null;
  readonly dateStarted: string | null;
  readonly dateRead: string | null;
}

export interface Book {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly publishedYear: number | null;
  readonly genre: string | null;
  readonly pageCount: number | null;
  readonly myReadingStatus: ReadingStatus | null;
}