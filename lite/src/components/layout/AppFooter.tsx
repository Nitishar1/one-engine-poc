import { APP_CONFIG } from '@/utils/constants';

export function AppFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-10 text-[12px] text-fg-muted">
      <span>
        Version {APP_CONFIG.version} | Copyright &copy; {APP_CONFIG.copyrightYears}{' '}
        <a
          href={APP_CONFIG.companyUrl}
          target="_blank"
          rel="noreferrer"
          className="!text-fg-muted hover:!text-fg"
        >
          {APP_CONFIG.companyName}
        </a>
        . All rights reserved.
      </span>
      <span className="flex gap-4">
        <a href={APP_CONFIG.privacyUrl} className="!text-fg-muted hover:!text-fg">
          Privacy Notice
        </a>
        <a href={APP_CONFIG.cookieUrl} className="!text-fg-muted hover:!text-fg">
          Cookie Policy
        </a>
      </span>
    </footer>
  );
}
