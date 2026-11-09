import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Steps } from 'antd';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { IconSelect } from '@/components/common/IconSelect';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { dataSourceHooks } from '../dataSources/dataSource.api';
import { menuHooks } from '../menus/menu.api';
import { reportHooks } from './report.api';
import { reportSchema, STEP_ONE_FIELDS, type ReportFormValues } from './report.schema';

/** Add / edit report in two steps: 1 details, 2 query. */
export default function ReportFormPage() {
  const page = useEntityFormPage(reportHooks, ROUTES.reports);
  const menus = menuHooks.useList();
  const dataSources = dataSourceHooks.useList();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, trigger } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reportName: '', parentMenuId: '', dataSourceId: '', query: '' },
    values: page.entity
      ? {
          reportName: page.entity.reportName,
          parentMenuId: page.entity.parentMenuId,
          dataSourceId: page.entity.dataSourceId,
          icon: page.entity.icon,
          displayOrder: page.entity.displayOrder,
          query: page.entity.query,
        }
      : undefined,
  });

  const next = async () => {
    if (await trigger(STEP_ONE_FIELDS)) setStep(1);
  };

  const title = page.isEdit ? 'Edit Report' : 'Add Report';

  return (
    <>
      <PageHeader
        title={title}
        description="A report runs one read-only query against a data source."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <form onSubmit={handleSubmit(page.submit)} noValidate className="oe-animate-in">
          <AppCard
            title={title}
            description="Fields marked * are required."
            bodyClassName="px-5 py-6 sm:px-6"
            footer={
              <>
                <AppButton
                  tone="secondary"
                  icon={step === 1 ? <ArrowLeft size={15} /> : undefined}
                  onClick={step === 1 ? () => setStep(0) : page.back}
                  disabled={page.isSaving}
                >
                  {step === 1 ? 'Previous' : 'Cancel'}
                </AppButton>
                {step === 0 ? (
                  <AppButton
                    icon={<ArrowRight size={15} />}
                    iconPlacement="end"
                    onClick={() => void next()}
                    disabled={page.isLoading}
                  >
                    Next
                  </AppButton>
                ) : (
                  <AppButton htmlType="submit" loading={page.isSaving}>
                    Save
                  </AppButton>
                )}
              </>
            }
          >
            <Steps
              current={step}
              size="small"
              className="!mb-7 max-w-md"
              items={[{ title: 'Report details' }, { title: 'Query' }]}
            />
            {page.isLoading ? (
              <LoadingState />
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3 ${step === 0 ? '' : 'hidden'}`}
                >
                  <AppInput control={control} name="reportName" label="Report Name" required />
                  <AppSelect
                    control={control}
                    name="parentMenuId"
                    label="Parent Menu Name"
                    required
                    placeholder="Select Parent Menu"
                    loading={menus.isLoading}
                    options={(menus.data ?? [])
                      .filter((m) => !m.menuUrl)
                      .map((m) => ({ label: m.menuName, value: m.id }))}
                  />
                  <AppSelect
                    control={control}
                    name="dataSourceId"
                    label="DataSource Name"
                    required
                    placeholder="Select DataSource"
                    loading={dataSources.isLoading}
                    options={(dataSources.data ?? []).map((d) => ({
                      label: d.dataSourceName,
                      value: d.id,
                    }))}
                  />
                  <IconSelect control={control} name="icon" required />
                  <AppNumberInput
                    control={control}
                    name="displayOrder"
                    label="Menu Display Order"
                    required
                    min={1}
                    max={999}
                    placeholder="Number, e.g. 10"
                  />
                </div>
                <div className={step === 1 ? 'flex flex-col gap-4' : 'hidden'}>
                  <Alert
                    type="info"
                    showIcon
                    title="Only a single read-only SELECT (or WITH ... SELECT) query is allowed. No comments, no data changes."
                  />
                  <AppInput
                    control={control}
                    name="query"
                    label="Report Query"
                    required
                    kind="textarea"
                    rows={10}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    placeholder="SELECT RunbookName, Status, StartedOn FROM Executions"
                  />
                </div>
              </>
            )}
          </AppCard>
        </form>
      )}
    </>
  );
}
