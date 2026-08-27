import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from '../../../infrastructure/api/api-client';
import { API_CONFIG } from '../../config/api-config';
import { ApiResponse } from '../../../infrastructure/api/api-response';
import { AuthResult, LoginRequest, RegisterRequest, UserProfile } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClient);
  private readonly config = inject(API_CONFIG);
  private readonly endpoint = `${this.config.baseUrl}/v1/auth`;

  register(request: RegisterRequest): Observable<string> {
    return this.api
      .post<RegisterRequest, ApiResponse<string>>(`${this.endpoint}/register`, request)
      .pipe(map((r) => r.data));
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.api
      .post<LoginRequest, ApiResponse<AuthResult>>(`${this.endpoint}/login`, request)
      .pipe(map((r) => r.data));
  }

  refresh(refreshToken: string): Observable<AuthResult> {
    return this.api
      .post<{ refreshToken: string }, ApiResponse<AuthResult>>(`${this.endpoint}/refresh`, { refreshToken })
      .pipe(map((r) => r.data));
  }

  revoke(refreshToken: string): Observable<void> {
    return this.api.post<{ refreshToken: string }, void>(`${this.endpoint}/revoke`, { refreshToken });
  }

  getProfile(): Observable<UserProfile> {
    return this.api
      .get<ApiResponse<UserProfile>>(`${this.config.baseUrl}/v1/users/me`)
      .pipe(map((r) => r.data));
  }
}