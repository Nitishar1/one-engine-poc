import { useEffect, useState, type KeyboardEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Button, Checkbox } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Globe,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Workflow,
} from 'lucide-react';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { BrandMark } from '@/components/layout/BrandMark';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { getErrorMessage, isSafeRedirect } from '@/utils/helpers';
import { TermsModal } from '../components/TermsModal';
import { useDomains, useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

const FEATURES = [
  { icon: Workflow, title: 'One place for automation', text: 'Runbooks, agents and reports.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Each role sees only its pages.' },
  {
    icon: SlidersHorizontal,
    title: 'Configured, not coded',
    text: 'Menus and settings from one screen.',
  },
];

/** Left half on large screens: brand, headline and what the product does. */
function BrandPanel() {
  return (
    <aside className="oe-login-brand hidden flex-col justify-between p-10 lg:flex xl:p-14">
      <div className="relative flex items-center gap-2.5">
        <BrandMark size={30} />
        <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">
          {APP_CONFIG.name}
        </span>
      </div>

      <div className="relative max-w-[480px]">
        <h2 className="m-0 text-[36px] font-semibold leading-[1.15] tracking-[-0.03em] text-white xl:text-[40px]">
          Automation that keeps your estate running.
        </h2>
        <p className="m-0 mt-4 text-[15px] leading-relaxed text-[#c7d6f5]/85">
          {APP_CONFIG.tagline}: build, run and govern automation for your whole infrastructure.
        </p>
        <ul className="m-0 mt-9 flex list-none flex-col gap-4 p-0">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3.5">
              <span className="oe-login-feature-icon">
                <Icon size={17} strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-white">{title}</span>
                <span className="block text-[13px] text-[#c7d6f5]/75">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative m-0 text-[12px] text-[#c7d6f5]/60">
        Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
        {APP_CONFIG.companyName}. All rights reserved.
      </p>
    </aside>
  );
}

/** Simple sign-in page: domain, user name, password and the terms checkbox. */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const location = useLocation();
  const domains = useDomains();
  const login = useLogin();
  const [capsLock, setCapsLock] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const { control, handleSubmit, resetField, setValue, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { domain: '', username: '', password: '', acceptTerms: false },
  });

  useEffect(() => {
    document.title = `Sign in | ${APP_CONFIG.name}`;
  }, []);

  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={isSafeRedirect(from) ? from : ROUTES.home} replace />;
  }

  // Only the credentials are sent; never keep a wrong password in the form.
  const onSubmit = handleSubmit(({ domain, username, password }) =>
    login.mutate({ domain, username, password }, { onError: () => resetField('password') }),
  );

  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <div className="oe-login-page grid min-h-screen text-fg lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,1fr)]">
      <BrandPanel />

      <main className="relative flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        <ThemeToggle className="!absolute right-5 top-5" />

        <div className="oe-animate-in w-full max-w-[400px]">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="lg:hidden">
              <BrandMark size={44} />
            </span>
            <h1 className="m-0 mt-4 text-[28px] font-semibold tracking-[-0.025em] lg:mt-0">
              Welcome <span className="oe-text-gradient">back</span>
            </h1>
            <p className="m-0 mt-1.5 text-[14px] text-fg-muted">
              Sign in to continue to {APP_CONFIG.name}.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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

            <div>
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <Checkbox
                    id="login-accept-terms"
                    checked={field.value}
                    disabled={login.isPending}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                  >
                    <span className="text-[13px] text-fg-secondary">I agree to the </span>
                  </Checkbox>
                )}
              />
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setTermsOpen(true)}
              >
                Terms and Conditions
              </button>
              {formState.errors.acceptTerms?.message && (
                <span role="alert" className="oe-animate-in mt-1.5 block text-[12.5px] text-danger">
                  {formState.errors.acceptTerms.message}
                </span>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={login.isPending}
              icon={<ArrowRight size={16} />}
              iconPlacement="end"
              className="mt-2"
            >
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="m-0 mt-8 text-center text-[12px] text-fg-muted lg:hidden">
            Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
            {APP_CONFIG.companyName}
          </p>
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
