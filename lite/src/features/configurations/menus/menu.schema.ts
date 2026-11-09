import { z } from 'zod';
import { ICON_KEYS, type IconKey } from '@/components/common/iconRegistry';
import type { BaseEntity } from '@/types/common.types';
import { displayOrder, menuPath, requiredText } from '@/utils/validators';

/** A sidebar entry. Entries without a URL are groups; the sidebar is built from these. */
export interface MenuEntity extends BaseEntity {
  menuName: string;
  /** In-app path, '' for a group. */
  menuUrl: string;
  parentId: string | null;
  icon: IconKey;
  displayOrder: number;
}

export const menuSchema = z.object({
  menuName: requiredText('Menu Name', 50),
  menuUrl: menuPath,
  /** '' = top level. */
  parentId: z.string(),
  icon: z.enum(ICON_KEYS, { error: 'Icon is required' }),
  displayOrder,
});

export type MenuFormValues = z.infer<typeof menuSchema>;
