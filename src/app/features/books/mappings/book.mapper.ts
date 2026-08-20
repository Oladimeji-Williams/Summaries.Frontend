import { Book } from '../models/book.model';
import { BookStatus } from '../models/book-status.model';

export interface BookApiResponse {
  id: number;
  title: string;
  author: string;
  description: string;
  rating: number | null;
  dateStarted: string | null;
  dateRead: string | null;
  status: BookStatus | number;
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

export function mapBookResponse(response: BookApiResponse): Book {
  return {
    id: response.id,
    title: response.title,
    author: response.author,
    description: response.description,
    rating: response.rating,
    dateStarted: response.dateStarted,
    dateRead: response.dateRead,
    status: mapStatus(response.status),
  };
}