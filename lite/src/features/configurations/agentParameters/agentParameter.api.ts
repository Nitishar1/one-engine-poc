import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { AgentParameterGroup } from './agentParameter.schema';

export const agentParameterService = createCrudService<AgentParameterGroup>(
  API_ENDPOINTS.agentParameters,
);
export const agentParameterHooks = createCrudHooks(
  'agent-parameters',
  agentParameterService,
  'Parameter group',
);
