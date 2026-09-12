import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../../../infrastructure/api/api-client';
import { API_CONFIG } from '../../../core/config/api-config';
import { ApiResponse } from '../../../infrastructure/api/api-response';
import { Book } from '../models/book.model';
import { CreateBook } from '../models/create-book.model';
import { UpdateBook } from '../models/update-book.model';
import { MarkAsReadRequest } from '../models/mark-as-read.model';
import { BookApiResponse, mapBookResponse } from '../mappings/book.mapper';

export interface InitiatePurchaseResult {
  authorizationUrl: string;
  reference: string;
}

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

  markAsRead(id: number, request: MarkAsReadRequest): Observable<void> {
    return this.api.post<MarkAsReadRequest, void>(`${this.endpoint}/${id}/mark-as-read`, request);
  }

  purchase(id: number): Observable<InitiatePurchaseResult> {
    return this.api
      .post<void, ApiResponse<InitiatePurchaseResult>>(`${this.endpoint}/${id}/purchase`, undefined)
      .pipe(map((response) => response.data));
  }

  getDownloadUrl(id: number): Observable<string> {
    return this.api
      .get<ApiResponse<string>>(`${this.endpoint}/${id}/download`)
      .pipe(map((response) => response.data));
  }

  updatePrice(id: number, priceKobo: number | null): Observable<void> {
    return this.api.put<{ priceKobo: number | null }, void>(`${this.endpoint}/${id}/price`, { priceKobo });
  }

  uploadPdf(id: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<void>(`${this.endpoint}/${id}/pdf`, formData);
  }
}