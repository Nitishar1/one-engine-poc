/**
 * Runbook Stats types and form rules (Reports > Runbook Stats > Dashboard / Stats).
 *
 * Functionality:
 * - RunbookDashboard: totals, repositories by type, daily runs, most-run runbooks, recent runs.
 * - RunbookOption: the Runbook dropdown on the Stats page.
 * - statsFilterSchema: Runbooks (All or several), Request Type (optional), From / To dates
 *   (required, From <= To).
 * - RunbookTrigger: one row of the grid (one execution: start / end time, executed by).
 * - TriggerProcess: one step of an execution (pop-up timeline) with its date and time, input
 *   parameters and output. Field names are exactly as the API sends them.
 * - TriggerLog: one entry of the execution log (pop-up Logs tab).
 */
import dayjs from 'dayjs';
import { z } from 'zod';

export type RunStatus = 'Success' | 'Failed' | 'Running' | 'Skipped';

// ---------------------------------------------------------------- dashboard

export interface RepositoryTypeCount {
  /** C#, PowerShell, SSH ... */
  typeName: string;
  count: number;
}

export interface DailyRunPoint {
  /** e.g. "03 Feb" */
  date: string;
  success: number;
  failed: number;
}

export interface TopRunbook {
  runbookName: string;
  runs: number;
  successRate: number;
}

export interface RecentRun {
  runbookID: number;
  runbookName: string;
  toolName: string;
  status: RunStatus;
  startedOn: string;
  durationSeconds: number;
}

export interface RunbookDashboard {
  totalSolutionRepositories: number;
  totalRunbooks: number;
  repositoriesByType: RepositoryTypeCount[];
  dailyRuns: DailyRunPoint[];
  topRunbooks: TopRunbook[];
  recentRuns: RecentRun[];
}

// ---------------------------------------------------------------- stats filter

export interface RunbookOption {
  runbookID: number;
  runbookName: string;
}

/** Value of the "All runbooks" choice in the Runbook multi-select. */
export const ALL_RUNBOOKS = 'all';

export const statsFilterSchema = z
  .object({
    /** ['all'] or one or more runbook ids. */
    runbookIds: z.array(z.string()).min(1, 'Select All or at least one runbook'),
    /** '' = all request types. */
    requestType: z.string(),
    /** YYYY-MM-DD */
    fromDate: z.string().min(1, 'From Date is required'),
    toDate: z.string().min(1, 'To Date is required'),
  })
  .refine((f) => !f.fromDate || !f.toDate || !dayjs(f.toDate).isBefore(f.fromDate), {
    path: ['toDate'],
    message: 'To Date must be on or after From Date',
  });

export type StatsFilterValues = z.infer<typeof statsFilterSchema>;

// ---------------------------------------------------------------- grid + pop-up

export type TriggerStatus = 'Success' | 'Failed' | 'Running';

/** One row of the Stats grid (one execution of a runbook). */
export interface RunbookTrigger {
  runbookTriggerID: number;
  runbookID: number;
  runbookName: string;
  requestType: string;
  monitoringToolName: string;
  schedulerName: string;
  status: TriggerStatus;
  /** Short result message of the execution. */
  logs: string;
  executionStartTime: string;
  /** null while the runbook is still running. */
  executionEndTime: string | null;
  executedBy: string;
}

export interface ProcessParameter {
  ParameterName: string;
  ParameterValue: string;
}

/**
 * One step of an execution: [{ "ProcessName": "START", "inputs": [...], "output": "",
 * "ExecutedOn": "2026-11-25T12:39:05" }]. START and END show no inputs / output.
 */
export interface TriggerProcess {
  ProcessName: string;
  inputs: ProcessParameter[];
  output: string;
  /** When the process ran (date and time). */
  ExecutedOn: string;
}

/** One entry of the execution log, shown in the pop-up like the old timeline report. */
export interface TriggerLog {
  logID: number;
  /** e.g. "OneEngine-Initializing Variables, Runbook ExtractInformation" */
  title: string;
  /** e.g. "Initializing the Tool and User Defined Variables." */
  message: string;
  status: TriggerStatus;
  loggedOn: string;
}
