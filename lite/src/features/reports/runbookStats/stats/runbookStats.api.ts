/**
 * Runbook Stats API.
 *
 * Functionality:
 * - useRunbookDashboard():            totals, repositories by type, daily runs, top / recent runs
 * - useRunbooks():                    Runbook multi-select on the Stats page
 * - useRequestTypes():                Request Type dropdown
 * - useRunbookTriggers(filter):       grid rows for the selected runbooks (or all), request type
 *                                     and dates
 * - useTriggerProcesses(triggerId):   processes of one execution (pop-up timeline, date and time,
 *                                     inputs, output)
 * - useTriggerLogs(triggerId):        log entries of one execution (pop-up Logs tab)
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
  TriggerLog,
  TriggerProcess,
  TriggerStatus,
} from './runbookStats.schema';
import { ALL_REQUEST_TYPES, ALL_RUNBOOKS } from './runbookStats.schema';

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

const REQUEST_TYPES = ['Web', 'Scheduled'];
/** Who runs it depends on the request type: Web -> system, Scheduled -> scheduler. */
const EXECUTED_BY: Record<string, string> = { Web: 'system', Scheduled: 'scheduler' };
const MONITORING_TOOLS = ['SolarWinds', 'Nagios', 'Azure Monitor', 'ServiceNow'];
const SCHEDULERS = ['OE-Scheduler-01', 'OE-Scheduler-02', 'Manual'];

/** 48 executions over the last 45 days (dates relative to today so the default range has data). */
const DUMMY_TRIGGERS: RunbookTrigger[] = Array.from({ length: 48 }, (_, i) => {
  const runbook = DUMMY_RUNBOOKS[(i * 7) % DUMMY_RUNBOOKS.length];
  const start = dayjs()
    .subtract(Math.floor(i * 0.95), 'day')
    .hour(8 + ((i * 5) % 11))
    .minute((i * 13) % 60)
    .second((i * 17) % 60);
  const requestType = REQUEST_TYPES[i % REQUEST_TYPES.length];
  const status: TriggerStatus =
    i < 2 ? 'Running' : runbook.runbookName === 'testrunbook' || i % 9 === 4 ? 'Failed' : 'Success';
  const logs =
    status === 'Running'
      ? 'Runbook is running: waiting for EntityExtractorAgent to finish.'
      : status === 'Failed'
        ? 'ConnectTarget failed: the host did not answer within 20 seconds.'
        : 'Completed the Runbook Execution.';
  return {
    runbookTriggerID: 5000 - i,
    runbookID: runbook.runbookID,
    runbookName: runbook.runbookName,
    requestType,
    monitoringToolName: MONITORING_TOOLS[(i * 3) % MONITORING_TOOLS.length],
    schedulerName: SCHEDULERS[i % SCHEDULERS.length],
    status,
    logs,
    executionStartTime: start.toISOString(),
    executionEndTime:
      status === 'Running' ? null : start.add(40 + ((i * 29) % 200), 'second').toISOString(),
    executedBy: EXECUTED_BY[requestType],
  };
});

/** Seconds after the start at which each dummy process ran. */
const PROCESS_OFFSETS = [0, 3, 9, 31, 58, 61];

/** Processes of an execution; a failed one stops at ConnectTarget, a running one at Extract. */
function buildDummyProcesses(trigger: RunbookTrigger): TriggerProcess[] {
  const host = `OELAB-SRV-0${(trigger.runbookTriggerID % 4) + 1}`;
  const at = (i: number) =>
    dayjs(trigger.executionStartTime).add(PROCESS_OFFSETS[i], 'second').toISOString();
  const all: TriggerProcess[] = [
    { ProcessName: 'START', inputs: [], output: '', ExecutedOn: at(0) },
    {
      ProcessName: 'ValidateInputs',
      inputs: [
        { ParameterName: 'p1', ParameterValue: '1' },
        { ParameterName: 'p2', ParameterValue: '2' },
      ],
      output: 'All inputs are valid.',
      ExecutedOn: at(1),
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
      ExecutedOn: at(2),
    },
    {
      ProcessName: 'EntityExtractorAgent',
      inputs: [
        { ParameterName: 'Query', ParameterValue: 'Get-Service | Where Status -eq Stopped' },
        { ParameterName: 'MaxRows', ParameterValue: '500' },
      ],
      output: trigger.status === 'Running' ? '' : '{ "servicesStopped": 3, "rows": 128 }',
      ExecutedOn: at(3),
    },
    {
      ProcessName: 'SendNotification',
      inputs: [
        { ParameterName: 'Channel', ParameterValue: 'Email' },
        { ParameterName: 'To', ParameterValue: 'oneengine-ops@example.com' },
      ],
      output: 'Notification sent.',
      ExecutedOn: at(4),
    },
    { ProcessName: 'END', inputs: [], output: '', ExecutedOn: at(5) },
  ];
  if (trigger.status === 'Failed') return all.slice(0, 3);
  if (trigger.status === 'Running') return all.slice(0, 4);
  return all;
}

