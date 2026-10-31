export type ExecutionStatus = 'Success' | 'Failed' | 'Running';

export interface ExecutionRecord {
  id: string;
  runbookName: string;
  target: string;
  triggeredBy: string;
  status: ExecutionStatus;
  startedOn: string;
  durationSeconds: number;
}

export interface DailyExecutionPoint {
  date: string;
  success: number;
  failed: number;
}

export interface DashboardSummary {
  totals: {
    agents: number;
    aiAgents: number;
    runbooks: number;
    configurationItems: number;
  };
  successRate: number;
  dailyExecutions: DailyExecutionPoint[];
  recentExecutions: ExecutionRecord[];
}
