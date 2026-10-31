import { z } from 'zod';
import { requiredText, strongPassword } from '@/utils/validators';

export const loginSchema = z.object({
  domain: z.string().min(1, 'Select a domain'),
  username: requiredText('User Name', 64),
  password: z.string().min(1, 'Password is required').max(128),
  acceptTerms: z.boolean().refine((v) => v, 'You must agree to the Terms and Conditions'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
