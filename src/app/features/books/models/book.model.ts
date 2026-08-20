import { BookStatus } from './book-status.model';

export interface Book {
  readonly id: number;
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly rating: number | null;
  readonly dateStarted: string | null;
  readonly dateRead: string | null;
  readonly status: BookStatus;
}