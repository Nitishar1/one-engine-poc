import { createCrudService } from '@/services/api/crudService';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { http } from '@/services/api/axiosInstance';
import type { Runbook } from '../types/workflow.types';

export const runbookService = {
  ...createCrudService<Runbook>(API_ENDPOINTS.runbooks),
  getRoles: () => http.get<string[]>(API_ENDPOINTS.runbookRoles),
};
