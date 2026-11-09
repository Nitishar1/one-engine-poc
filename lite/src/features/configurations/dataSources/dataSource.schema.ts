import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { connectionString, requiredText } from '@/utils/validators';

export const DATA_SOURCE_TYPES = ['SQL', 'Oracle', 'MySQL', 'PostgreSQL'] as const;
export type DataSourceType = (typeof DATA_SOURCE_TYPES)[number];

/**
 * A database reports can read from. The connection string holds credentials, so it is
 * write-only: the backend stores it encrypted and never returns it.
 */
export interface DataSource extends BaseEntity {
  dataSourceName: string;
  dataSourceType: DataSourceType;
  /** Only sent to the backend; empty on update keeps the stored value. */
  connectionString?: string;
}

/** `isEdit`: an empty connection string keeps the stored one. */
export const makeDataSourceSchema = (isEdit: boolean) =>
  z.object({
    dataSourceName: requiredText('DataSource Name', 100),
    dataSourceType: z.enum(DATA_SOURCE_TYPES, { error: 'DataSource Type is required' }),
    connectionString: isEdit
      ? connectionString
      : connectionString.refine((v) => v.length > 0, 'Connection String is required'),
  });

export type DataSourceFormValues = z.infer<ReturnType<typeof makeDataSourceSchema>>;

export const CONNECTION_STRING_SAMPLE =
  'Data Source=DataSourceName;Initial Catalog=DatabaseName;Integrated Security=True';
