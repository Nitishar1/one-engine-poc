/**
 * Runbook Stats API.
 *
 * Functionality:
 * - useRunbookDashboard():            totals, repositories by type, daily runs, top / recent runs
 * - useRunbooks():                    Runbook dropdown on the Stats page
 * - useRunbookTriggers(filter):       grid rows for a runbook (or all) between two dates
 * - useTriggerProcesses(triggerId):   processes of one trigger (pop-up timeline, inputs, output)
 *
 * FOR NOW EVERY HOOK RETURNS THE DUMMY DATA BELOW. To use the real API, replace the body of
 * the matching `fetch...` function with the http call written in its TODO comment and delete
 * the dummy data. The pages only use the hooks, so they don't change.
 */
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type {
  RunbookDashboard,
  RunbookOption,
  RunbookTrigger,
  StatsFilterValues,
  TriggerProcess,
  TriggerStatus,
} from './runbookStats.schema';

// ================================================================= DUMMY DATA (remove later)

/** Waits like a network call so loading states can be seen. */
const fakeDelay = <T>(data: T, ms = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

const DUMMY_DASHBOARD: RunbookDashboard = {
  totalSolutionRepositories: 26,
  totalRunbooks: 36,
  repositoriesByType: [
    { typeName: 'C#', count: 5 },
    { typeName: 'PowerShell', count: 5 },
    { typeName: 'SSH', count: 16 },
  ],
  dailyRuns: Array.from({ length: 14 }, (_, i) => ({
    date: dayjs('2026-02-06')
      .subtract(13 - i, 'day')
      .format('DD MMM'),
    success: [6, 8, 5, 9, 11, 7, 4, 10, 12, 9, 8, 13, 11, 9][i],
    failed: [1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0, 2][i],
  })),
  topRunbooks: [
    { runbookName: 'ExtractInformation', runs: 42, successRate: 95 },
    { runbookName: 'Azure-ExtractInformation', runs: 31, successRate: 90 },
    { runbookName: 'IncidentAutoTriage', runs: 24, successRate: 88 },
    { runbookName: 'DiskCleanup', runs: 17, successRate: 100 },
    { runbookName: 'testrunbook', runs: 9, successRate: 56 },
  ],
  recentRuns: [
    {
      runbookID: 3,
      runbookName: 'IncidentAutoTriage',
      toolName: 'ServiceNow',
      status: 'Running',
      startedOn: '2026-02-06T08:05:00',
      durationSeconds: 95,
    },
    {
      runbookID: 2,
      runbookName: 'Azure-ExtractInformation',
      toolName: 'Azure',
      status: 'Success',
      startedOn: '2026-02-05T11:20:00',
      durationSeconds: 214,
    },
    {
      runbookID: 1,
      runbookName: 'ExtractInformation',
      toolName: 'Other Tools',
      status: 'Success',
      startedOn: '2026-02-03T12:00:00',
      durationSeconds: 168,
    },
    {
      runbookID: 1,
      runbookName: 'ExtractInformation',
      toolName: 'Other Tools',
      status: 'Success',
      startedOn: '2026-01-09T09:30:00',
      durationSeconds: 151,
    },
    {
      runbookID: 5,
      runbookName: 'testrunbook',
      toolName: 'Other Tools',
      status: 'Failed',
      startedOn: '2025-12-17T16:45:00',
      durationSeconds: 47,
    },
  ],
};

const DUMMY_RUNBOOKS: RunbookOption[] = [
  { runbookID: 1, runbookName: 'ExtractInformation' },
  { runbookID: 2, runbookName: 'Azure-ExtractInformation' },
  { runbookID: 3, runbookName: 'IncidentAutoTriage' },
  { runbookID: 4, runbookName: 'DiskCleanup' },
  { runbookID: 5, runbookName: 'testrunbook' },
];

const REQUEST_TYPES = ['Incident', 'Service Request', 'Change', 'Scheduled'];
const MONITORING_TOOLS = ['SolarWinds', 'Nagios', 'Azure Monitor', 'ServiceNow'];
const SCHEDULERS = ['OE-Scheduler-01', 'OE-Scheduler-02', 'Manual'];
const USERS = ['SuperUser', 'superadmin', 'system'];

/** 48 triggers over the last 45 days (dates relative to today so the default range has data). */
const DUMMY_TRIGGERS: RunbookTrigger[] = Array.from({ length: 48 }, (_, i) => {
  const runbook = DUMMY_RUNBOOKS[(i * 7) % DUMMY_RUNBOOKS.length];
  const createdOn = dayjs()
    .subtract(Math.floor(i * 0.95), 'day')
    .hour(8 + ((i * 5) % 11))
    .minute((i * 13) % 60)
    .second(0);
  const status: TriggerStatus =
    i < 2 ? 'Running' : runbook.runbookName === 'testrunbook' || i % 9 === 4 ? 'Failed' : 'Success';
  const logs =
    status === 'Running'
      ? 'Runbook is running: waiting for ExtractInformation to finish.'
      : status === 'Failed'
        ? 'ConnectTarget failed: the host did not answer within 20 seconds.'
        : `Completed ${5 + (i % 4)} processes successfully.`;
  return {
    runbookTriggerID: 5000 - i,
    runbookID: runbook.runbookID,
    runbookName: runbook.runbookName,
    requestType: REQUEST_TYPES[i % REQUEST_TYPES.length],
    monitoringToolName: MONITORING_TOOLS[(i * 3) % MONITORING_TOOLS.length],
    schedulerName: SCHEDULERS[i % SCHEDULERS.length],
    status,
    logs,
    createdBy: USERS[i % USERS.length],
    createdOn: createdOn.toISOString(),
    modifiedBy: USERS[(i + 1) % USERS.length],
    modifiedOn: createdOn.add(2 + (i % 5), 'minute').toISOString(),
  };
});

/** Processes of a trigger; a failed trigger stops at ConnectTarget, a running one at Extract. */
function buildDummyProcesses(trigger: RunbookTrigger): TriggerProcess[] {
  const host = `OELAB-SRV-0${(trigger.runbookTriggerID % 4) + 1}`;
  const all: TriggerProcess[] = [
    {
      ProcessName: 'START',
      inputs: [
        { ParameterName: 'RunbookName', ParameterValue: trigger.runbookName },
        { ParameterName: 'RequestType', ParameterValue: trigger.requestType },
      ],
      output: 'Runbook started.',
    },
    {
      ProcessName: 'ValidateInputs',
      inputs: [
        { ParameterName: 'p1', ParameterValue: '1' },
        { ParameterName: 'p2', ParameterValue: '2' },
      ],
      output: 'All inputs are valid.',
    },
    {
      ProcessName: 'ConnectTarget',
      inputs: [
        { ParameterName: 'ServerName', ParameterValue: host },
        { ParameterName: 'Port', ParameterValue: '5986' },
        { ParameterName: 'TimeoutSeconds', ParameterValue: '20' },
      ],
      output:
        trigger.status === 'Failed'
          ? 'ERROR: Connection timed out after 20000 ms.'
          : `Connected to ${host}.`,
    },
    {
      ProcessName: 'ExtractInformation',
      inputs: [
        { ParameterName: 'Query', ParameterValue: 'Get-Service | Where Status -eq Stopped' },
        { ParameterName: 'MaxRows', ParameterValue: '500' },
      ],
      output: trigger.status === 'Running' ? '' : '{ "servicesStopped": 3, "rows": 128 }',
    },
    {
      ProcessName: 'SendNotification',
      inputs: [
        { ParameterName: 'Channel', ParameterValue: 'Email' },
        { ParameterName: 'To', ParameterValue: 'oneengine-ops@example.com' },
      ],
      output: 'Notification sent.',
    },
    { ProcessName: 'END', inputs: [], output: 'Runbook finished.' },
  ];
  if (trigger.status === 'Failed') return all.slice(0, 3);
  if (trigger.status === 'Running') return all.slice(0, 4);
  return all;
}

// ================================================================= API calls

// TODO real API: return http.get<RunbookDashboard>('/runbookstats/dashboard', undefined, { signal });
const fetchDashboard = (_signal?: AbortSignal) => fakeDelay(DUMMY_DASHBOARD);

// TODO real API: return http.get<RunbookOption[]>('/runbookstats/runbooks', undefined, { signal });
const fetchRunbooks = (_signal?: AbortSignal) => fakeDelay(DUMMY_RUNBOOKS, 250);

// TODO real API: return http.get<RunbookTrigger[]>('/runbookstats/triggers', filter, { signal });
//   (sends ?runbookId=&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD)
const fetchTriggers = (filter: StatsFilterValues, _signal?: AbortSignal) =>
  fakeDelay(
    DUMMY_TRIGGERS.filter((t) => {
      const day = dayjs(t.createdOn).format('YYYY-MM-DD');
      return (
        (!filter.runbookId || String(t.runbookID) === filter.runbookId) &&
        day >= filter.fromDate &&
        day <= filter.toDate
      );
    }),
    500,
  );

// TODO real API: return http.get<TriggerProcess[]>(resourcePath('/runbookstats/triggers', triggerId, 'processes'), undefined, { signal });
const fetchProcesses = (triggerId: number, _signal?: AbortSignal) => {
  const trigger = DUMMY_TRIGGERS.find((t) => t.runbookTriggerID === triggerId);
  return trigger
    ? fakeDelay(buildDummyProcesses(trigger), 350)
    : Promise.reject(new Error('Trigger not found'));
};

// ================================================================= hooks (used by the pages)

export const useRunbookDashboard = () =>
  useQuery({
    queryKey: ['runbook-stats', 'dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
  });

export const useRunbooks = () =>
  useQuery({
    queryKey: ['runbook-stats', 'runbooks'],
    queryFn: ({ signal }) => fetchRunbooks(signal),
    staleTime: Infinity,
  });

/** Loads only after Search (filter set). */
export const useRunbookTriggers = (filter?: StatsFilterValues) =>
  useQuery({
    queryKey: ['runbook-stats', 'triggers', filter],
    queryFn: ({ signal }) => fetchTriggers(filter as StatsFilterValues, signal),
    enabled: Boolean(filter),
  });

/** Loads when the pop-up opens for a trigger. */
export const useTriggerProcesses = (triggerId?: number) =>
  useQuery({
    queryKey: ['runbook-stats', 'processes', triggerId],
    queryFn: ({ signal }) => fetchProcesses(triggerId as number, signal),
    enabled: triggerId !== undefined,
  });
