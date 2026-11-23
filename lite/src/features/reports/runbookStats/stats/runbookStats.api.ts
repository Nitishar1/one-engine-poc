/**
 * Runbook Stats API.
 *
 * Functionality:
 * - useRunbookDashboard():        totals, repositories by type, daily runs, top / recent runs
 * - useRunbookTools():            Tools Name dropdown
 * - useRunbooks(toolId):          Runbook dropdown for the selected tool
 * - useRunbookActivity(runbookId): overview + stages (timeline and logs) of one run
 *
 * FOR NOW EVERY HOOK RETURNS THE DUMMY DATA BELOW. To use the real API, replace the body of
 * the matching `fetch...` function with the http call written in its TODO comment and delete
 * the dummy data. The pages only use the hooks, so they don't change.
 */
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type {
  ActivityEvent,
  ActivityStage,
  LogLine,
  RunbookActivity,
  RunbookDashboard,
  RunbookOption,
  RunbookTool,
  RunStatus,
} from './runbookStats.schema';

// ================================================================= DUMMY DATA (remove later)

/** Waits like a network call so loading states can be seen. */
const fakeDelay = <T>(data: T, ms = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

const DUMMY_TOOLS: RunbookTool[] = [
  { toolID: 1, toolName: 'Other Tools' },
  { toolID: 2, toolName: 'Azure' },
  { toolID: 3, toolName: 'ServiceNow' },
];

const DUMMY_RUNBOOKS: RunbookOption[] = [
  {
    runbookID: 101,
    runbookName: 'ExtractInformation',
    toolID: 1,
    executedOn: '2026-02-03T12:00:00',
  },
  {
    runbookID: 102,
    runbookName: 'ExtractInformation',
    toolID: 1,
    executedOn: '2026-01-09T09:30:00',
  },
  {
    runbookID: 103,
    runbookName: 'ExtractInformation',
    toolID: 1,
    executedOn: '2025-12-17T15:10:00',
  },
  { runbookID: 104, runbookName: 'testrunbook', toolID: 1, executedOn: '2025-12-17T16:45:00' },
  {
    runbookID: 105,
    runbookName: 'Azure-ExtractInformation',
    toolID: 2,
    executedOn: '2026-02-05T11:20:00',
  },
  {
    runbookID: 106,
    runbookName: 'IncidentAutoTriage',
    toolID: 3,
    executedOn: '2026-02-06T08:05:00',
  },
];

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
      runbookID: 106,
      runbookName: 'IncidentAutoTriage',
      toolName: 'ServiceNow',
      status: 'Running',
      startedOn: '2026-02-06T08:05:00',
      durationSeconds: 95,
    },
    {
      runbookID: 105,
      runbookName: 'Azure-ExtractInformation',
      toolName: 'Azure',
      status: 'Success',
      startedOn: '2026-02-05T11:20:00',
      durationSeconds: 214,
    },
    {
      runbookID: 101,
      runbookName: 'ExtractInformation',
      toolName: 'Other Tools',
      status: 'Success',
      startedOn: '2026-02-03T12:00:00',
      durationSeconds: 168,
    },
    {
      runbookID: 102,
      runbookName: 'ExtractInformation',
      toolName: 'Other Tools',
      status: 'Success',
      startedOn: '2026-01-09T09:30:00',
      durationSeconds: 151,
    },
    {
      runbookID: 104,
      runbookName: 'testrunbook',
      toolName: 'Other Tools',
      status: 'Failed',
      startedOn: '2025-12-17T16:45:00',
      durationSeconds: 47,
    },
  ],
};

/** Stages every dummy run goes through; [name, seconds, what it logs]. */
const STAGE_PLAN: Array<[string, number, string]> = [
  ['Start runbook', 4, 'Started the Runbook!!!'],
  ['Parse runbook', 9, 'Parsing the Runbook Links for execution.'],
  ['Connect to target', 21, 'Connected to the target server.'],
  ['Run activities', 96, 'Ran every activity of the runbook.'],
  ['Validate output', 25, 'Output matches the expected format.'],
  ['Complete', 6, 'Runbook finished and the report was saved.'],
];

