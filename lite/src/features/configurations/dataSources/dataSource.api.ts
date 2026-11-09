import { createCrudHooks } from '@/hooks/useCrudQueries';
import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import { sanitizePayload } from '@/utils/sanitize';
import type { DataSource, DataSourceType } from './dataSource.schema';

export const dataSourceService = {
  ...createCrudService<DataSource>(API_ENDPOINTS.dataSources),
  /** Asks the backend to open a test connection; nothing is saved. */
  validate: (input: { dataSourceType: DataSourceType; connectionString: string }) =>
    http.post<{ valid: boolean; message: string }>(
      API_ENDPOINTS.validateDataSource,
      sanitizePayload(input),
    ),
};
export const dataSourceHooks = createCrudHooks('data-sources', dataSourceService, 'DataSource');
