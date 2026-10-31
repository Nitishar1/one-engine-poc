import { createCrudService } from '@/services/api/crudService';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { http } from '@/services/api/axiosInstance';
import type {
  AiAgentConfig,
  AiAgentRunRequest,
  AiAgentRunResult,
  AiModel,
} from '../types/ai.types';

export const aiModelService = createCrudService<AiModel>(API_ENDPOINTS.aiModels);

export const aiAgentService = {
  ...createCrudService<AiAgentConfig>(API_ENDPOINTS.aiAgents),
  run: (id: string, request: AiAgentRunRequest) =>
    http.post<AiAgentRunResult>(API_ENDPOINTS.aiAgentRun(id), request),
};
