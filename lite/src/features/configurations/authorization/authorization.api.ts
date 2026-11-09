import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/feedback/toastStore';
import { NAVIGATION_QUERY_KEY } from '@/features/navigation/hooks/useNavigation';
import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { getErrorMessage } from '@/utils/helpers';

/** Menus a role may open. The backend checks this on every request, not just the menu. */
export interface RoleAuthorization {
  roleId: string;
  menuIds: string[];
}

const key = (roleId: string) => ['authorization', roleId] as const;

export const useRoleAuthorization = (roleId?: string) =>
  useQuery({
    queryKey: key(roleId ?? ''),
    queryFn: ({ signal }) =>
      http.get<RoleAuthorization>(API_ENDPOINTS.authorization(roleId as string), undefined, {
        signal,
      }),
    enabled: Boolean(roleId),
  });

export function useSaveAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, menuIds }: RoleAuthorization) =>
      http.put<RoleAuthorization>(API_ENDPOINTS.authorization(roleId), { menuIds }),
    onSuccess: (saved) => {
      // Show the saved ticks straight away instead of waiting for a reload.
      qc.setQueryData(key(saved.roleId), saved);
      // The signed-in user's own menu may have changed.
      void qc.invalidateQueries({ queryKey: NAVIGATION_QUERY_KEY });
      toast.success('Page authorization saved');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
