import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { requiredText } from '@/utils/validators';

export interface Role extends BaseEntity {
  roleName: string;
  description: string;
  parentRoleId: string | null;
  isAdmin: boolean;
}

export const roleSchema = z.object({
  roleName: requiredText('Role Name', 60),
  description: requiredText('Role Description', 1000),
  /** '' = no parent. */
  parentRoleId: z.string(),
  isAdmin: z.boolean(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
