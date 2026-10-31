import type { BaseEntity, EntityId, EntityInput } from '@/types/common.types';
import { http } from './axiosInstance';

export interface CrudService<T extends BaseEntity> {
  list: () => Promise<T[]>;
  get: (id: EntityId) => Promise<T>;
  create: (input: EntityInput<T>) => Promise<T>;
  update: (id: EntityId, input: EntityInput<T>) => Promise<T>;
  remove: (id: EntityId) => Promise<void>;
}

/** Standard REST service for a resource collection (`GET/POST /x`, `GET/PUT/DELETE /x/:id`). */
export function createCrudService<T extends BaseEntity>(endpoint: string): CrudService<T> {
  return {
    list: () => http.get<T[]>(endpoint),
    get: (id) => http.get<T>(`${endpoint}/${id}`),
    create: (input) => http.post<T>(endpoint, input),
    update: (id, input) => http.put<T>(`${endpoint}/${id}`, input),
    remove: (id) => http.delete<void>(`${endpoint}/${id}`),
  };
}
