import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, ConfigProvider, Tooltip } from 'antd';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eraser, Expand, Minus, Plus, Save, Shrink } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { useFullscreen } from '@/hooks/useFullscreen';
import { agentHooks } from '@/features/agentRepository/hooks/useAgents';
import { ROUTES } from '@/config/routes';
import { getErrorMessage } from '@/utils/helpers';
import { NodeSidebar } from '../components/NodeSidebar';
import { RunbookDetailsForm } from '../components/RunbookDetailsForm';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { WorkflowIssues } from '../components/WorkflowIssues';
import { useWorkflow } from '../hooks/useWorkflow';
import { runbookHooks, useRunbookRoles } from '../hooks/useRunbooks';
import { BYPASS_GUARD_STATE, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { runbookSchema, type RunbookFormValues } from '../schemas/runbook.schemas';
import { useWorkflowStore } from '../stores/workflowStore';
import { downloadJson, toFileName } from '../utils/download';
import { parseDefinition, toDefinition } from '../utils/serialization';
import { nodesWithErrors, validateWorkflow } from '../utils/validateWorkflow';
import { toast } from '@/components/feedback/toastStore';

const RUNBOOK_FORM_ID = 'oe-runbook-form';

function RunbookBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const { getViewport } = useReactFlow();
  const { addNodeAtScreen, focusNode } = useWorkflow();

  const runbook = runbookHooks.useDetail(id);
  const save = runbookHooks.useSave();
  const roles = useRunbookRoles();
  const agents = agentHooks.useList();
  const agentList = useMemo(() => agents.data ?? [], [agents.data]);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const canvasDirty = useWorkflowStore((s) => s.dirty);

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(cardRef);
  const [collapsed, setCollapsed] = useState(false);
  const [showIssues, setShowIssues] = useState(false);

  const { control, handleSubmit, getValues, formState, reset } = useForm<RunbookFormValues>({
    resolver: zodResolver(runbookSchema),
    defaultValues: { name: '', roles: [], description: '' },
    values: runbook.data
      ? {
          name: runbook.data.name,
          roles: runbook.data.roles,
          description: runbook.data.description,
        }
      : undefined,
  });

  // Load the selected runbook (or a blank canvas) into the builder store.
  const loadedRef = useRef<string | null>(null);
  useEffect(() => {
    const key = id ?? 'new';
    if (loadedRef.current === key) return;
    if (!id) {
      useWorkflowStore.getState().reset();
      loadedRef.current = key;
    } else if (runbook.data) {
      useWorkflowStore.getState().load(runbook.data.definition);
      loadedRef.current = key;
    }
  }, [id, runbook.data]);

  const formDirtyRef = useRef(false);
  useEffect(() => {
    formDirtyRef.current = formState.isDirty;
  }, [formState.isDirty]);
  useUnsavedChangesGuard(
    useCallback(() => useWorkflowStore.getState().dirty || formDirtyRef.current, []),
  );

  const issues = useMemo(
    () => (showIssues ? validateWorkflow(nodes, edges, agentList) : []),
    [showIssues, nodes, edges, agentList],
  );
  const invalidNodeIds = useMemo(() => nodesWithErrors(issues), [issues]);

  const runValidation = () => {
    setShowIssues(true);
    const found = validateWorkflow(nodes, edges, agentList);
    if (!found.length) void toast.success('Runbook is valid');
    return found;
  };

  const onSave = handleSubmit((values) => {
    const found = runValidation();
    if (found.some((i) => i.severity === 'error')) {
      void toast.error('Fix the highlighted steps before saving');
      return;
    }
    const definition = toDefinition(nodes, edges, getViewport());
    save.mutate(
      { id, input: { ...values, definition } },
      {
        onSuccess: (saved) => {
          useWorkflowStore.getState().markSaved();
          reset(values);
          setShowIssues(false);
          if (!id) {
            navigate(ROUTES.runbookEdit(saved.id), { replace: true, state: BYPASS_GUARD_STATE });
          }
        },
      },
    );
  });

  const onClear = () =>
    modal.confirm({
      title: 'Clear the canvas?',
      content:
        'Every step except Start will be removed. You can still leave without saving to keep the stored version.',
      okText: 'Clear canvas',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        useWorkflowStore.getState().clear();
        setShowIssues(false);
      },
    });

  const onExport = () => {
    const { name, roles: selectedRoles, description } = getValues();
    downloadJson(toFileName(name), {
      name,
      roles: selectedRoles,
      description,
      definition: toDefinition(nodes, edges, getViewport()),
    });
  };

  const onImport = (json: string) => {
    try {
      const definition = parseDefinition(json);
      useWorkflowStore.getState().load(definition);
      useWorkflowStore.setState({ dirty: true });
      void toast.success('Runbook definition imported');
    } catch (err) {
      void toast.error(getErrorMessage(err, 'Invalid runbook file'));
    }
  };

  if (id && runbook.isLoading) return <LoadingState fullHeight />;
  if (id && runbook.error)
    return <ErrorState error={runbook.error} onRetry={() => void runbook.refetch()} />;

  const isDirty = canvasDirty || formState.isDirty;
  const stepCount = nodes.length;

  const saveButton = (
    <AppButton
      htmlType="submit"
      form={RUNBOOK_FORM_ID}
      loading={save.isPending}
      icon={<Save size={15} />}
    >
      Save runbook
    </AppButton>
  );

  return (
    <>
      <PageHeader
        title={id ? (runbook.data?.name ?? 'Runbook') : 'New runbook'}
        description="Compose agents, commands, conditions and delays into an automated runbook. Changes are validated before saving."
        actions={
          <>
            <AppButton
              tone="secondary"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate(ROUTES.runbookList)}
            >
              Runbooks
            </AppButton>
            <AppButton tone="secondary" icon={<Eraser size={15} />} onClick={onClear}>
              Clear
            </AppButton>
            {saveButton}
          </>
        }
      />
      <ConfigProvider getPopupContainer={() => cardRef.current ?? document.body}>
        <div
          ref={cardRef}
          className={`oe-card flex flex-col overflow-hidden ${isFullscreen ? 'h-screen !rounded-none' : ''}`}
        >
          <header className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3">
            {/* Only the details row is a <form>: the canvas hosts its own property forms, which must not be nested. */}
            <form
              id={RUNBOOK_FORM_ID}
              onSubmit={onSave}
              noValidate
              className="flex min-w-0 flex-1 basis-[420px]"
            >
              <RunbookDetailsForm
                control={control}
                roles={roles.data ?? []}
                rolesLoading={roles.isLoading}
              />
            </form>
            <div className="flex h-9 items-center gap-1">
              <span
                className="mr-2 hidden items-center gap-1.5 text-[12px] text-fg-muted sm:flex"
                aria-live="polite"
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${isDirty ? 'bg-warning' : 'bg-success'}`}
                />
                {isDirty ? 'Unsaved changes' : 'Saved'} · {stepCount} step
                {stepCount === 1 ? '' : 's'}
              </span>
              {isFullscreen && saveButton}
              <Tooltip title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
                <button
                  type="button"
                  className="oe-icon-btn"
                  aria-label="Toggle full screen"
                  onClick={() => void toggleFullscreen()}
                >
                  {isFullscreen ? <Shrink size={16} /> : <Expand size={16} />}
                </button>
              </Tooltip>
              <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                <button
                  type="button"
                  className="oe-icon-btn"
                  aria-label={collapsed ? 'Expand card' : 'Collapse card'}
                  onClick={() => setCollapsed((c) => !c)}
                >
                  {collapsed ? <Plus size={16} /> : <Minus size={16} />}
                </button>
              </Tooltip>
            </div>
          </header>

          {!collapsed && (
            <div
              ref={canvasRef}
              className={`relative flex min-h-0 flex-col lg:flex-row ${
                isFullscreen ? 'flex-1' : 'h-[clamp(560px,calc(100vh-260px),900px)]'
              }`}
            >
              <NodeSidebar
                onAdd={(type, agent) => addNodeAtScreen(type, null, canvasRef.current, agent)}
              />
              <div className="relative min-h-[360px] min-w-0 flex-1">
                <WorkflowCanvas
                  agents={agentList}
                  invalidNodeIds={invalidNodeIds}
                  onValidate={runValidation}
                  onExport={onExport}
                  onImport={onImport}
                />
                {showIssues && issues.length > 0 && (
                  <div className="absolute left-3 top-16 z-10 w-[min(380px,calc(100%-24px))]">
                    <WorkflowIssues
                      issues={issues}
                      onSelect={focusNode}
                      onClose={() => setShowIssues(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ConfigProvider>
    </>
  );
}

export default function RunbookBuilderPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ReactFlowProvider>
      {/* Remount per runbook so form and canvas state never leak between runbooks. */}
      <RunbookBuilder key={id ?? 'new'} />
    </ReactFlowProvider>
  );
}
