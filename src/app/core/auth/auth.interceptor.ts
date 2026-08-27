import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from './state/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.accessToken();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && auth.refreshToken()) {
        return from(auth.refreshSession()).pipe(
          switchMap((refreshed) => {
            if (!refreshed) return throwError(() => err);
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.accessToken()}` },
            });
            return next(retried);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};