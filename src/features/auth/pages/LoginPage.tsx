import { useEffect, useState, type CSSProperties } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Bot, Network, Workflow } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/utils/constants';
import { isSafeRedirect } from '@/utils/helpers';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { BrandMark } from '@/components/layout/BrandMark';
import { LoginForm } from '../components/LoginForm';
import { NetworkVisual } from '../components/NetworkVisual';
import { LoginFloatingPanels } from '../components/LoginFloatingPanels';

interface LocationState {
  from?: string;
}

/** Decorative floating shapes on the brand panel: position, size, shape and timing. */
const SHAPES: Array<{ className: string; style: CSSProperties }> = [
  {
    className: 'is-diamond',
    style: {
      top: '14%',
      left: '58%',
      width: 34,
      height: 34,
      ['--oe-rot' as string]: '45deg',
      ['--oe-float-duration' as string]: '11s',
    },
  },
  {
    className: 'is-ring',
    style: {
      top: '68%',
      left: '8%',
      width: 120,
      height: 120,
      ['--oe-float-duration' as string]: '16s',
      ['--oe-float-delay' as string]: '-4s',
    },
  },
  {
    className: 'is-diamond',
    style: {
      bottom: '22%',
      right: '9%',
      width: 18,
      height: 18,
      ['--oe-rot' as string]: '20deg',
      ['--oe-float-duration' as string]: '9s',
      ['--oe-float-delay' as string]: '-2s',
    },
  },
  {
    className: 'is-ring',
    style: {
      top: '6%',
      right: '14%',
      width: 56,
      height: 56,
      ['--oe-float-duration' as string]: '13s',
      ['--oe-float-delay' as string]: '-7s',
    },
  },
];

const CAPABILITIES = [
  { icon: Workflow, title: 'Visual runbooks', text: 'Design and validate automation flows.' },
  { icon: Bot, title: 'AI agents', text: 'Summarise and extract with your models.' },
  { icon: Network, title: 'CI mapping', text: 'Model infrastructure and dependencies.' },
];

export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    document.title = `Sign in · ${APP_CONFIG.name}`;
  }, []);

  if (status === 'authenticated') {
    return <Navigate to={isSafeRedirect(from) ? from : ROUTES.home} replace />;
  }

  return (
    <div className="grid min-h-screen bg-bg text-fg lg:grid-cols-[minmax(0,1.1fr)_minmax(480px,1fr)]">
      {/* Brand panel — intentionally dark in both themes. */}
      <aside className="oe-login-visual sticky top-0 hidden h-screen flex-col justify-between gap-8 p-10 lg:flex xl:px-14">
        {SHAPES.map((shape, i) => (
          <span
            key={i}
            aria-hidden
            className={`oe-login-shape ${shape.className}`}
            style={shape.style}
          />
        ))}
        <div className="relative z-10 flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-display text-[16px] font-semibold tracking-[-0.01em]">
            {APP_CONFIG.name}
          </span>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center gap-8">
          <div className="oe-animate-in max-w-[520px]">
            <p className="oe-login-chip m-0 mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium text-[#bfdbfe]">
              <span
                className="oe-status is-live !h-auto !border-0 !bg-transparent !p-0"
                style={{ ['--tone' as string]: '#22d3ee' }}
              >
                <span className="oe-status__dot" aria-hidden />
              </span>
              {APP_CONFIG.tagline}
            </p>
            <h1 className="m-0 text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-white xl:text-[44px]">
              Orchestrate your infrastructure with{' '}
              <span className="oe-login-headline-accent">intelligent automation.</span>
            </h1>
            <p className="m-0 mt-4 max-w-[440px] text-[15px] leading-relaxed text-[#c7d6f5]/70">
              One control plane for runbooks, agents and configuration items — with AI built into
              every step.
            </p>
          </div>
          <div
            className="oe-animate-in -mx-2 flex min-h-0 justify-start"
            style={{ animationDelay: '80ms' }}
          >
            <div className="relative w-full max-w-[640px]">
              {/* On wide screens the diagram narrows to leave room for the floating panels. */}
              <NetworkVisual className="xl:[@media(min-height:821px)]:max-w-[440px]" />
              <div className="hidden xl:block [@media(max-height:820px)]:!hidden">
                <LoginFloatingPanels />
              </div>
            </div>
          </div>
        </div>

        <ul className="oe-stagger relative z-10 m-0 grid list-none grid-cols-3 gap-3 p-0 [@media(max-height:760px)]:hidden">
          {CAPABILITIES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="oe-login-capability flex flex-col gap-1.5 p-4">
              <span className="oe-login-capability__icon mb-1.5">
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <span className="text-[13px] font-medium text-white/95">{title}</span>
              <span className="text-[12.5px] leading-snug text-[#c7d6f5]/55">{text}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Sign-in panel */}
      <main className="oe-login-panel flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <span className="flex items-center gap-2 lg:invisible">
            <BrandMark size={26} />
            <span className="font-display text-[15px] font-semibold">{APP_CONFIG.name}</span>
          </span>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="oe-animate-in w-full max-w-[380px]" style={{ animationDelay: '60ms' }}>
            <p className="m-0 mb-2 text-[12.5px] font-medium text-fg-muted lg:hidden">
              {APP_CONFIG.tagline}
            </p>
            <p className="m-0 mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-primary max-lg:hidden">
              Welcome back
            </p>
            <h2 className="m-0 text-[28px] font-semibold tracking-[-0.025em] text-fg">
              Sign in to <span className="oe-text-gradient">{APP_CONFIG.name}</span>
            </h2>
            <p className="m-0 mb-8 mt-2 text-[14px] text-fg-muted">
              Use your directory account to access {APP_CONFIG.name}.
            </p>
            <LoginForm
              notice={
                sessionExpired ? 'Your session has expired. Please sign in again.' : undefined
              }
              onOpenTerms={() => setTermsOpen(true)}
              termsOpen={termsOpen}
              onCloseTerms={() => setTermsOpen(false)}
            />
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-5 text-[12px] text-fg-muted sm:px-8">
          <span>
            © {APP_CONFIG.copyrightYears}{' '}
            <a
              href={APP_CONFIG.companyUrl}
              target="_blank"
              rel="noreferrer"
              className="!text-fg-muted hover:!text-fg"
            >
              {APP_CONFIG.companyName}
            </a>
          </span>
          <span className="flex gap-4">
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-fg-muted hover:text-fg"
            >
              Terms
            </button>
            <a href={APP_CONFIG.privacyUrl} className="!text-fg-muted hover:!text-fg">
              Privacy Notice
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}
