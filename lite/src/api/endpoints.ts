/** Every backend URL the app calls, relative to VITE_API_BASE_URL. */
export const ENDPOINTS = {
  domains: '/auth/domains',
  login: '/auth/login',
  logout: '/auth/logout',
  session: '/auth/session',
  menus: '/menus',
  configurations: '/configurations',
};

/** Builds `/base/<id>` with the id URL-encoded, so an id can never change the route. */
export function withId(base: string, id: string) {
  if (!id.trim() || id === '.' || id === '..') throw new Error(`Invalid id "${id}"`);
  return `${base}/${encodeURIComponent(id)}`;
}
