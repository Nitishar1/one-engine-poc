import { ROUTES } from '@/config/routes';

type BackdropVariant = 'command' | 'network' | 'ai' | 'grid' | 'mesh';

/** Each product area gets its own background treatment; everything else gets soft lighting. */
const AREA_BACKDROPS: Array<[prefix: string, variant: BackdropVariant]> = [
  [ROUTES.home, 'command'],
  ['/ci-mapping', 'network'],
  ['/ai', 'ai'],
  ['/orchestrator', 'grid'],
  ['/reports', 'grid'],
];

const backdropFor = (pathname: string): BackdropVariant =>
  AREA_BACKDROPS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'mesh';

/** Decorative lighting / pattern behind the top of the page, chosen by product area. */
export function PageBackdrop({ pathname }: { pathname: string }) {
  return <div aria-hidden className="oe-backdrop" data-variant={backdropFor(pathname)} />;
}
