import { BookStatus } from './book-status.model';

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  [BookStatus.NotStarted]: 'Not started',
  [BookStatus.InProgress]: 'In progress',
  [BookStatus.Read]: 'Read',
};

export function bookStatusLabel(status: BookStatus): string {
  return BOOK_STATUS_LABELS[status];
}