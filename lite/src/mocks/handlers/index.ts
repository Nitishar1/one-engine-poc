import dayjs from 'dayjs';
import type { AgentParameterGroup } from '@/features/configurations/agentParameters/agentParameter.schema';
import type { AppSetting } from '@/features/configurations/appSettings/appSetting.schema';
import type { DataSource } from '@/features/configurations/dataSources/dataSource.schema';
import type { Domain } from '@/features/configurations/domains/domain.schema';
import type { MenuEntity } from '@/features/configurations/menus/menu.schema';
import type { Report } from '@/features/configurations/reports/report.schema';
import type { Role } from '@/features/configurations/roles/role.schema';
import type { AppUser } from '@/features/configurations/users/user.schema';
import type { AuthUser, LoginRequest } from '@/features/auth/types/auth.types';
import type { HomeSummary } from '@/features/home/types/home.types';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { BaseEntity } from '@/types/common.types';
import type { NavigationMenu } from '@/types/navigation.types';
import { MockCollection } from '../mockDb';
import {
  agentParametersSeed,
  appSettingsSeed,
  authorizationSeed,
  dataSourcesSeed,
  domainsSeed,
  generateExecutions,
  lockedAccountsSeed,
  menusSeed,
  reportsSeed,
  rolesSeed,
  TIME_ZONES,
  usersSeed,
} from '../data/seed';
import { crudRoutes } from './crudHandlers';
import { fail, ok, type MockResult, type MockRoute } from './types';

/**
 * Mock backend: the same endpoints and rules the real API must implement. Data is kept in
 * localStorage so edits survive a reload (clear site data to reset).
 */

interface RoleAuthorization extends BaseEntity {
  menuIds: string[];
}

const db = {
  menus: new MockCollection<MenuEntity>('menus', menusSeed),
  roles: new MockCollection<Role>('roles', rolesSeed),
  users: new MockCollection<AppUser>('users-v2', usersSeed),
  domains: new MockCollection<Domain>('domains', domainsSeed),
  agentParameters: new MockCollection<AgentParameterGroup>('agentParameters', agentParametersSeed),
  appSettings: new MockCollection<AppSetting>('appSettings', appSettingsSeed),
  dataSources: new MockCollection<DataSource>('dataSources', dataSourcesSeed),
  reports: new MockCollection<Report>('reports', reportsSeed),
  authorization: new MockCollection<RoleAuthorization>(
    'authorization',
    Object.entries(authorizationSeed).map(([id, menuIds]) => ({
      id,
      menuIds,
      modifiedBy: 'system',
      modifiedOn: new Date().toISOString(),
    })),
  ),
};
let lockedAccounts = structuredClone(lockedAccountsSeed);
const executions = generateExecutions();

/** Simulates the httpOnly session cookie the real backend would set. */
const SESSION_KEY = 'oneengine-lite-mock-session';

export const mockSession = {
  get: () => sessionStorage.getItem(SESSION_KEY),
  set: (username: string) => sessionStorage.setItem(SESSION_KEY, username),
  clear: () => sessionStorage.removeItem(SESSION_KEY),
};

// ---------------------------------------------------------------- auth

/** Roles of a signed-in name; unknown names act as Admin so any name works in the demo. */
const roleIdsOf = (username: string) =>
  db.users.all().find((u) => u.userName.toLowerCase() === username.toLowerCase())?.roleIds ?? [
    'role-admin',
  ];

const buildUser = (username: string, domain: string): AuthUser => ({
  id: `usr_${username.toLowerCase()}`,
  username,
  displayName: username,
  role: (db.roles.find(roleIdsOf(username)[0])?.roleName ?? 'Admin') as AuthUser['role'],
  domain,
  lastLogin: dayjs().subtract(6, 'hour').toISOString(),
  timezone: TIME_ZONES[0],
});

const sessionPayload = (username: string, domain = 'Local') => ({
  user: buildUser(username, domain),
  accessToken: `mock.${btoa(username)}.${Date.now()}`,
});

const signInDomains = () => db.domains.all().map((d) => d.domainName);

const authRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: API_ENDPOINTS.auth.domains,
    public: true,
    handler: () => ok(signInDomains()),
  },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.login,
    public: true,
    handler: ({ body }) => {
      const { domain, username, password } = body as LoginRequest;
      if (!signInDomains().includes(domain)) return fail(400, 'Select a valid domain');
      if (!username?.trim() || !password) return fail(400, 'User name and password are required');
      // Same message for unknown user and wrong password, so names can't be guessed.
      if (password.toLowerCase() === 'invalid') return fail(401, 'Invalid user name or password');
      mockSession.set(username.trim());
      return ok(sessionPayload(username.trim(), domain));
    },
  },
  {
    method: 'GET',
    pattern: API_ENDPOINTS.auth.session,
    public: true,
    handler: () => {
      const username = mockSession.get();
      return username ? ok(sessionPayload(username)) : fail(401, 'No active session');
    },
  },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.changePassword,
    handler: ({ body }) => {
      const { currentPassword, newPassword } = body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!currentPassword || !newPassword) return fail(400, 'Both passwords are required');
      // Demo rule: the current password "invalid" is treated as wrong.
      if (currentPassword.toLowerCase() === 'invalid')
        return fail(400, 'Current password is incorrect');
      if (currentPassword === newPassword)
        return fail(400, 'New password must differ from the current password');
      if (newPassword.length < 8) return fail(400, 'Password must be at least 8 characters');
      return ok(null, 'Password changed successfully');
    },
  },
  {
    method: 'POST',
    pattern: API_ENDPOINTS.auth.logout,
    handler: () => {
      mockSession.clear();
      return ok(null);
    },
  },
];

// ---------------------------------------------------------------- navigation

function buildNavigation(
  menus: MenuEntity[],
  allowed: Set<string>,
  parentId: string | null = null,
): NavigationMenu[] {
  return (
    menus
      .filter((m) => m.parentId === parentId && allowed.has(m.id))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => {
        const children = buildNavigation(menus, allowed, m.id);
        return {
          id: m.id,
          label: m.menuName,
          icon: m.icon,
          path: m.menuUrl || null,
          children: children.length ? children : undefined,
        };
      })
      // Empty groups are left out.
      .filter((item) => item.path || item.children)
  );
}

const navigationRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: API_ENDPOINTS.navigation,
    handler: ({ user }) => {
      const roleIds = roleIdsOf(user ?? '');
      const menus = db.menus.all();
      // Admin roles open every page; other roles only what Authorization allows.
      const isAdmin = roleIds.some((id) => db.roles.find(id)?.isAdmin);
      const allowed = new Set(
        isAdmin
          ? menus.map((m) => m.id)
          : roleIds.flatMap((roleId) => db.authorization.find(roleId)?.menuIds ?? []),
      );
      return ok(buildNavigation(menus, allowed));
    },
  },
  {
    method: 'GET',
    pattern: API_ENDPOINTS.dashboard.summary,
    handler: () => {
      const days = Array.from({ length: 14 }, (_, i) => dayjs().subtract(13 - i, 'day'));
      const finished = executions.filter((e) => e.status !== 'Running');
      const summary: HomeSummary = {
        totals: {
          users: db.users.all().length,
          roles: db.roles.all().length,
          menus: db.menus.all().length,
          dataSources: db.dataSources.all().length,
        },
        successRate: Math.round(
          (finished.filter((e) => e.status === 'Success').length / finished.length) * 100,
        ),
        dailyExecutions: days.map((day) => {
          const sameDay = executions.filter((e) => dayjs(e.startedOn).isSame(day, 'day'));
          return {
            date: day.format('DD MMM'),
            success: sameDay.filter((e) => e.status === 'Success').length,
            failed: sameDay.filter((e) => e.status === 'Failed').length,
          };
        }),
        recentExecutions: executions.slice(0, 6),
      };
      return ok(summary);
    },
  },
];

// ---------------------------------------------------------------- configurations

/** Applies `map` to every item a route returns (used to hide secrets). */
function mapOutput<T>(routes: MockRoute[], map: (item: T) => T): MockRoute[] {
  return routes.map((route) => ({
    ...route,
    handler: async (req) => {
      const result: MockResult = await route.handler(req);
      const body = result.body as { success: boolean; data: unknown };
      if (!body?.success || !body.data) return result;
      const data = Array.isArray(body.data)
        ? body.data.map((i) => map(i as T))
        : map(body.data as T);
      return { ...result, body: { ...body, data } };
    },
  }));
}

/** On update, an empty secret field keeps the stored value. */
function keepSecretOnUpdate<T extends BaseEntity>(
  routes: MockRoute[],
  collection: MockCollection<T>,
  field: keyof T & string,
): MockRoute[] {
  return routes.map((route) =>
    route.method !== 'PUT'
      ? route
      : {
          ...route,
          handler: (req) => {
            const body = req.body as Record<string, unknown>;
            if (!body[field]) body[field] = collection.find(req.params.id)?.[field];
            return route.handler(req);
          },
        },
  );
}

