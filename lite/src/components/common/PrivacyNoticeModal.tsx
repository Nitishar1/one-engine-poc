/**
 * Privacy Notice pop-up, opened from the sign-in page and from the footer of every page.
 *
 * PLACEHOLDER TEXT: no official privacy notice exists in the project yet. The sections below only
 * describe what this app actually does with data (sign-in details, session cookie, settings kept
 * in the browser, audit logging). Replace them with the official notice from the privacy / legal
 * team; nothing else needs to change.
 */
import type { ReactNode } from 'react';
import { AppModal } from './AppModal';
import { APP_CONFIG } from '@/utils/constants';

const SECTIONS: Array<{ title: string; body: ReactNode }> = [
  {
    title: 'What we collect',
    body: (
      <>
        When you sign in, {APP_CONFIG.name} receives your domain, user name and password. The
        password is only sent to the server to check it; the app does not store it. While you use
        the app, your actions (for example configuration changes, runbook executions and agent
        invocations) are recorded together with your user name and the time.
      </>
    ),
  },
  {
    title: 'How it is used',
    body: (
      <>
        Your details are used to sign you in, decide which pages you can open, and keep an audit
        trail of changes and executions. They are not used for advertising.
      </>
    ),
  },
  {
    title: 'Cookies and browser storage',
    body: (
      <>
        A secure, http-only session cookie keeps you signed in and a security cookie protects
        against cross-site requests. Your access token is kept in memory only and is cleared when
        you sign out or close the tab. The browser also remembers a few display settings (light or
        dark theme and whether the sidebar is collapsed).
      </>
    ),
  },
  {
    title: 'Who can see it',
    body: (
      <>
        Audit records and execution logs can be viewed by administrators of {APP_CONFIG.name} and by
        people your organisation authorises to review them.
      </>
    ),
  },
  {
    title: 'Questions',
    body: (
      <>
        For questions about your data, or to ask for a correction, contact your {APP_CONFIG.name}{' '}
        administrator.
      </>
    ),
  },
];

interface PrivacyNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyNoticeModal({ open, onClose }: PrivacyNoticeModalProps) {
  return (
    <AppModal
      title="Privacy Notice"
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
      width={640}
    >
      <div className="max-h-[55vh] overflow-y-auto pr-2 text-[14px] leading-relaxed text-fg-secondary">
        {SECTIONS.map(({ title, body }) => (
          <section key={title} className="mb-4 last:mb-0">
            <h3 className="m-0 mb-1 text-[14px] font-semibold text-fg">{title}</h3>
            <p className="m-0">{body}</p>
          </section>
        ))}
        <p className="m-0 mt-5 text-[12px] text-fg-muted">
          {APP_CONFIG.name} {APP_CONFIG.version} &middot; &copy; {APP_CONFIG.copyrightYears}{' '}
          {APP_CONFIG.companyName}
        </p>
      </div>
    </AppModal>
  );
}
