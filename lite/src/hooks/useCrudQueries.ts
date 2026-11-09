import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
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
  /** Other cached data that changes when this resource changes (e.g. the navigation menu). */
  alsoInvalidate: QueryKey[] = [],
) {
  const keys = {
    all: [resourceKey] as const,
    detail: (id: EntityId) => [resourceKey, id] as const,
  };

  const useList = () =>
    useQuery({ queryKey: keys.all, queryFn: ({ signal }) => service.list({ signal }) });

  const useDetail = (id?: EntityId) =>
    useQuery({
      queryKey: keys.detail(id ?? ''),
      queryFn: ({ signal }) => service.get(id as EntityId, { signal }),
      enabled: Boolean(id),
    });

  const useSave = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: EntityId; input: EntityInput<T> }) =>
        id ? service.update(id, input) : service.create(input),
      onSuccess: (_saved, { id }) => {
        [keys.all, ...alsoInvalidate].forEach(
          (key) => void qc.invalidateQueries({ queryKey: key }),
        );
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
        [keys.all, ...alsoInvalidate].forEach(
          (key) => void qc.invalidateQueries({ queryKey: key }),
        );
        void toast.success(`${entityLabel} deleted successfully`);
      },
      onError: (err) => void toast.error(getErrorMessage(err)),
    });
  };

  return { keys, useList, useDetail, useSave, useRemove };
}
