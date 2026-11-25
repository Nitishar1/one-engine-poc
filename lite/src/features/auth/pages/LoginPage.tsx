import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Button, Checkbox, ConfigProvider, type ThemeConfig } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Cpu,
  Globe,
  LockKeyhole,
  Network,
  Server,
  ShieldCheck,
  UserRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { PrivacyNoticeModal } from '@/components/common/PrivacyNoticeModal';
import { getAntdTheme } from '@/components/theme/antdTheme';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { getErrorMessage, isSafeRedirect } from '@/utils/helpers';
import { TermsModal } from '../components/TermsModal';
import { useDomains, useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';

/** Dark antd theme for the card (whatever the app theme), with glassy blue fields. */
const LOGIN_THEME: ThemeConfig = (() => {
  const dark = getAntdTheme('dark');
  return {
    ...dark,
    token: {
      ...dark.token,
      colorPrimary: '#3b82f6',
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBgElevated: '#0c1a3d',
      colorBorder: 'rgba(147, 197, 253, 0.28)',
      colorText: '#eef2ff',
      colorTextPlaceholder: 'rgba(203, 213, 225, 0.6)',
      controlHeightLG: 46,
      borderRadiusLG: 12,
    },
  };
})();

/**
 * Floating glass cards: [icon, colour, left %, top %, animation delay s]. Each card has its own
 * colour. Hidden on small screens.
 */
const CHIPS: Array<[LucideIcon, string, number, number, number]> = [
  [Bot, '#38bdf8', 7, 12, 0],
  [Workflow, '#a78bfa', 40, 6, 1.2],
  [Cpu, '#f472b6', 78, 10, 2.1],
  [BrainCircuit, '#34d399', 87, 30, 0.6],
  [Network, '#fbbf24', 83, 50, 1.6],
  [ShieldCheck, '#22d3ee', 76, 82, 0.9],
  [Server, '#fb7185', 21, 88, 2.6],
];

/** Glowing bubbles rising across the screen: [colour, left %, size px, duration s, delay s]. */
const BUBBLES: Array<[string, number, number, number, number]> = [
  ['#38bdf8', 6, 14, 18, 0],
  ['#a78bfa', 15, 22, 24, -6],
  ['#f472b6', 27, 10, 16, -10],
  ['#34d399', 36, 18, 22, -3],
  ['#fbbf24', 48, 12, 20, -14],
  ['#22d3ee', 58, 26, 28, -8],
  ['#fb7185', 67, 14, 19, -2],
  ['#818cf8', 76, 20, 25, -16],
  ['#2dd4bf', 85, 12, 17, -5],
  ['#e879f9', 93, 18, 23, -11],
];

/** Network nodes in the 1440 x 900 drawing (colour cycles through the palette). */
const NODES: Array<[number, number]> = [
  [180, 150],
  [620, 110],
  [1180, 140],
  [150, 560],
  [1260, 470],
  [1150, 760],
  [260, 800],
  [470, 330],
  [990, 330],
  [720, 820],
];
const NODE_COLOURS = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];

/**
 * Background layers, back to front: aurora lights, rotating colour halo behind the card, fading
 * grid, stars, shooting stars, gradient waves, network links and nodes, rising bubbles,
 * floating cards. All decorative (aria-hidden); motion stops with "reduce motion".
 */
