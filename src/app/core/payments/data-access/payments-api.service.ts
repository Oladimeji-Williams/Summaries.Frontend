import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../../../infrastructure/api/api-client';
import { API_CONFIG } from '../../config/api-config';
import { ApiResponse } from '../../../infrastructure/api/api-response';

@Injectable({ providedIn: 'root' })
export class PaymentsApiService {
  private readonly api = inject(ApiClient);
  private readonly config = inject(API_CONFIG);
  private readonly endpoint = `${this.config.baseUrl}/v1/payments`;

  verify(reference: string): Observable<boolean> {
    return this.api
      .get<ApiResponse<boolean>>(`${this.endpoint}/verify/${reference}`)
      .pipe(map((response) => response.data));
  }
}