import { z } from 'zod';
import { identifier, strongPassword } from '@/utils/validators';

export const loginSchema = z.object({
  domain: z.string().min(1, 'Select your domain'),
  username: identifier('User Name', 100),
  // Passwords are sent as typed (never trimmed or changed); only the length is checked.
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'New password must differ from the current password',
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
