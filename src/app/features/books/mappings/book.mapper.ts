import { Book, ReadingStatus } from '../models/book.model';
import { BookStatus } from '../models/book-status.model';

export interface ReadingStatusApiResponse {
  status: BookStatus | number;
  rating: number | null;
  dateStarted: string | null;
  dateRead: string | null;
}

export interface BookApiResponse {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
  genre: string | null;
  pageCount: number | null;
  myReadingStatus: ReadingStatusApiResponse | null;
}

const STATUS_BY_ORDINAL: Record<number, BookStatus> = {
  0: BookStatus.NotStarted,
  1: BookStatus.InProgress,
  2: BookStatus.Read,
};

function mapStatus(status: BookStatus | number): BookStatus {
  return typeof status === 'number'
    ? (STATUS_BY_ORDINAL[status] ?? BookStatus.NotStarted)
    : status;
}

function mapReadingStatus(response: ReadingStatusApiResponse | null): ReadingStatus | null {
  if (!response) return null;
  return {
    status: mapStatus(response.status),
    rating: response.rating,
    dateStarted: response.dateStarted,
    dateRead: response.dateRead,
  };
}

export function mapBookResponse(response: BookApiResponse): Book {
  return {
    id: response.id,
    title: response.title,
    author: response.author,
    description: response.description,
    isbn: response.isbn,
    publisher: response.publisher,
    publishedYear: response.publishedYear,
    genre: response.genre,
    pageCount: response.pageCount,
    myReadingStatus: mapReadingStatus(response.myReadingStatus),
  };
}