/** Log entries like the old OETimeLineReport page. */
function buildDummyLogs(trigger: RunbookTrigger): TriggerLog[] {
  const name = trigger.runbookName;
  const steps: Array<[string, string]> = [
    [`OneEngine-Starting Runbook ${name}`, 'Started the Runbook!!!'],
    [`OneEngine-Parsing Runbook ${name}`, 'Parsing the Runbook Links for execution.'],
    [`OneEngine-Parsed Runbook ${name}`, 'Parsed the Runbook Links successfully.'],
    [
      `OneEngine-Initializing Variables, Runbook ${name}`,
      'Initializing the Tool and User Defined Variables.',
    ],
    [
      `OneEngine-Initializing Variables Completed, Runbook ${name}`,
      'Completed Variable(s) Initialization.',
    ],
    [
      `OneEngine - EntityExtractorAgent Python Process, Runbook ${name}`,
      'Going to execute the Process.',
    ],
    [
      `OneEngine - EntityExtractorAgent Python Process Execution, Runbook ${name}`,
      'Completed the Process Execution.',
    ],
    [`OneEngine - End, Runbook ${name}`, 'Completed the Runbook Execution.'],
  ];
  const count = trigger.status === 'Failed' ? 5 : trigger.status === 'Running' ? 6 : steps.length;
  const logs: TriggerLog[] = steps.slice(0, count).map(([title, message], i) => ({
    logID: i + 1,
    title,
    message,
    status: trigger.status === 'Running' && i === count - 1 ? 'Running' : 'Success',
    loggedOn: dayjs(trigger.executionStartTime)
      .add(i * 7, 'second')
      .toISOString(),
  }));
  if (trigger.status === 'Failed') {
    logs.push({
      logID: count + 1,
      title: `OneEngine - ConnectTarget Failed, Runbook ${name}`,
      message: 'Could not connect to the target: the host did not answer within 20 seconds.',
      status: 'Failed',
      loggedOn: dayjs(trigger.executionStartTime)
        .add(count * 7, 'second')
        .toISOString(),
    });
  }
  return logs;
}

// ================================================================= API calls

// TODO real API: return http.get<RunbookDashboard>('/runbookstats/dashboard', undefined, { signal });
const fetchDashboard = (_signal?: AbortSignal) => fakeDelay(DUMMY_DASHBOARD);

// TODO real API: return http.get<RunbookOption[]>('/runbookstats/runbooks', undefined, { signal });
const fetchRunbooks = (_signal?: AbortSignal) => fakeDelay(DUMMY_RUNBOOKS, 250);

// TODO real API: return http.get<string[]>('/runbookstats/requesttypes', undefined, { signal });
const fetchRequestTypes = (_signal?: AbortSignal) => fakeDelay(REQUEST_TYPES, 250);

// TODO real API: return http.post<RunbookTrigger[]>('/runbookstats/executions', {
//   runbookIds: filter.runbookIds.includes(ALL_RUNBOOKS) ? [] : filter.runbookIds.map(Number),
//   requestType: filter.requestType === ALL_REQUEST_TYPES ? '' : filter.requestType, fromDate: filter.fromDate, toDate: filter.toDate,
// }, { signal });
const fetchTriggers = (filter: StatsFilterValues, _signal?: AbortSignal) => {
  const all = filter.runbookIds.includes(ALL_RUNBOOKS);
  return fakeDelay(
    DUMMY_TRIGGERS.filter((t) => {
      const day = dayjs(t.executionStartTime).format('YYYY-MM-DD');
      return (
        (all || filter.runbookIds.includes(String(t.runbookID))) &&
        (filter.requestType === ALL_REQUEST_TYPES || t.requestType === filter.requestType) &&
        day >= filter.fromDate &&
        day <= filter.toDate
      );
    }),
    500,
  );
};

const findTrigger = (triggerId: number) => {
  const trigger = DUMMY_TRIGGERS.find((t) => t.runbookTriggerID === triggerId);
  if (!trigger) throw new Error('Execution not found');
  return trigger;
};

// TODO real API: return http.get<TriggerProcess[]>(resourcePath('/runbookstats/executions', triggerId, 'processes'), undefined, { signal });
const fetchProcesses = async (triggerId: number, _signal?: AbortSignal) =>
  fakeDelay(buildDummyProcesses(findTrigger(triggerId)), 350);

// TODO real API: return http.get<TriggerLog[]>(resourcePath('/runbookstats/executions', triggerId, 'logs'), undefined, { signal });
const fetchLogs = async (triggerId: number, _signal?: AbortSignal) =>
  fakeDelay(buildDummyLogs(findTrigger(triggerId)), 350);

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

export const useRequestTypes = () =>
  useQuery({
    queryKey: ['runbook-stats', 'request-types'],
    queryFn: ({ signal }) => fetchRequestTypes(signal),
    staleTime: Infinity,
  });

/** Loads only after Search (filter set). */
export const useRunbookTriggers = (filter?: StatsFilterValues) =>
  useQuery({
    queryKey: ['runbook-stats', 'executions', filter],
    queryFn: ({ signal }) => fetchTriggers(filter as StatsFilterValues, signal),
    enabled: Boolean(filter),
  });

/** Loads when the pop-up opens for an execution. */
export const useTriggerProcesses = (triggerId?: number) =>
  useQuery({
    queryKey: ['runbook-stats', 'processes', triggerId],
    queryFn: ({ signal }) => fetchProcesses(triggerId as number, signal),
    enabled: triggerId !== undefined,
  });

/** Loads when the pop-up's Logs tab is opened. */
export const useTriggerLogs = (triggerId?: number) =>
  useQuery({
    queryKey: ['runbook-stats', 'logs', triggerId],
    queryFn: ({ signal }) => fetchLogs(triggerId as number, signal),
    enabled: triggerId !== undefined,
  });
