import type { Configuration, MenuItem } from '../api/types';

export const domains = ['LOCAL', 'CORP'];

/**
 * The sidebar the fake backend sends. Pages that exist in src/pages/index.ts open normally;
 * the others show "coming soon", which is how a menu added on the backend first appears.
 */
export const menus: MenuItem[] = [
  { key: 'configurations', label: 'Configurations', icon: 'settings', path: '/configurations' },
  {
    key: 'administration',
    label: 'Administration',
    icon: 'shield',
    children: [
      { key: 'users', label: 'Users', icon: 'users', path: '/administration/users' },
      { key: 'audit', label: 'Audit Log', icon: 'list', path: '/administration/audit' },
    ],
  },
];

export const configurations: Configuration[] = [
  {
    id: 'cfg-1',
    key: 'session.timeoutMinutes',
    value: '30',
    description: 'Minutes of inactivity before a user is signed out',
    updatedOn: '2026-11-01T09:30:00Z',
  },
  {
    id: 'cfg-2',
    key: 'runbook.maxParallelRuns',
    value: '5',
    description: 'How many runbooks can run at the same time',
    updatedOn: '2026-11-03T14:10:00Z',
  },
  {
    id: 'cfg-3',
    key: 'mail.smtpHost',
    value: 'smtp.example.com',
    description: 'Mail server used for notifications',
    updatedOn: '2026-11-05T11:45:00Z',
  },
];
