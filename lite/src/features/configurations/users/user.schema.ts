import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { identifier } from '@/utils/validators';

export interface AppUser extends BaseEntity {
  userName: string;
  domainId: string;
  timeZone: string;
  /** Page opened after sign-in; one of the menu URLs. */
  homeUrl: string;
  roleIds: string[];
}

export const userSchema = z.object({
  userName: identifier('User Name', 100),
  domainId: z.string().min(1, 'Domain Name is required'),
  timeZone: z.string().min(1, 'Time Zone is required'),
  homeUrl: z.string().min(1, 'Home URL is required'),
  roleIds: z.array(z.string()).min(1, 'Select at least one role'),
});

export type UserFormValues = z.infer<typeof userSchema>;
