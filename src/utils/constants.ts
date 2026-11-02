export const APP_CONFIG = {
  name: 'OneEngine',
  shortName: 'OE',
  tagline: 'AI Infused Automation Solution',
  version: '1.1',
  copyrightYears: '2025-2026',
  companyName: 'Tata Consultancy Services',
  companyUrl: 'https://www.tcs.com',
  privacyUrl: '#privacy',
  cookieUrl: '#cookies',
} as const;

export const STORAGE_KEYS = {
  theme: 'oneengine-theme',
  sidebar: 'oneengine-sidebar',
  typingProgress: 'oneengine-typing-done',
} as const;

export const DATE_TIME_FORMAT = 'DD-MM-YYYY HH:mm:ss';
export const DATE_FORMAT = 'DD-MM-YYYY';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const MOBILE_BREAKPOINT = 992;

export const QUERY_STALE_TIME = 30_000;
