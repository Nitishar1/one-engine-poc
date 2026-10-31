import { createCrudService } from '@/services/api/crudService';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { Agent } from '../types/agent.types';

export const agentService = createCrudService<Agent>(API_ENDPOINTS.agents);
