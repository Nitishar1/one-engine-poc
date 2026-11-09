import { z } from 'zod';
import { ICON_KEYS, type IconKey } from '@/components/common/iconRegistry';
import type { BaseEntity } from '@/types/common.types';
import { displayOrder, requiredText, selectQuery } from '@/utils/validators';

/** A report shown as a menu item under `parentMenuId`, reading from a data source. */
export interface Report extends BaseEntity {
  reportName: string;
  parentMenuId: string;
  dataSourceId: string;
  icon: IconKey;
  displayOrder: number;
  query: string;
}

export const reportSchema = z.object({
  reportName: requiredText('Report Name', 100),
  parentMenuId: z.string().min(1, 'Parent Menu Name is required'),
  dataSourceId: z.string().min(1, 'DataSource Name is required'),
  icon: z.enum(ICON_KEYS, { error: 'Icon is required' }),
  displayOrder,
  query: selectQuery,
});

export type ReportFormValues = z.infer<typeof reportSchema>;

/** Fields on step 1 of the form; step 2 is the query. */
export const STEP_ONE_FIELDS = [
  'reportName',
  'parentMenuId',
  'dataSourceId',
  'icon',
  'displayOrder',
] as const satisfies ReadonlyArray<keyof ReportFormValues>;
