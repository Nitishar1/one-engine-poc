/**
 * Input sanitising shared by the form validators and the API layer. React already escapes
 * everything it renders; these helpers keep unexpected characters out of the data itself.
 */

// Control characters (except tab / line feed / carriage return) and zero-width characters.
const CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g;

/** Normalises Unicode, removes control characters and trims. Newlines only when `multiline`. */
export function sanitizeText(value: string, multiline = false): string {
  const cleaned = value.normalize('NFKC').replace(CONTROL_CHARS, '');
  return (multiline ? cleaned : cleaned.replace(/[\r\n\t]+/g, ' ')).trim();
}

/** True when a value looks like HTML or a script URL, which no field in this app accepts. */
export function containsMarkup(value: string): boolean {
  return /<\s*\/?\s*[a-z!?]/i.test(value) || /(javascript|vbscript|data)\s*:/i.test(value);
}

/**
 * Cleans every string in a request body (keeps line breaks) before it is sent. Applied to all
 * create / update calls in crudService; the backend must still validate everything.
 */
export function sanitizePayload<T>(value: T): T {
  if (typeof value === 'string') return sanitizeText(value, true) as T;
  if (Array.isArray(value)) return value.map(sanitizePayload) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizePayload(item)]),
    ) as T;
  }
  return value;
}
