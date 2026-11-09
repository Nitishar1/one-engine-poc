import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { Domain } from './domain.schema';

export const domainService = createCrudService<Domain>(API_ENDPOINTS.domains);
export const domainHooks = createCrudHooks('domains', domainService, 'Domain');
