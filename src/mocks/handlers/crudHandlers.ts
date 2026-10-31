import type { BaseEntity, EntityInput } from '@/types/common.types';
import type { MockCollection } from '../mockDb';
import { fail, ok, type MockRoute } from './types';

interface CrudOptions<T extends BaseEntity> {
  /** Field that must be unique (case-insensitive), e.g. `name`. */
  uniqueField?: keyof T & string;
  label: string;
  /** Returns an error message when the item cannot be deleted. */
  canDelete?: (id: string) => string | null;
}

export function crudRoutes<T extends BaseEntity>(
  endpoint: string,
  collection: MockCollection<T>,
  { uniqueField, label, canDelete }: CrudOptions<T>,
): MockRoute[] {
  const isDuplicate = (input: EntityInput<T>, exceptId?: string) => {
    if (!uniqueField) return false;
    const value = String((input as Record<string, unknown>)[uniqueField] ?? '').toLowerCase();
    return collection.some(
      (i) => i.id !== exceptId && String(i[uniqueField]).toLowerCase() === value,
    );
  };

  return [
    { method: 'GET', pattern: endpoint, handler: () => ok(collection.all()) },
    {
      method: 'GET',
      pattern: `${endpoint}/:id`,
      handler: ({ params }) => {
        const item = collection.find(params.id);
        return item ? ok(item) : fail(404, `${label} not found`);
      },
    },
    {
      method: 'POST',
      pattern: endpoint,
      handler: ({ body, user }) => {
        const input = body as EntityInput<T>;
        if (isDuplicate(input)) return fail(409, `${label} already exists`);
        return ok(collection.create(input, user ?? 'system'));
      },
    },
    {
      method: 'PUT',
      pattern: `${endpoint}/:id`,
      handler: ({ params, body, user }) => {
        const input = body as EntityInput<T>;
        if (isDuplicate(input, params.id)) return fail(409, `${label} already exists`);
        const item = collection.update(params.id, input, user ?? 'system');
        return item ? ok(item) : fail(404, `${label} not found`);
      },
    },
    {
      method: 'DELETE',
      pattern: `${endpoint}/:id`,
      handler: ({ params }) => {
        const blocked = canDelete?.(params.id);
        if (blocked) return fail(409, blocked);
        return collection.remove(params.id) ? ok(null) : fail(404, `${label} not found`);
      },
    },
  ];
}
