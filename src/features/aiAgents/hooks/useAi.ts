import { useMutation } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { aiAgentService, aiModelService } from '../services/aiService';
import type { AiAgentRunRequest } from '../types/ai.types';

export const aiModelHooks = createCrudHooks('ai-models', aiModelService, 'AI Model');
export const aiAgentHooks = createCrudHooks('ai-agents', aiAgentService, 'AI Agent');

export const useRunAiAgent = (id: string) =>
  useMutation({ mutationFn: (request: AiAgentRunRequest) => aiAgentService.run(id, request) });
