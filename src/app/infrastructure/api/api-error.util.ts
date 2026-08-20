import { HttpErrorResponse } from '@angular/common/http';

export interface ApiValidationError {
  readonly code?: string;
  readonly message: string;
  readonly type?: string;
}

export interface ApiProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly errors?: Record<
    string,
    readonly string[]
  >;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error &&
    typeof error === 'object' &&
    'error' in error
  ) {
    const response = error as {
      error?: {
        errors?: readonly {
          code?: string;
          message: string;
        }[] | null;

        title?: string;
        message?: string;
      };
    };

    const firstError =
      response.error?.errors?.[0]?.message;

    return (
      firstError ??
      response.error?.message ??
      response.error?.title ??
      fallback
    );
  }

  return fallback;
}