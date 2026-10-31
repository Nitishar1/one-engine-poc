import { useCallback, useState } from 'react';
import { DatePicker, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { EXECUTION_COLUMNS } from '@/features/dashboard/components/executionColumns';
import { DATE_FORMAT } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import { useExecutionReport } from '../hooks/useReports';
import type { ExecutionRecord, ExecutionReportFilters } from '../types/report.types';
import { exportCsv } from '../utils/exportCsv';

export default function ExecutionReportPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);
  const [status, setStatus] = useState<ExecutionReportFilters['status']>();
  const filters: ExecutionReportFilters = {
    from: range[0].format('YYYY-MM-DD'),
    to: range[1].format('YYYY-MM-DD'),
    status,
  };
  const report = useExecutionReport(filters);

  const searchValues = useCallback(
    (r: ExecutionRecord) => [
      r.runbookName,
      r.target,
      r.triggeredBy,
      r.status,
      formatDateTime(r.startedOn),
    ],
    [],
  );

  const onExport = () =>
    exportCsv(
      `execution-report_${filters.from}_${filters.to}.csv`,
      ['Runbook', 'Target', 'Triggered By', 'Status', 'Started On', 'Duration (s)'],
      (report.data ?? []).map((r) => [
        r.runbookName,
        r.target,
        r.triggeredBy,
        r.status,
        formatDateTime(r.startedOn),
        r.durationSeconds,
      ]),
    );

  const filtersBar = (
    <>
      <DatePicker.RangePicker
        aria-label="Date range"
        value={range}
        format={DATE_FORMAT}
        allowClear={false}
        disabledDate={(d) => d.isAfter(dayjs(), 'day')}
        onChange={(v) => v?.[0] && v[1] && setRange([v[0], v[1]])}
        presets={[
          { label: 'Today', value: [dayjs(), dayjs()] },
          { label: 'Last 7 days', value: [dayjs().subtract(6, 'day'), dayjs()] },
          { label: 'Last 14 days', value: [dayjs().subtract(13, 'day'), dayjs()] },
          { label: 'Last 30 days', value: [dayjs().subtract(29, 'day'), dayjs()] },
        ]}
        className="max-sm:!w-full"
      />
      <Select
        aria-label="Status"
        allowClear
        placeholder="All statuses"
        value={status}
        onChange={setStatus}
        className="!w-[150px] max-sm:!w-full"
        options={['Success', 'Failed', 'Running'].map((s) => ({ label: s, value: s }))}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title="Execution Report"
        description="Runbook executions for the selected period. Filter, search and export to CSV."
        actions={
          <AppButton
            tone="secondary"
            icon={<Download size={15} />}
            onClick={onExport}
            disabled={!report.data?.length}
          >
            Export CSV
          </AppButton>
        }
      />
      <AppCard bodyClassName="p-4">
        <AppTable<ExecutionRecord>
          rowKey="id"
          columns={EXECUTION_COLUMNS}
          data={report.data}
          loading={report.isFetching}
          error={report.error}
          onRetry={() => void report.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search runbook, target or user…"
          toolbar={filtersBar}
          emptyText="No executions in this period"
          emptyDescription="Widen the date range or clear the status filter."
        />
      </AppCard>
    </>
  );
}
