import { BookStatus } from './book-status.model';

export interface BookFormValue {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly rating: number | null;
  readonly status?: BookStatus;
}