import { BookStatus } from './book-status.model';

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  [BookStatus.NotStarted]: 'Not started',
  [BookStatus.InProgress]: 'In progress',
  [BookStatus.Read]: 'Read',
};

export function bookStatusLabel(status: BookStatus): string {
  return BOOK_STATUS_LABELS[status];
}

const BOOK_STATUS_CLASSES: Record<BookStatus, string> = {
  [BookStatus.NotStarted]: 'status-not-started',
  [BookStatus.InProgress]: 'status-in-progress',
  [BookStatus.Read]: 'status-read',
};

export function bookStatusClass(status: BookStatus): string {
  return BOOK_STATUS_CLASSES[status];
}