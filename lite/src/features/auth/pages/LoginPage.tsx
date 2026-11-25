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

/** Floating glass cards: [icon, left %, top %, animation delay s]. Hidden on small screens. */
const CHIPS: Array<[LucideIcon, number, number, number]> = [
  [Bot, 7, 12, 0],
  [Workflow, 40, 6, 1.2],
  [Cpu, 78, 10, 2.1],
  [BrainCircuit, 87, 30, 0.6],
  [Network, 83, 50, 1.6],
  [ShieldCheck, 76, 82, 0.9],
  [Server, 21, 88, 2.6],
];

/** Side profile of a head facing right, in a 410 x 520 box. */
const HEAD_PATH =
  'M120 40 C200 0 320 20 360 110 C380 160 372 200 380 232 L406 292 C410 302 400 306 386 310 ' +
  'C393 330 386 344 376 350 C383 365 376 380 361 386 C351 410 321 421 290 416 ' +
  'C270 440 265 480 262 520 L90 520 C110 450 100 400 70 360 C20 300 10 200 40 130 ' +
  'C60 80 90 55 120 40 Z';

/** Points spread over two brain-shaped lobes, each linked to its three nearest neighbours. */
const BRAIN = (() => {
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const points: Array<[number, number]> = [];
  while (points.length < 110) {
    const x = (random() * 2 - 1) * 125;
    const y = (random() * 2 - 1) * 80;
    const inLobe = (cx: number) => ((x - cx) / 72) ** 2 + (y / 78) ** 2 <= 1;
    if (inLobe(-50) || inLobe(50)) points.push([Math.round(x), Math.round(y)]);
  }
  const links: Array<[number, number]> = [];
  points.forEach(([x, y], i) => {
    points
      .map(([px, py], j) => [j, (px - x) ** 2 + (py - y) ** 2] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .forEach(([j]) => links.push([i, j]));
  });
  return { points, links };
})();

/** Background layers: stars, network links and nodes, particle head, brain, floating cards. */
function LoginBackground() {
  const nodes: Array<[number, number]> = [
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
  return (
    <>
      <div className="oe-login-stars" aria-hidden />
      <svg
        className="oe-login-network"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          {/* Tiny dots that fill the head, like a particle scan. */}
          <pattern id="oe-login-dots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1.15" fill="#7dd3fc" />
          </pattern>
          <radialGradient id="oe-login-head-glow" cx="62%" cy="42%" r="70%">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="1" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="oe-login-head-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.6" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="oe-login-head-mask">
            <rect x="-50" y="-50" width="520" height="620" fill="url(#oe-login-head-fade)" />
          </mask>
        </defs>

        {/* Glowing particle head in profile (facing the form) with scan rings behind it. */}
        <g className="oe-login-head" transform="translate(10 250) scale(0.98)">
          {[70, 105, 140].map((r) => (
            <circle key={r} className="oe-login-ring" cx="95" cy="235" r={r} />
          ))}
          <g mask="url(#oe-login-head-mask)">
            <path d={HEAD_PATH} fill="url(#oe-login-head-glow)" />
            <path d={HEAD_PATH} fill="url(#oe-login-dots)" opacity="0.32" />
            <path d={HEAD_PATH} className="oe-login-head-outline" />
          </g>
        </g>

        {/* Brain-like network of glowing points. */}
        <g className="oe-login-brain" transform="translate(1150 640)">
          {BRAIN.links.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={BRAIN.points[a][0]}
              y1={BRAIN.points[a][1]}
              x2={BRAIN.points[b][0]}
              y2={BRAIN.points[b][1]}
            />
          ))}
          {BRAIN.points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 2.4 : 1.5} />
          ))}
        </g>

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
        {nodes.map(([x, y], i) => (
          <circle
            key={`${x}-${y}`}
            className="oe-login-node"
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 4 : 3}
            style={{ animationDelay: `${(i * 0.4) % 3}s` }}
          />
        ))}
      </svg>
      {CHIPS.map(([Icon, left, top, delay]) => (
        <div
          key={`${left}-${top}`}
          className="oe-login-chip hidden lg:flex"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
          aria-hidden
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/30">
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
 * - Centred card on a deep blue background (glowing lights, drifting stars, a glowing particle head,
 *   a brain-like network, dashed links between nodes and floating "agent" cards). Same look in both themes.
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
        <a href={APP_CONFIG.privacyUrl} className="!text-cyan-300 hover:!underline">
          Privacy Notice
        </a>
      </p>

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
