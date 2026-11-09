import { z } from 'zod';
import { containsMarkup, sanitizeText } from './sanitize';

/**
 * Field rules shared by every form. Each text rule cleans the value first (see sanitize.ts),
 * then checks length and rejects HTML / script content. The backend must apply the same rules.
 */
const cleanText = (multiline = false) =>
  z.string().transform((value) => sanitizeText(value, multiline));

const noMarkup = (value: string) => !containsMarkup(value);
const markupMessage = (label: string) => `${label} must not contain HTML or script`;

export const requiredText = (label: string, max = 100) =>
  cleanText().pipe(
    z
      .string()
      .min(1, `${label} is required`)
      .max(max, `${label} must be at most ${max} characters`)
      .refine(noMarkup, markupMessage(label)),
  );

export const optionalText = (label: string, max = 1000) =>
  cleanText(true).pipe(
    z
      .string()
      .max(max, `${label} must be at most ${max} characters`)
      .refine(noMarkup, markupMessage(label)),
  );

/** Letters, digits and . _ - only (keys, account and group names). */
export const identifier = (label: string, max = 100) =>
  cleanText().pipe(
    z
      .string()
      .min(1, `${label} is required`)
      .max(max, `${label} must be at most ${max} characters`)
      .regex(/^[A-Za-z0-9._@-]+$/, `${label} may contain letters, digits and . _ @ - only`),
  );

/** In-app path such as /configurations/users; empty for a menu group. */
export const menuPath = cleanText().pipe(
  z
    .string()
    .max(200, 'Menu URL must be at most 200 characters')
    .regex(
      /^$|^(\/[a-z0-9]+(-[a-z0-9]+)*)+$/,
      'Use a path like /configurations/users (lower-case letters, digits and -)',
    ),
);

export const displayOrder = z
  .number({ error: 'Display Order is required' })
  .int('Display Order must be a whole number')
  .min(1, 'Display Order must be between 1 and 999')
  .max(999, 'Display Order must be between 1 and 999');

const SQL_FORBIDDEN =
  /\b(insert|update|delete|merge|drop|alter|truncate|create|grant|revoke|exec|execute|xp_\w+|sp_\w+|into|shutdown)\b/i;

/**
 * Report query: a single read-only SELECT. This only gives quick feedback - the backend must run
 * report queries with a read-only database account and parameterised filters.
 */
export const selectQuery = cleanText(true).pipe(
  z
    .string()
    .min(1, 'Query is required')
    .max(5000, 'Query must be at most 5000 characters')
    .refine((q) => /^(select|with)\b/i.test(q), 'Query must start with SELECT or WITH')
    .refine((q) => !q.replace(/;\s*$/, '').includes(';'), 'Only one statement is allowed')
    .refine((q) => !/--|\/\*/.test(q), 'Comments are not allowed in the query')
    .refine((q) => !SQL_FORBIDDEN.test(q), 'Only read-only SELECT queries are allowed'),
);

/** key=value;key=value on one line, e.g. Data Source=server;Initial Catalog=db. */
export const connectionString = cleanText().pipe(
  z
    .string()
    .max(1000, 'Connection String must be at most 1000 characters')
    .regex(
      /^$|^([^=;]+=[^;]*;?)+$/,
      'Use key=value pairs separated by semicolons (see the sample below)',
    ),
);
