import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../../../infrastructure/api/api-client';
import { API_CONFIG } from '../../../core/config/api-config';
import { ApiResponse } from '../../../infrastructure/api/api-response';
import { Book } from '../models/book.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';
import { BookApiResponse, mapBookResponse } from '../mappings/book.mapper';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private readonly api = inject(ApiClient);
  private readonly config = inject(API_CONFIG);
  private readonly endpoint = `${this.config.baseUrl}/v1/books`;

  getAll(): Observable<readonly Book[]> {
    return this.api
      .get<ApiResponse<readonly BookApiResponse[]>>(this.endpoint)
      .pipe(map((response) => response.data.map(mapBookResponse)));
  }

  getById(id: number): Observable<Book> {
    return this.api
      .get<ApiResponse<BookApiResponse>>(`${this.endpoint}/${id}`)
      .pipe(map((response) => mapBookResponse(response.data)));
  }

  create(request: CreateBook): Observable<Book> {
    return this.api
      .post<CreateBook, ApiResponse<BookApiResponse>>(this.endpoint, request)
      .pipe(map((response) => mapBookResponse(response.data)));
  }

  update(id: number, request: UpdateBook): Observable<void> {
    return this.api.put<UpdateBook, void>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  startReading(id: number): Observable<void> {
    return this.api.post<void, void>(`${this.endpoint}/${id}/start-reading`, undefined);
  }

  markAsRead(id: number): Observable<void> {
    return this.api.post<void, void>(`${this.endpoint}/${id}/mark-as-read`, undefined);
  }
}