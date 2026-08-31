import { BookStatus } from './book-status.model';

export interface BookFormValue {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly publishedYear: number | null;
  readonly genre: string | null;
  readonly pageCount: number | null;
  readonly status?: BookStatus;
  readonly rating?: number | null;
}