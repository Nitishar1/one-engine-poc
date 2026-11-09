import type { RequestOptions } from '@/types/api.types';
import type { BaseEntity, EntityId, EntityInput } from '@/types/common.types';
import { resourcePath } from './apiEndpoints';
import { http } from './axiosInstance';

export interface CrudService<T extends BaseEntity> {
  list: (options?: RequestOptions) => Promise<T[]>;
  get: (id: EntityId, options?: RequestOptions) => Promise<T>;
  create: (input: EntityInput<T>) => Promise<T>;
  update: (id: EntityId, input: EntityInput<T>) => Promise<T>;
  remove: (id: EntityId) => Promise<void>;
}

/** Standard REST service for a resource collection (`GET/POST /x`, `GET/PUT/DELETE /x/:id`). */
export function createCrudService<T extends BaseEntity>(endpoint: string): CrudService<T> {
  return {
    list: (options) => http.get<T[]>(endpoint, undefined, options),
    get: (id, options) => http.get<T>(resourcePath(endpoint, id), undefined, options),
    create: (input) => http.post<T>(endpoint, input),
    update: (id, input) => http.put<T>(resourcePath(endpoint, id), input),
    remove: (id) => http.delete<void>(resourcePath(endpoint, id)),
  };
}
