/** Envelope returned by every OneEngine API endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/** Normalised error thrown by the API client so UI code never handles raw Axios errors. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Per-request options accepted by the `http` helpers. */
export interface RequestOptions {
  /** Cancels the request, e.g. the `signal` TanStack Query passes to a `queryFn`. */
  signal?: AbortSignal;
}
