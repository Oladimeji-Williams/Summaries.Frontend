export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly errors: readonly ApiError[] | null;
}

export interface ApiError {
  readonly code?: string;
  readonly message: string;
}