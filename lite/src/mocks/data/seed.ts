import dayjs from 'dayjs';
import type { AgentParameterGroup } from '@/features/configurations/agentParameters/agentParameter.schema';
import type { AppSetting } from '@/features/configurations/appSettings/appSetting.schema';
import type { DataSource } from '@/features/configurations/dataSources/dataSource.schema';
import type { Domain } from '@/features/configurations/domains/domain.schema';
import type { LockedAccount } from '@/features/configurations/lockedAccounts/lockedAccount.api';
import type { MenuEntity } from '@/features/configurations/menus/menu.schema';
import type { Report } from '@/features/configurations/reports/report.schema';
import type { Role } from '@/features/configurations/roles/role.schema';
import type { AppUser } from '@/features/configurations/users/user.schema';
import type { ExecutionRecord } from '@/features/home/types/home.types';

/** Small demo data set for the mock backend: just enough to try every screen. */

const at = (daysAgo: number, hour = 10) =>
  dayjs().subtract(daysAgo, 'day').hour(hour).minute(15).second(0).toISOString();
const audit = (daysAgo: number, by = 'SuperUser') => ({
  modifiedBy: by,
  modifiedOn: at(daysAgo),
});

export const SIGN_IN_DOMAINS = ['Local', 'OELAB'];

export const TIME_ZONES = [
  '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  '(UTC+00:00) Dublin, Edinburgh, Lisbon, London',
  '(UTC-05:00) Eastern Time (US & Canada)',
  '(UTC+08:00) Singapore',
];

const menu = (
  id: string,
  menuName: string,
  menuUrl: string,
  icon: MenuEntity['icon'],
  displayOrder: number,
  parentId: string | null = null,
): MenuEntity => ({ id, menuName, menuUrl, icon, displayOrder, parentId, ...audit(40) });

/** The sidebar. Only Home and Configurations have pages; the rest show "coming soon". */
export const menusSeed: MenuEntity[] = [
  menu('m-ci', 'CIMapping', '', 'bookmark', 10),
  menu('m-ci-type', 'CI Type', '/ci-mapping/ci-type', 'briefcase', 1, 'm-ci'),
  menu('m-ci-master', 'CI Master', '/ci-mapping/ci-master', 'gear', 2, 'm-ci'),
  menu('m-ci-rel', 'CI Relationship', '/ci-mapping/ci-relationship', 'list', 3, 'm-ci'),
  menu('m-home', 'Home', '/home', 'home', 20),
  menu('m-agent-repo', 'Agent Repository', '/agent-repository', 'monitor', 30),
  menu('m-orch', 'Orchestrator', '', 'settings', 40),
  menu('m-orch-conn', 'Connections', '/orchestrator/connections', 'network', 1, 'm-orch'),
  menu('m-orch-tools', 'Tools Integration', '/orchestrator/tools', 'monitor', 2, 'm-orch'),
  menu('m-orch-runbook', 'Runbook', '/orchestrator/runbook', 'workflow', 3, 'm-orch'),
  menu('m-reports', 'Reports', '', 'list', 50),
  menu('m-rep-exec', 'Execution Report', '/reports/executions', 'report', 1, 'm-reports'),
  menu('m-cert', 'Certificate Monitoring', '/certificate-monitoring', 'megaphone', 60),
  menu('m-cloud', 'India Cloud', '/india-cloud', 'cloud', 70),
  menu('m-config', 'Configurations', '', 'sliders', 80),
  menu(
    'm-agent-params',
    'Agent Parameters',
    '/configurations/agent-parameters',
    'gear',
    1,
    'm-config',
  ),
  menu(
    'm-app-settings',
    'AppSetting Parameters',
    '/configurations/app-settings',
    'key',
    2,
    'm-config',
  ),
  menu('m-role', 'Role', '/configurations/roles', 'users', 3, 'm-config'),
  menu('m-user', 'User', '/configurations/users', 'user', 4, 'm-config'),
  menu('m-authz', 'Authorization', '/configurations/authorization', 'shield', 5, 'm-config'),
  menu('m-domain', 'Domain', '/configurations/domains', 'globe', 6, 'm-config'),
  menu('m-locked', 'Locked Accounts', '/configurations/locked-accounts', 'lock', 7, 'm-config'),
  menu('m-menu', 'Menu', '/configurations/menus', 'menu', 8, 'm-config'),
  menu(
    'm-report-designer',
    'Report Designer',
    '/configurations/report-designer',
    'report',
    9,
    'm-config',
  ),
  menu('m-datasource', 'DataSource', '/configurations/data-sources', 'database', 10, 'm-config'),
  menu('m-it', 'ITAssistant', '/it-assistant', 'bot', 90),
];

export const rolesSeed: Role[] = [
  {
    id: 'role-admin',
    roleName: 'Admin',
    description: 'Administrator access is given to this role',
    parentRoleId: null,
    isAdmin: true,
    ...audit(30),
  },
  {
    id: 'role-manager',
    roleName: 'Manager',
    description: 'Manages runbooks and reports',
    parentRoleId: null,
    isAdmin: false,
    ...audit(25),
  },
  {
    id: 'role-dev',
    roleName: 'Developer',
    description: 'OneEngine developer',
    parentRoleId: 'role-admin',
    isAdmin: false,
    ...audit(12),
  },
  {
    id: 'role-test',
    roleName: 'Test User',
    description: 'This role is created for testing purpose',
    parentRoleId: null,
    isAdmin: false,
    ...audit(3, 'ramakrishna'),
  },
];

