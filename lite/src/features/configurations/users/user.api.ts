import { useQuery } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { AppUser } from './user.schema';

export const userService = createCrudService<AppUser>(API_ENDPOINTS.users);
export const userHooks = createCrudHooks('users', userService, 'User');

/** Time zone names offered on the user form (from the backend, so they match the server). */
export const useTimeZones = () =>
  useQuery({
    queryKey: ['lookups', 'time-zones'],
    queryFn: ({ signal }) =>
      http.get<string[]>(API_ENDPOINTS.lookups.timeZones, undefined, { signal }),
    staleTime: Infinity,
  });
