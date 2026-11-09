import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { ROUTES } from './routes';

type Page = LazyExoticComponent<ComponentType>;

/** `list` opens at the menu path; `form` (if any) at <path>/new and <path>/:id/edit. */
export interface PageEntry {
  list: Page;
  form?: Page;
}

/**
 * Which component opens for each menu path. The backend menu decides which of these a user can
 * reach; a menu path that isn't listed here shows "coming soon". To add a page: build it, add
 * its path to ROUTES and register it here, then add the menu on the backend.
 */
export const PAGE_REGISTRY: Record<string, PageEntry> = {
  [ROUTES.home]: { list: lazy(() => import('@/features/home/pages/HomePage')) },
  [ROUTES.agentParameters]: {
    list: lazy(() => import('@/features/configurations/agentParameters/AgentParameterListPage')),
    form: lazy(() => import('@/features/configurations/agentParameters/AgentParameterFormPage')),
  },
  [ROUTES.appSettings]: {
    list: lazy(() => import('@/features/configurations/appSettings/AppSettingListPage')),
    form: lazy(() => import('@/features/configurations/appSettings/AppSettingFormPage')),
  },
  [ROUTES.roles]: {
    list: lazy(() => import('@/features/configurations/roles/RoleListPage')),
    form: lazy(() => import('@/features/configurations/roles/RoleFormPage')),
  },
  [ROUTES.users]: {
    list: lazy(() => import('@/features/configurations/users/UserListPage')),
    form: lazy(() => import('@/features/configurations/users/UserFormPage')),
  },
  [ROUTES.authorization]: {
    list: lazy(() => import('@/features/configurations/authorization/AuthorizationPage')),
  },
  [ROUTES.domains]: {
    list: lazy(() => import('@/features/configurations/domains/DomainListPage')),
    form: lazy(() => import('@/features/configurations/domains/DomainFormPage')),
  },
  [ROUTES.lockedAccounts]: {
    list: lazy(() => import('@/features/configurations/lockedAccounts/LockedAccountListPage')),
  },
  [ROUTES.menus]: {
    list: lazy(() => import('@/features/configurations/menus/MenuListPage')),
    form: lazy(() => import('@/features/configurations/menus/MenuFormPage')),
  },
  [ROUTES.reports]: {
    list: lazy(() => import('@/features/configurations/reports/ReportListPage')),
    form: lazy(() => import('@/features/configurations/reports/ReportFormPage')),
  },
  [ROUTES.dataSources]: {
    list: lazy(() => import('@/features/configurations/dataSources/DataSourceListPage')),
    form: lazy(() => import('@/features/configurations/dataSources/DataSourceFormPage')),
  },
};
