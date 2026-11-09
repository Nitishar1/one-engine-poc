import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/feedback/toastStore';
import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { getErrorMessage } from '@/utils/helpers';

/** An account locked after too many failed sign-ins. */
export interface LockedAccount {
  id: string;
  userAccountName: string;
  lockedOn: string;
  unlockedBy: string | null;
  unlockedOn: string | null;
}

const KEY = ['locked-accounts'] as const;

export const useLockedAccounts = () =>
  useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) =>
      http.get<LockedAccount[]>(API_ENDPOINTS.lockedAccounts, undefined, { signal }),
  });

export function useUnlockAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post<LockedAccount>(API_ENDPOINTS.unlockAccount(id)),
    onSuccess: (account) => {
      void qc.invalidateQueries({ queryKey: KEY });
      toast.success(`${account.userAccountName} unlocked`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
