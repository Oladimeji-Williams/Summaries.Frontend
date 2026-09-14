import { Book } from './book.model';
import { BookStatus } from './book-status.model';

/**
 * Book access/permission rules shared by every surface that lists or views
 * a book (grid, table, details page). Keeping this in one place means the
 * pricing/ownership/edit rules only need to change once.
 */

export function canEditBook(book: Book, isAdmin: boolean): boolean {
  return isAdmin || (book.myReadingStatus?.status ?? BookStatus.NotStarted) !== BookStatus.Read;
}

export function canDownloadBook(book: Book, isAdmin: boolean): boolean {
  if (!book.hasPdf) return false;
  return book.priceKobo === null || book.isPurchased || isAdmin;
}

export function bookAccessClass(book: Book, isAdmin: boolean): string {
  if (book.priceKobo === null) return 'access-free';
  if (book.isPurchased || isAdmin) return 'access-owned';
  return 'access-buy';
}

export function bookAccessLabel(book: Book, isAdmin: boolean): string | null {
  if (!book.hasPdf) return null;
  if (book.priceKobo === null) return 'Free';
  if (book.isPurchased || isAdmin) return 'Owned';
  return formatNaira(book.priceKobo);
}

export function formatNaira(priceKobo: number): string {
  return `₦${(priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
