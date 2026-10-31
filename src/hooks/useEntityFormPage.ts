import { useNavigate, useParams } from 'react-router-dom';
import type { BaseEntity, EntityInput } from '@/types/common.types';
import type { createCrudHooks } from './useCrudQueries';

type CrudHooks<T extends BaseEntity> = ReturnType<typeof createCrudHooks<T>>;

/**
 * Shared plumbing for create/edit pages: reads `:id`, loads the entity, saves it and returns
 * to the list page on success.
 */
export function useEntityFormPage<T extends BaseEntity>(hooks: CrudHooks<T>, listPath: string) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detail = hooks.useDetail(id);
  const save = hooks.useSave();

  return {
    id,
    isEdit: Boolean(id),
    entity: detail.data,
    isLoading: detail.isLoading,
    loadError: detail.error,
    isSaving: save.isPending,
    back: () => navigate(listPath),
    submit: (input: EntityInput<T>) =>
      save.mutate({ id, input }, { onSuccess: () => navigate(listPath) }),
  };
}
