import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Button, Checkbox } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, LockKeyhole, UserRound } from 'lucide-react';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { BrandMark } from '@/components/layout/BrandMark';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { getErrorMessage, isSafeRedirect } from '@/utils/helpers';
import { TermsModal } from '../components/TermsModal';
import { useDomains, useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

/** Sign-in page: domain (from the API), user name, password and the terms checkbox. */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const location = useLocation();
  const domains = useDomains();
  const login = useLogin();
  const [termsOpen, setTermsOpen] = useState(false);

  const { control, handleSubmit, resetField, setValue, getValues } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { domain: '', username: '', password: '', acceptTerms: false },
  });

  useEffect(() => {
    document.title = `Sign in | ${APP_CONFIG.name}`;
  }, []);

  // Only one domain from the API: pick it for the user.
  useEffect(() => {
    if (domains.data?.length === 1 && !getValues('domain')) setValue('domain', domains.data[0]);
  }, [domains.data, getValues, setValue]);

  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={isSafeRedirect(from) ? from : ROUTES.home} replace />;
  }

  // Only the credentials are sent; never keep a wrong password in the form.
  const onSubmit = handleSubmit(({ domain, username, password }) =>
    login.mutate({ domain, username, password }, { onError: () => resetField('password') }),
  );

  return (
    <div className="oe-login-page grid min-h-screen text-fg lg:grid-cols-2">
      <aside className="oe-login-brand hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="text-[17px] font-semibold">{APP_CONFIG.name}</span>
        </div>
        <div className="max-w-[440px]">
          <h2 className="m-0 text-[38px] font-semibold leading-tight text-white">
            Automation that keeps your estate running.
          </h2>
          <p className="m-0 mt-4 text-[15px] text-white/75">{APP_CONFIG.tagline}</p>
        </div>
        <p className="m-0 text-[12px] text-white/60">
          Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
          {APP_CONFIG.companyName}
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="oe-animate-in w-full max-w-[380px]">
          <div className="mb-8 text-center lg:text-left">
            <span className="lg:hidden">
              <BrandMark size={44} />
            </span>
            <h1 className="m-0 mt-4 text-[28px] font-semibold lg:mt-0">
              Welcome <span className="oe-text-gradient">back</span>
            </h1>
            <p className="m-0 mt-1.5 text-[14px] text-fg-muted">Sign in to continue.</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {sessionExpired && !login.isError && (
              <Alert
                type="warning"
                showIcon
                title="Your session has expired. Please sign in again."
              />
            )}
            {login.isError && <Alert type="error" showIcon title={getErrorMessage(login.error)} />}
            {domains.isError && (
              <Alert
                type="error"
                showIcon
                title="Could not load domains."
                action={
                  <Button size="small" onClick={() => domains.refetch()}>
                    Retry
                  </Button>
                }
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
              notFoundContent="No domains found"
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
            />

            <Controller
              control={control}
              name="acceptTerms"
              render={({ field, fieldState }) => (
                <div>
                  <Checkbox
                    id="login-accept-terms"
                    checked={field.value}
                    disabled={login.isPending}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                  >
                    <span className="text-[13px] text-fg-secondary">I agree to the </span>
                  </Checkbox>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-primary hover:underline"
                    onClick={() => setTermsOpen(true)}
                  >
                    Terms and Conditions
                  </button>
                  {fieldState.error && (
                    <span role="alert" className="mt-1.5 block text-[12.5px] text-danger">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Button type="primary" htmlType="submit" size="large" block loading={login.isPending}>
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setValue('acceptTerms', true, { shouldValidate: true });
          setTermsOpen(false);
        }}
      />
    </div>
  );
}
