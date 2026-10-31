import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrudService } from '@/services/api/crudService';
import type { BaseEntity, EntityId, EntityInput } from '@/types/common.types';
import { getErrorMessage } from '@/utils/helpers';
import { toast } from '@/components/feedback/toastStore';

/**
 * Builds the TanStack Query hooks for a CRUD resource. Each feature calls this once and
 * re-exports named hooks, so pages never talk to services directly.
 */
export function createCrudHooks<T extends BaseEntity>(
  resourceKey: string,
  service: CrudService<T>,
  entityLabel: string,
) {
  const keys = {
    all: [resourceKey] as const,
    detail: (id: EntityId) => [resourceKey, id] as const,
  };

  const useList = () => useQuery({ queryKey: keys.all, queryFn: service.list });

  const useDetail = (id?: EntityId) =>
    useQuery({
      queryKey: keys.detail(id ?? ''),
      queryFn: () => service.get(id as EntityId),
      enabled: Boolean(id),
    });

  const useSave = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: EntityId; input: EntityInput<T> }) =>
        id ? service.update(id, input) : service.create(input),
      onSuccess: (_saved, { id }) => {
        void qc.invalidateQueries({ queryKey: keys.all });
        void toast.success(`${entityLabel} ${id ? 'updated' : 'created'} successfully`);
      },
      onError: (err) => void toast.error(getErrorMessage(err)),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: EntityId) => service.remove(id),
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: keys.all });
        void toast.success(`${entityLabel} deleted successfully`);
      },
      onError: (err) => void toast.error(getErrorMessage(err)),
    });
  };

  return { keys, useList, useDetail, useSave, useRemove };
}
