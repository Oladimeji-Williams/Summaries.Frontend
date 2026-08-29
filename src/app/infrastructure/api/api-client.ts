import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(
    url: string,
    params?: HttpParams,
  ): Observable<T> {
    return this.http.get<T>(url, {
      params,
    });
  }

  post<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<TResponse> {
    return this.http.post<TResponse>(
      url,
      body,
    );
  }

  put<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<TResponse> {
    return this.http.put<TResponse>(
      url,
      body,
    );
  }

  patch<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(
      url,
      body,
    );
  }

  delete<T = void>(
    url: string,
  ): Observable<T> {
    return this.http.delete<T>(url);
  }

  postFormData<TResponse>(url: string, formData: FormData): Observable<TResponse> {
    return this.http.post<TResponse>(url, formData);
  }
}