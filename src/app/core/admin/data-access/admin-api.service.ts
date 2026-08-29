import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from '../../../infrastructure/api/api-client';
import { API_CONFIG } from '../../config/api-config';
import { ApiResponse } from '../../../infrastructure/api/api-response';
import { AdminUser, BookReaders, UserReadingHistory } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiClient);
  private readonly config = inject(API_CONFIG);
  private readonly endpoint = `${this.config.baseUrl}/v1/admin`;

  getAllUsers(): Observable<readonly AdminUser[]> {
    return this.api
      .get<ApiResponse<readonly AdminUser[]>>(`${this.endpoint}/users`)
      .pipe(map((r) => r.data));
  }

  getUserReadingHistory(userId: string): Observable<UserReadingHistory> {
    return this.api
      .get<ApiResponse<UserReadingHistory>>(`${this.endpoint}/users/${userId}/reading-history`)
      .pipe(map((r) => r.data));
  }

  getBookReaders(bookId: number): Observable<BookReaders> {
    return this.api
      .get<ApiResponse<BookReaders>>(`${this.endpoint}/books/${bookId}/readers`)
      .pipe(map((r) => r.data));
  }
}