/** Builds a believable run: testrunbook fails at "Connect to target", 106 is still running. */
function buildDummyActivity(option: RunbookOption, toolName: string): RunbookActivity {
  const failAt = option.runbookName === 'testrunbook' ? 2 : -1;
  const runningAt = option.runbookID === 106 ? 3 : -1;
  let clock = dayjs(option.executedOn);
  let eventID = 1;

  const stages: ActivityStage[] = STAGE_PLAN.map(([stageName, seconds, done], index) => {
    const startedOn = clock.toISOString();
    const status: RunStatus =
      (failAt >= 0 && index > failAt) || (runningAt >= 0 && index > runningAt)
        ? 'Skipped'
        : index === failAt
          ? 'Failed'
          : index === runningAt
            ? 'Running'
            : 'Success';
    const at = (s: number) => clock.add(s, 'second').toISOString();
    const name = option.runbookName;

    const events: ActivityEvent[] =
      status === 'Skipped'
        ? []
        : [
            {
              eventID: eventID++,
              title: `OneEngine-${stageName} ${name}`,
              message: `${stageName} started.`,
              status: 'Success',
              occurredOn: at(0),
            },
            {
              eventID: eventID++,
              title: `OneEngine-${stageName} ${name}`,
              message:
                status === 'Failed'
                  ? 'Could not connect to the target: the host did not answer within 20 seconds.'
                  : status === 'Running'
                    ? 'Still running...'
                    : done,
              status,
              occurredOn: at(Math.max(1, seconds - 1)),
            },
          ];

    const logs: LogLine[] =
      status === 'Skipped'
        ? [
            {
              loggedOn: startedOn,
              level: 'INFO',
              message: 'Skipped: an earlier stage did not finish.',
            },
          ]
        : [
            { loggedOn: at(0), level: 'INFO', message: `[${name}] ${stageName}: begin` },
            {
              loggedOn: at(1),
              level: 'DEBUG',
              message: `Tool=${toolName} RunbookID=${option.runbookID}`,
            },
            ...(index === 3
              ? ([
                  {
                    loggedOn: at(20),
                    level: 'INFO',
                    message: 'Activity 1/3 ReadInventory: 128 rows',
                  },
                  {
                    loggedOn: at(48),
                    level: 'WARN',
                    message: 'Activity 2/3 ReadServices: 2 hosts slow (> 5s)',
                  },
                  { loggedOn: at(90), level: 'INFO', message: 'Activity 3/3 BuildReport: done' },
                ] satisfies LogLine[])
              : []),
            status === 'Failed'
              ? {
                  loggedOn: at(seconds),
                  level: 'ERROR',
                  message: 'Connection timed out after 20000 ms (10.131.10.40:5986)',
                }
              : status === 'Running'
                ? {
                    loggedOn: at(seconds),
                    level: 'INFO',
                    message: 'Waiting for activity results...',
                  }
                : {
                    loggedOn: at(seconds),
                    level: 'INFO',
                    message: `[${name}] ${stageName}: end (${seconds}s)`,
                  },
          ];

    if (status !== 'Skipped') clock = clock.add(seconds, 'second');
    return {
      stageID: index + 1,
      stageName,
      status,
      startedOn,
      durationSeconds: status === 'Skipped' ? 0 : seconds,
      events,
      logs,
    };
  });

  return {
    runbookID: option.runbookID,
    runbookName: option.runbookName,
    toolName,
    target: option.toolID === 2 ? 'azure-prod-rg01' : 'OELAB-SRV-01',
    triggeredBy: 'SuperUser',
    status: failAt >= 0 ? 'Failed' : runningAt >= 0 ? 'Running' : 'Success',
    startedOn: dayjs(option.executedOn).toISOString(),
    durationSeconds: stages.reduce((sum, s) => sum + s.durationSeconds, 0),
    stages,
  };
}

// ================================================================= API calls

// TODO real API: return http.get<RunbookDashboard>('/runbookstats/dashboard', undefined, { signal });
const fetchDashboard = (_signal?: AbortSignal) => fakeDelay(DUMMY_DASHBOARD);

// TODO real API: return http.get<RunbookTool[]>('/runbookstats/tools', undefined, { signal });
const fetchTools = (_signal?: AbortSignal) => fakeDelay(DUMMY_TOOLS, 250);

// TODO real API: return http.get<RunbookOption[]>(resourcePath('/runbookstats/tools', toolId, 'runbooks'), undefined, { signal });
const fetchRunbooks = (toolId: string, _signal?: AbortSignal) =>
  fakeDelay(
    DUMMY_RUNBOOKS.filter((r) => !toolId || String(r.toolID) === toolId),
    250,
  );

// TODO real API: return http.get<RunbookActivity>(resourcePath('/runbookstats/runbooks', runbookId, 'activity'), undefined, { signal });
const fetchActivity = (runbookId: string, _signal?: AbortSignal) => {
  const option = DUMMY_RUNBOOKS.find((r) => String(r.runbookID) === runbookId);
  if (!option) return Promise.reject(new Error('Runbook not found'));
  const tool = DUMMY_TOOLS.find((t) => t.toolID === option.toolID)?.toolName ?? '-';
  return fakeDelay(buildDummyActivity(option, tool), 600);
};

// ================================================================= hooks (used by the pages)

export const useRunbookDashboard = () =>
  useQuery({
    queryKey: ['runbook-stats', 'dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
  });

export const useRunbookTools = () =>
  useQuery({
    queryKey: ['runbook-stats', 'tools'],
    queryFn: ({ signal }) => fetchTools(signal),
    staleTime: Infinity,
  });

export const useRunbooks = (toolId: string) =>
  useQuery({
    queryKey: ['runbook-stats', 'runbooks', toolId],
    queryFn: ({ signal }) => fetchRunbooks(toolId, signal),
  });

/** Loads only after Submit (runbookId set). */
export const useRunbookActivity = (runbookId?: string) =>
  useQuery({
    queryKey: ['runbook-stats', 'activity', runbookId],
    queryFn: ({ signal }) => fetchActivity(runbookId as string, signal),
    enabled: Boolean(runbookId),
  });

/** "ExtractInformation_03 Feb 2026", the label used by the old Runbook dropdown. */
export const runbookLabel = (r: Pick<RunbookOption, 'runbookName' | 'executedOn'>) =>
  `${r.runbookName}_${dayjs(r.executedOn).format('DD MMM YYYY')}`;
