import type { Runbook } from '@/features/workflows/types/workflow.types';

export const runbookRolesSeed = ['Admin', 'Operator', 'L1 Support', 'L2 Support', 'Change Manager'];

export const runbooksSeed: Runbook[] = [
  {
    id: 'rb_restart',
    name: 'Restart IIS Service',
    roles: ['Admin', 'L2 Support'],
    description: 'Checks the health endpoint and restarts the service when it is unhealthy.',
    definition: {
      nodes: [
        { id: 'n_start', type: 'start', position: { x: 40, y: 120 }, data: { label: 'Start' } },
        {
          id: 'n_health',
          type: 'action',
          position: { x: 230, y: 110 },
          data: {
            label: 'healthCheck',
            agentId: 'ag_health',
            platform: 'windows',
            parameters: { Url: 'https://localhost/health' },
            timeoutSeconds: 60,
            retries: 1,
            continueOnError: false,
          },
        },
        {
          id: 'n_cond',
          type: 'condition',
          position: { x: 450, y: 100 },
          data: { label: 'Healthy?', expression: 'output.statusCode == 200' },
        },
        {
          id: 'n_restart',
          type: 'action',
          position: { x: 680, y: 220 },
          data: {
            label: 'StartServiceProcess',
            agentId: 'ag_start',
            platform: 'windows',
            parameters: { ServiceName: 'W3SVC' },
            timeoutSeconds: 120,
            retries: 2,
            continueOnError: false,
          },
        },
        { id: 'n_end', type: 'end', position: { x: 920, y: 120 }, data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: 'n_start', target: 'n_health' },
        { id: 'e2', source: 'n_health', target: 'n_cond' },
        { id: 'e3', source: 'n_cond', sourceHandle: 'true', target: 'n_end', label: 'Yes' },
        { id: 'e4', source: 'n_cond', sourceHandle: 'false', target: 'n_restart', label: 'No' },
        { id: 'e5', source: 'n_restart', target: 'n_end' },
      ],
    },
    modifiedBy: 'admin',
    modifiedOn: '2026-10-28T18:42:10',
  },
];
