import { useQuery } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { runbookService } from '../services/runbookService';

export const runbookHooks = createCrudHooks('runbooks', runbookService, 'Runbook');

export const useRunbookRoles = () =>
  useQuery({
    queryKey: ['runbooks', 'roles'],
    queryFn: runbookService.getRoles,
    staleTime: Infinity,
  });
