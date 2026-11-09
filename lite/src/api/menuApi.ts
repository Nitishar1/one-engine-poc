import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { MenuItem } from './types';

export const menuApi = {
  /** The sidebar for the signed-in user. The backend decides which pages they can see. */
  list: () => api.get<MenuItem[]>(ENDPOINTS.menus),
};
