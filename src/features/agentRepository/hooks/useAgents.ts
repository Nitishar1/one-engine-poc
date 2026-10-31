import { createCrudHooks } from '@/hooks/useCrudQueries';
import { agentService } from '../services/agentService';

export const agentHooks = createCrudHooks('agents', agentService, 'Agent');
