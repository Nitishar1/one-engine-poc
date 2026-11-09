import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { Report } from './report.schema';

export const reportService = createCrudService<Report>(API_ENDPOINTS.reports);
export const reportHooks = createCrudHooks('reports', reportService, 'Report');
