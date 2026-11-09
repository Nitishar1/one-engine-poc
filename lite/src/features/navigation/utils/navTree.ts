import { resolveIcon } from '@/components/common/iconRegistry';
import { ROUTES } from '@/config/routes';
import type { BreadcrumbEntry, NavItem, NavMatch, NavigationMenu } from '@/types/navigation.types';
import { isSafeRedirect } from '@/utils/helpers';

/** Backend menus -> sidebar items. Paths that are not in-app paths are dropped. */
export function toNavItems(menus: NavigationMenu[]): NavItem[] {
  return menus.map((menu) => ({
    key: menu.id,
    label: menu.label,
    icon: resolveIcon(menu.icon),
    path: menu.path && isSafeRedirect(menu.path) ? menu.path : undefined,
    children: menu.children?.length ? toNavItems(menu.children) : undefined,
  }));
}

/** Every item with a path, with the groups above it. */
export function flattenNav(items: NavItem[], parents: NavItem[] = []): NavMatch[] {
  return items.flatMap((item) => [
    ...(item.path ? [{ item, parents }] : []),
    ...(item.children ? flattenNav(item.children, [...parents, item]) : []),
  ]);
}

/** The menu item owning a pathname (longest matching path prefix wins). */
export function findNavMatch(flat: NavMatch[], pathname: string): NavMatch | undefined {
  return flat
    .filter(({ item }) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => (b.item.path?.length ?? 0) - (a.item.path?.length ?? 0))[0];
}

/** "Home / <Group> / <Page> / <New|Edit>" for the header. */
export function buildBreadcrumbs(flat: NavMatch[], pathname: string): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [{ label: 'Home', path: ROUTES.home }];
  const match = findNavMatch(flat, pathname);
  if (!match || match.item.path === ROUTES.home) return crumbs;

  match.parents.forEach((parent) => crumbs.push({ label: parent.label }));
  const isSubPage = pathname !== match.item.path;
  crumbs.push({ label: match.item.label, path: isSubPage ? match.item.path : undefined });
  if (isSubPage) crumbs.push({ label: pathname.endsWith('/new') ? 'New' : 'Edit' });
  return crumbs;
}
