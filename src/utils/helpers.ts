import { ApiError } from '@/types/api.types';

/** Case-insensitive match of a search term against any of the given values. */
export function matchesSearch(
  term: string,
  values: Array<string | number | undefined | null>,
): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return values.some(
    (v) => v !== undefined && v !== null && String(v).toLowerCase().includes(needle),
  );
}

export function generateId(prefix = 'id'): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError && error.fieldErrors) {
    // Server-side validation: show the field messages, not just "The request was not valid."
    const details = Object.values(error.fieldErrors).flat().slice(0, 3);
    if (details.length) return details.join(' ');
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * True for in-app paths only. Guards post-login redirects against open-redirects such as
 * `//evil.example` or `/\evil.example`, which browsers treat as other origins.
 */
export const isSafeRedirect = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !/^\/[/\\]/.test(path);
