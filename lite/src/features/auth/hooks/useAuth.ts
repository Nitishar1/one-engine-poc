import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';
import { authService } from '../services/authService';
import { toast } from '@/components/feedback/toastStore';
import { getErrorMessage } from '@/utils/helpers';
import type { ChangePasswordRequest, LoginRequest } from '../types/auth.types';

export const useDomains = () =>
  useQuery({
    queryKey: ['auth', 'domains'],
    queryFn: ({ signal }) => authService.getDomains({ signal }),
    staleTime: Infinity,
  });

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: ({ user, accessToken }) => setSession(user, accessToken),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => authService.changePassword(request),
    onSuccess: () => void toast.success('Password changed successfully'),
    onError: (err) => void toast.error(getErrorMessage(err)),
  });
}
