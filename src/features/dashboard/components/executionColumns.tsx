import type { ColumnsType } from 'antd/es/table';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import type { ExecutionRecord } from '../types/dashboard.types';

export const EXECUTION_COLUMNS: ColumnsType<ExecutionRecord> = [
  {
    title: 'Runbook',
    dataIndex: 'runbookName',
    sorter: (a, b) => a.runbookName.localeCompare(b.runbookName),
  },
  {
    title: 'Target',
    dataIndex: 'target',
    render: (target: string) => <span className="font-mono text-[12.5px]">{target}</span>,
    sorter: (a, b) => a.target.localeCompare(b.target),
  },
  { title: 'Triggered By', dataIndex: 'triggeredBy' },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (s: string) => <StatusTag status={s} />,
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Started On',
    dataIndex: 'startedOn',
    render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
    sorter: (a, b) => a.startedOn.localeCompare(b.startedOn),
  },
  {
    title: 'Duration',
    dataIndex: 'durationSeconds',
    align: 'right',
    render: (s: number) => <span className="tabular-nums">{formatDuration(s)}</span>,
    sorter: (a, b) => a.durationSeconds - b.durationSeconds,
  },
];
