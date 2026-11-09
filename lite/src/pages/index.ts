import type { ComponentType } from 'react';
import ConfigurationsPage from './configurations/ConfigurationsPage';

/**
 * Which component opens for each menu path. The backend decides which paths a user sees;
 * a path from the menu that isn't listed here shows "coming soon".
 * To add a page: create the component, then add its path here.
 */
export const PAGES: Record<string, ComponentType> = {
  '/configurations': ConfigurationsPage,
};