const hideAppSettingSecret = (s: AppSetting): AppSetting =>
  s.isSecret ? { ...s, appValue: null } : s;
const hideConnectionString = ({ connectionString: _hidden, ...rest }: DataSource): DataSource =>
  rest;

// ---------------------------------------------------------------- users page (OneEngine.Api shapes)

const USER_API = API_ENDPOINTS.userAdmin;

/** Menu ids the given roles may open; Admin roles open everything. */
const allowedMenuIds = (roleIds: string[]) => {
  const menus = db.menus.all();
  if (roleIds.some((id) => db.roles.find(id)?.isAdmin)) return new Set(menus.map((m) => m.id));
  return new Set(roleIds.flatMap((roleId) => db.authorization.find(roleId)?.menuIds ?? []));
};

const toApiUser = (u: AppUser) => ({
  userID: u.id,
  userName: u.userName,
  domainID: u.domainId,
  timeZoneID: u.timeZoneId,
  homeUrl: u.homeUrl,
  homeUrlID: u.homeUrlId || 0,
  allowedRoles: u.roleIds.join(','),
  isActive: u.isActive,
  modifiedBy: u.modifiedBy,
  modifiedOn: u.modifiedOn,
});

const userAdminRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: USER_API.domains,
    handler: () => ok(db.domains.all().map((d) => ({ domainID: d.id, domainName: d.domainName }))),
  },
  {
    method: 'GET',
    pattern: USER_API.roles,
    handler: () =>
      ok(
        db.roles.all().map((r) => ({
          roleID: r.id,
          roleName: r.roleName,
          isAdmin: r.isAdmin,
          isDeleted: false,
        })),
      ),
  },
  {
    method: 'GET',
    pattern: USER_API.timeZones,
    handler: () => ok(TIME_ZONES.map((name, i) => ({ timezoneID: i + 1, timezoneName: name }))),
  },
  {
    method: 'POST',
    pattern: USER_API.menusByRole,
    handler: ({ body }) => {
      const roleIds = (body as { roleIds?: unknown }).roleIds;
      if (!Array.isArray(roleIds)) return fail(400, 'roleIds is required');
      const allowed = allowedMenuIds(roleIds.map(String));
      return ok(
        db.menus
          .all()
          .filter((m) => m.menuUrl && allowed.has(m.id))
          .map((m) => ({ menuID: m.id, menuName: m.menuName, menuUrl: m.menuUrl })),
      );
    },
  },
  { method: 'GET', pattern: USER_API.users, handler: () => ok(db.users.all().map(toApiUser)) },
  {
    method: 'GET',
    pattern: `${USER_API.users}/:id`,
    handler: ({ params }) => {
      const user = db.users.find(params.id);
      return user ? ok(toApiUser(user)) : fail(404, 'User not found');
    },
  },
  {
    // No PUT on the real API: userID 0 creates, any other id updates.
    method: 'POST',
    pattern: USER_API.users,
    handler: ({ body, user }) => {
      const b = body as Record<string, unknown>;
      const id = String(b.userID ?? 0);
      const input = {
        userName: String(b.userName ?? '').trim(),
        domainId: String(b.domainID ?? ''),
        timeZoneId: String(b.timeZoneID ?? ''),
        homeUrl: String(b.homeUrl ?? ''),
        homeUrlId: b.homeUrlID ? String(b.homeUrlID) : '',
        roleIds: String(b.allowedRoles ?? '')
          .split(',')
          .filter(Boolean),
        isActive: b.isActive !== false,
      };
      if (!input.userName || !input.domainId || !input.timeZoneId || !input.roleIds.length)
        return fail(400, 'User name, domain, time zone and roles are required');
      const isNew = id === '0';
      if (
        db.users.some(
          (u) => u.id !== id && u.userName.toLowerCase() === input.userName.toLowerCase(),
        )
      )
        return fail(409, 'User already exists');
      const saved = isNew
        ? db.users.create(input, user ?? 'system')
        : db.users.update(id, input, user ?? 'system');
      return saved ? ok(toApiUser(saved)) : fail(404, 'User not found');
    },
  },
  {
    method: 'DELETE',
    pattern: `${USER_API.users}/:id`,
    handler: ({ params }) => (db.users.remove(params.id) ? ok(null) : fail(404, 'User not found')),
  },
];