/** Menu ids each role may open; Admin may open everything. */
export const authorizationSeed: Record<string, string[]> = {
  'role-admin': menusSeed.map((m) => m.id),
  'role-manager': ['m-home', 'm-reports', 'm-rep-exec', 'm-orch', 'm-orch-runbook'],
  'role-dev': menusSeed.map((m) => m.id).filter((id) => id !== 'm-authz'),
  'role-test': ['m-home'],
};

export const domainsSeed: Domain[] = [
  {
    id: 'dom-local',
    domainName: 'Local',
    domainPath: 'Local',
    distinguishedName: 'Local',
    isAdDomain: false,
    ...audit(60),
  },
  {
    id: 'dom-oelab',
    domainName: 'OELAB',
    domainPath: 'OELAB.COM',
    distinguishedName: 'DC=na,DC=imtn,DC=com',
    isAdDomain: true,
    ...audit(20),
  },
];

export const usersSeed: AppUser[] = [
  {
    id: 'usr-super',
    userName: 'SuperUser',
    domainId: 'dom-local',
    timeZone: TIME_ZONES[0],
    homeUrl: '/home',
    roleIds: ['role-admin'],
    ...audit(50),
  },
  {
    id: 'usr-rk',
    userName: 'ramakrishna',
    domainId: 'dom-local',
    timeZone: TIME_ZONES[0],
    homeUrl: '/home',
    roleIds: ['role-admin', 'role-dev'],
    ...audit(10, 'ramakrishna'),
  },
  {
    id: 'usr-oe',
    userName: 'oeUser',
    domainId: 'dom-oelab',
    timeZone: TIME_ZONES[0],
    homeUrl: '/home',
    roleIds: ['role-test'],
    ...audit(2),
  },
];

export const agentParametersSeed: AgentParameterGroup[] = [
  {
    id: 'apg-1',
    groupName: 'Testgroup',
    description: 'Default timeouts for test agents',
    parameters: [
      { name: 'timeout', value: '300' },
      { name: 'retries', value: '2' },
    ],
    ...audit(45),
  },
  {
    id: 'apg-2',
    groupName: 'Devtest',
    description: 'Development agents',
    parameters: [{ name: 'logLevel', value: 'debug' }],
    ...audit(8),
  },
];

/** Secret values are kept here only so the mock can "store" them; the API never returns them. */
export const appSettingsSeed: AppSetting[] = [
  {
    id: 'aps-1',
    appKey: 'oe_pythonpath',
    appValue: 'C:\\Python312\\python.exe',
    isSecret: true,
    ...audit(6),
  },
  { id: 'aps-2', appKey: 'oe_max_parallel_runs', appValue: '5', isSecret: false, ...audit(4) },
];

export const dataSourcesSeed: DataSource[] = [
  {
    id: 'ds-1',
    dataSourceName: 'OneEngine Dev',
    dataSourceType: 'SQL',
    connectionString: 'Data Source=oe-dev-sql;Initial Catalog=OneEngine;Integrated Security=True',
    ...audit(30),
  },
];

export const reportsSeed: Report[] = [
  {
    id: 'rep-1',
    reportName: 'Failed runs',
    parentMenuId: 'm-reports',
    dataSourceId: 'ds-1',
    icon: 'report',
    displayOrder: 2,
    query: "SELECT RunbookName, Target, StartedOn FROM Executions WHERE Status = 'Failed'",
    ...audit(14),
  },
];

export const lockedAccountsSeed: LockedAccount[] = [
  {
    id: 'lock-1',
    userAccountName: 'vijayn',
    lockedOn: at(1, 9),
    unlockedBy: null,
    unlockedOn: null,
  },
  {
    id: 'lock-2',
    userAccountName: '2055765',
    lockedOn: at(9, 14),
    unlockedBy: 'SuperUser',
    unlockedOn: at(8, 10),
  },
];

/** 14 days of runbook executions for the Home charts. */
export function generateExecutions(): ExecutionRecord[] {
  const runbooks = ['Disk cleanup', 'Service restart', 'Patch compliance', 'Log rotation'];
  const targets = ['oe-app-01', 'oe-db-01', 'oe-web-02'];
  const records: ExecutionRecord[] = [];
  for (let day = 13; day >= 0; day--) {
    const runs = 3 + ((day * 7) % 5);
    for (let i = 0; i < runs; i++) {
      const n = day * 10 + i;
      records.push({
        id: `exe-${n}`,
        runbookName: runbooks[n % runbooks.length],
        target: targets[n % targets.length],
        triggeredBy: n % 3 ? 'SuperUser' : 'ramakrishna',
        status: day === 0 && i === 0 ? 'Running' : n % 6 === 0 ? 'Failed' : 'Success',
        startedOn: at(day, 8 + i),
        durationSeconds: 40 + ((n * 37) % 300),
      });
    }
  }
  return records.sort((a, b) => b.startedOn.localeCompare(a.startedOn));
}
