import { ROUTES } from '@/config/routes';

/** Decorative lighting behind the top of the page: the command-centre look on Home. */
export function PageBackdrop({ pathname }: { pathname: string }) {
  const variant = pathname.startsWith(ROUTES.home) ? 'command' : 'mesh';
  return <div aria-hidden className="oe-backdrop" data-variant={variant} />;
}