function LoginBackground() {
  return (
    <>
      <div className="oe-login-aurora" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="oe-login-halo" aria-hidden />
      <div className="oe-login-grid" aria-hidden />
      <div className="oe-login-stars" aria-hidden />
      <div className="oe-login-meteors" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <svg className="oe-login-waves" viewBox="0 0 2880 200" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="oe-login-wave-a" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.35" stopColor="#6366f1" />
            <stop offset="0.7" stopColor="#ec4899" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="oe-login-wave-b" x1="0" x2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#34d399" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* Each path is two identical waves wide; sliding it by half loops seamlessly. */}
        <path
          className="oe-login-wave"
          stroke="url(#oe-login-wave-a)"
          d="M0 120 C 240 40, 480 200, 720 120 S 1200 40, 1440 120 S 1920 200, 2160 120 S 2640 40, 2880 120"
        />
        <path
          className="oe-login-wave oe-login-wave--slow"
          stroke="url(#oe-login-wave-b)"
          d="M0 150 C 240 90, 480 210, 720 150 S 1200 90, 1440 150 S 1920 210, 2160 150 S 2640 90, 2880 150"
        />
      </svg>

      <svg
        className="oe-login-network"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* Dashed links between the floating cards. */}
        <path className="oe-login-link" d="M180 150 C 400 60, 520 90, 620 110" />
        <path className="oe-login-link" d="M620 110 C 820 160, 1000 60, 1180 140" />
        <path className="oe-login-link" d="M1180 140 C 1300 260, 1320 380, 1260 470" />
        <path className="oe-login-link" d="M1260 470 C 1220 600, 1200 700, 1150 760" />
        <path className="oe-login-link" d="M150 560 C 120 660, 180 760, 260 800" />
        <path className="oe-login-link" d="M180 150 C 120 300, 110 430, 150 560" />
        <path className="oe-login-link" d="M470 330 C 600 260, 860 260, 990 330" />
        <path className="oe-login-link" d="M260 800 C 420 880, 600 860, 720 820" />
        <path className="oe-login-link" d="M720 820 C 880 780, 1000 790, 1150 760" />
        {NODES.map(([x, y], i) => (
          <circle
            key={`${x}-${y}`}
            className="oe-login-node"
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 4.5 : 3.5}
            style={{
              fill: NODE_COLOURS[i % NODE_COLOURS.length],
              color: NODE_COLOURS[i % NODE_COLOURS.length],
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </svg>

      {BUBBLES.map(([colour, left, size, duration, delay]) => (
        <span
          key={`${colour}-${left}`}
          className="oe-login-bubble"
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            color: colour,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
          aria-hidden
        />
      ))}

      {CHIPS.map(([Icon, colour, left, top, delay]) => (
        <div
          key={`${left}-${top}`}
          className="oe-login-chip hidden lg:flex"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
            ['--chip' as string]: colour,
          }}
          aria-hidden
        >
          <span className="oe-login-chip__icon">
            <Icon size={16} />
          </span>
          <span className="oe-login-chip__bars">
            <span style={{ width: 64 }} />
            <span style={{ width: 40 }} />
          </span>
        </div>
      ))}
    </>
  );
}

/**
 * Sign-in page.
 *
 * Functionality:
 * - Centred card on a deep blue, colourful background: drifting aurora lights (blue, cyan,
 *   violet, teal, pink, amber), a rotating colour halo behind the card, a fading grid, stars,
 *   shooting stars, flowing gradient waves, coloured network nodes, rising glowing bubbles and
 *   floating "agent" cards in different colours. Same look in both themes.
 * - Domain (from the API, retry on failure), user name, password and the terms checkbox, then
 *   Sign in. Version, copyright and Privacy Notice underneath. Labels are kept for screen readers; the fields show an icon and placeholder.
 * - The card always uses the dark antd theme so the fields read well on the blue background.
 * Background styles: styles/background.css, section "Sign-in page".
 */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const location = useLocation();
  const domains = useDomains();
  const login = useLogin();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

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
    <div className="oe-login-page flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <LoginBackground />

      <div className="oe-animate-in flex w-full max-w-[440px] flex-col items-center">
        <div className="mb-7 flex flex-col items-center text-center">
          <h1 className="oe-login-title m-0 text-[38px] font-bold leading-none tracking-[-0.03em]">
            {APP_CONFIG.name}
          </h1>
          <p className="oe-login-tagline m-0 mt-2.5 text-[15px] font-semibold">
            {APP_CONFIG.tagline}
          </p>
        </div>

        <ConfigProvider theme={LOGIN_THEME}>
          <div className="oe-login-card w-full px-7 pb-8 pt-7 sm:px-9">
            <h2 className="m-0 mb-6 text-center text-[21px] font-semibold text-white">
              Sign in to Application
            </h2>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              {sessionExpired && !login.isError && (
                <Alert
                  type="warning"
                  showIcon
                  title="Your session has expired. Please sign in again."
                />
              )}
              {login.isError && (
                <Alert type="error" showIcon title={getErrorMessage(login.error)} />
              )}
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
                className="oe-login-field"
                placeholder="Select your domain"
                size="large"
                prefix={<Globe size={16} className="text-cyan-300" />}
                loading={domains.isLoading}
                disabled={login.isPending}
                notFoundContent="No domains found"
                // The list opens inside the card so it keeps the card's dark colours in light mode.
                getPopupContainer={(trigger) => trigger.closest('.oe-login-card') ?? document.body}
                options={(domains.data ?? []).map((d) => ({ label: d, value: d }))}
              />
              <AppInput
                control={control}
                name="username"
                label="User Name"
                className="oe-login-field"
                size="large"
                autoComplete="username"
                prefix={<UserRound size={16} className="text-cyan-300" />}
                disabled={login.isPending}
                placeholder="User Name"
              />
              <AppInput
                control={control}
                name="password"
                kind="password"
                label="Password"
                className="oe-login-field"
                size="large"
                autoComplete="current-password"
                prefix={<LockKeyhole size={16} className="text-cyan-300" />}
                disabled={login.isPending}
                placeholder="Password"
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
                      <span className="text-[13px] text-slate-300">I agree to the </span>
                    </Checkbox>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-cyan-300 hover:underline"
                      onClick={() => setTermsOpen(true)}
                    >
                      Terms and Conditions
                    </button>
                    {fieldState.error && (
                      <span role="alert" className="mt-1.5 block text-[12.5px] text-red-400">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={login.isPending}
                className="oe-login-submit mt-1"
                icon={login.isPending ? undefined : <ArrowRight size={17} />}
                iconPlacement="end"
              >
                {login.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
        </ConfigProvider>
      </div>

      <p className="m-0 mt-8 text-center text-[12px] text-slate-400">
        Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
        {APP_CONFIG.companyName} |{' '}
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-cyan-300 hover:underline"
        >
          Privacy Notice
        </button>
      </p>

      <PrivacyNoticeModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
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
