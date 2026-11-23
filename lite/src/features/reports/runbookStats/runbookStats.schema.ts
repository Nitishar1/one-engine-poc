/**
 * Runbook Stats types and form rules (Reports > Runbook Stats > Dashboard / Stats).
 *
 * Functionality:
 * - RunbookDashboard: totals, repositories by type, daily runs, most-run runbooks, recent runs.
 * - RunbookTool / RunbookOption: the Tools Name and Runbook dropdowns on the Stats page.
 * - RunbookActivity: one runbook run, shown as an overview with expandable stages; each stage
 *   has its own timeline events and log lines.
 * - statsFilterSchema validates the Stats filter (Runbook is required).
 * Field names follow the OneEngine.Api style (xxxID) so the real API can replace the dummy data.
 */
import { z } from 'zod';

export type RunStatus = 'Success' | 'Failed' | 'Running' | 'Skipped';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

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

export interface RunbookTool {
  toolID: number;
  toolName: string;
}

/** A run of a runbook; shown as "<runbookName>_<DD MMM YYYY>" like the old page. */
export interface RunbookOption {
  runbookID: number;
  runbookName: string;
  toolID: number;
  executedOn: string;
}

export const statsFilterSchema = z.object({
  toolId: z.string(),
  runbookId: z.string().min(1, 'Runbook is required'),
});

export type StatsFilterValues = z.infer<typeof statsFilterSchema>;

// ---------------------------------------------------------------- activity

/** One entry of a stage timeline, e.g. "OneEngine-Starting Runbook ExtractInformation". */
export interface ActivityEvent {
  eventID: number;
  title: string;
  message: string;
  status: RunStatus;
  occurredOn: string;
}

export interface LogLine {
  loggedOn: string;
  level: LogLevel;
  message: string;
}

export interface ActivityStage {
  stageID: number;
  stageName: string;
  status: RunStatus;
  startedOn: string;
  durationSeconds: number;
  events: ActivityEvent[];
  logs: LogLine[];
}

export interface RunbookActivity {
  runbookID: number;
  runbookName: string;
  toolName: string;
  target: string;
  triggeredBy: string;
  status: RunStatus;
  startedOn: string;
  durationSeconds: number;
  stages: ActivityStage[];
}
