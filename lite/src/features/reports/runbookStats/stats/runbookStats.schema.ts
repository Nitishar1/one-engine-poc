/**
 * Runbook Stats types and form rules (Reports > Runbook Stats > Dashboard / Stats).
 *
 * Functionality:
 * - RunbookDashboard: totals, repositories by type, daily runs, most-run runbooks, recent runs.
 * - RunbookOption: the Runbook dropdown on the Stats page.
 * - statsFilterSchema: Stats filter (Runbook optional, From / To dates required, From <= To).
 * - RunbookTrigger: one row of the Stats grid (one time a runbook was triggered).
 * - TriggerProcess: one step of a trigger, shown as a timeline in the details pop-up, with its
 *   input parameters and output. Field names are exactly as the API sends them.
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

export const statsFilterSchema = z
  .object({
    /** '' = all runbooks. */
    runbookId: z.string(),
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

/** One row of the Stats grid. */
export interface RunbookTrigger {
  runbookTriggerID: number;
  runbookID: number;
  runbookName: string;
  requestType: string;
  monitoringToolName: string;
  schedulerName: string;
  status: TriggerStatus;
  /** Short log / result message of the trigger. */
  logs: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
}

export interface ProcessParameter {
  ParameterName: string;
  ParameterValue: string;
}

/** One step of a trigger: [{ "ProcessName": "START", "inputs": [...], "output": "" }]. */
export interface TriggerProcess {
  ProcessName: string;
  inputs: ProcessParameter[];
  output: string;
}
