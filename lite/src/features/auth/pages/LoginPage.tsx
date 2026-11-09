import { useEffect, useState, type KeyboardEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Globe, LockKeyhole, UserRound } from 'lucide-react';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { BrandMark } from '@/components/layout/BrandMark';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { getErrorMessage, isSafeRedirect } from '@/utils/helpers';
import { useDomains, useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

/** Simple sign-in page: domain, user name and password. */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const location = useLocation();
  const domains = useDomains();
  const login = useLogin();
  const [capsLock, setCapsLock] = useState(false);

  const { control, handleSubmit, resetField } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { domain: '', username: '', password: '' },
  });

  useEffect(() => {
    document.title = `Sign in | ${APP_CONFIG.name}`;
  }, []);

  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={isSafeRedirect(from) ? from : ROUTES.home} replace />;
  }

  const onSubmit = handleSubmit((values) =>
    // Never keep a wrong password in the form.
    login.mutate(values, { onError: () => resetField('password') }),
  );

  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <div className="oe-login-page relative flex min-h-screen flex-col items-center justify-center px-4 py-10 text-fg">
      <ThemeToggle className="!absolute right-4 top-4" />

      <div className="oe-animate-in w-full max-w-[420px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandMark size={44} />
          <h1 className="m-0 mt-4 text-[24px] font-semibold tracking-[-0.02em]">
            Sign in to {APP_CONFIG.name}
          </h1>
          <p className="m-0 mt-1.5 text-[13.5px] text-fg-muted">{APP_CONFIG.tagline}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="oe-card flex flex-col gap-4 p-6 sm:p-7">
          {sessionExpired && !login.isError && (
            <Alert
              type="warning"
              showIcon
              title="Your session has expired. Please sign in again."
            />
          )}
          {login.isError && (
            <Alert
              type="error"
              showIcon
              title={getErrorMessage(login.error)}
              className="oe-animate-in"
            />
          )}

          <AppSelect
            control={control}
            name="domain"
            label="Domain"
            placeholder="Select your domain"
            size="large"
            prefix={<Globe size={15} />}
            loading={domains.isLoading}
            disabled={login.isPending}
            options={(domains.data ?? []).map((d) => ({ label: d, value: d }))}
          />
          <AppInput
            control={control}
            name="username"
            label="User Name"
            size="large"
            autoComplete="username"
            prefix={<UserRound size={15} />}
            disabled={login.isPending}
            placeholder="Enter your user name"
          />
          <AppInput
            control={control}
            name="password"
            kind="password"
            label="Password"
            size="large"
            autoComplete="current-password"
            prefix={<LockKeyhole size={15} />}
            disabled={login.isPending}
            placeholder="Enter your password"
            onKeyUp={trackCapsLock}
            hint={capsLock ? 'Caps Lock is on.' : undefined}
          />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={login.isPending}
            icon={<ArrowRight size={16} />}
            iconPlacement="end"
            className="mt-1"
          >
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="m-0 mt-6 text-center text-[12px] text-fg-muted">
          Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
          {APP_CONFIG.companyName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
