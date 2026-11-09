import { z } from 'zod';
import { identifier } from '@/utils/validators';

export const loginSchema = z.object({
  domain: z.string().min(1, 'Select your domain'),
  username: identifier('User Name', 100),
  // Passwords are sent as typed (never trimmed or changed); only the length is checked.
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