const configurationRoutes: MockRoute[] = [
  ...crudRoutes(API_ENDPOINTS.agentParameters, db.agentParameters, {
    label: 'Parameter group',
    uniqueField: 'groupName',
  }),
  ...mapOutput(
    keepSecretOnUpdate(
      crudRoutes(API_ENDPOINTS.appSettings, db.appSettings, {
        label: 'App setting',
        uniqueField: 'appKey',
      }),
      db.appSettings,
      'appValue',
    ),
    hideAppSettingSecret,
  ),
  ...crudRoutes(API_ENDPOINTS.roles, db.roles, {
    label: 'Role',
    uniqueField: 'roleName',
    canDelete: (id) =>
      db.users.some((u) => u.roleIds.includes(id))
        ? 'This role is assigned to users. Remove it from them first.'
        : db.roles.some((r) => r.parentRoleId === id)
          ? 'Other roles use this role as their parent.'
          : null,
  }),
  ...crudRoutes(API_ENDPOINTS.domains, db.domains, {
    label: 'Domain',
    uniqueField: 'domainName',
    canDelete: (id) =>
      db.users.some((u) => u.domainId === id) ? 'Users still sign in with this domain.' : null,
  }),
  ...crudRoutes(API_ENDPOINTS.menus, db.menus, {
    label: 'Menu',
    uniqueField: 'menuName',
    canDelete: (id) =>
      db.menus.some((m) => m.parentId === id) ? 'Delete or move the menus inside it first.' : null,
  }),
  ...crudRoutes(API_ENDPOINTS.reports, db.reports, { label: 'Report', uniqueField: 'reportName' }),
  ...mapOutput(
    keepSecretOnUpdate(
      crudRoutes(API_ENDPOINTS.dataSources, db.dataSources, {
        label: 'DataSource',
        uniqueField: 'dataSourceName',
        canDelete: (id) =>
          db.reports.some((r) => r.dataSourceId === id)
            ? 'Reports still use this data source.'
            : null,
      }),
      db.dataSources,
      'connectionString',
    ),
    hideConnectionString,
  ),
  {
    method: 'POST',
    pattern: API_ENDPOINTS.validateDataSource,
    handler: ({ body }) => {
      const { connectionString } = body as { connectionString: string };
      const valid = /(data source|server|host)\s*=/i.test(connectionString);
      return ok({
        valid,
        message: valid
          ? 'Connection succeeded'
          : 'Could not connect: no server in the connection string',
      });
    },
  },
  {
    method: 'GET',
    pattern: '/configurations/authorization/:roleId',
    handler: ({ params }) =>
      db.roles.find(params.roleId)
        ? ok({
            roleId: params.roleId,
            menuIds: db.authorization.find(params.roleId)?.menuIds ?? [],
          })
        : fail(404, 'Role not found'),
  },
  {
    method: 'PUT',
    pattern: '/configurations/authorization/:roleId',
    handler: ({ params, body, user }) => {
      if (!db.roles.find(params.roleId)) return fail(404, 'Role not found');
      const ids = (body as { menuIds?: unknown }).menuIds;
      const known = new Set(db.menus.all().map((m) => m.id));
      if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string' || !known.has(id)))
        return fail(400, 'Unknown menu in the request');
      const input = { menuIds: [...new Set(ids as string[])] };
      const saved =
        db.authorization.update(params.roleId, input, user ?? 'system') ??
        db.authorization.create(input, user ?? 'system');
      return ok({ roleId: params.roleId, menuIds: saved.menuIds });
    },
  },
  {
    method: 'GET',
    pattern: API_ENDPOINTS.lockedAccounts,
    handler: () => ok(lockedAccounts),
  },
  {
    method: 'POST',
    pattern: '/configurations/locked-accounts/:id/unlock',
    handler: ({ params, user }) => {
      const account = lockedAccounts.find((a) => a.id === params.id);
      if (!account) return fail(404, 'Account not found');
      if (account.unlockedOn) return fail(409, 'This account is already unlocked');
      const unlocked = {
        ...account,
        unlockedBy: user ?? 'system',
        unlockedOn: new Date().toISOString(),
      };
      lockedAccounts = lockedAccounts.map((a) => (a.id === params.id ? unlocked : a));
      return ok(unlocked);
    },
  },
];

export const mockRoutes: MockRoute[] = [
  ...authRoutes,
  ...navigationRoutes,
  ...userAdminRoutes,
  ...configurationRoutes,
];
