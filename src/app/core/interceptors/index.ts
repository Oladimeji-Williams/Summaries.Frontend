import { HttpInterceptorFn } from '@angular/common/http';

import { errorInterceptor } from './error.interceptor';

export const httpInterceptors: HttpInterceptorFn[] = [
  errorInterceptor,
];