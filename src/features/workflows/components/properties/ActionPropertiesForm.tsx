import { useMemo } from 'react';
import { Alert, Checkbox } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { LoadingState } from '@/components/common/LoadingState';
import { agentHooks } from '@/features/agentRepository/hooks/useAgents';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import { requiredText } from '@/utils/validators';
import { PROPERTIES_FORM_ID, type NodePropertiesFormProps } from './types';

const buildSchema = (agent: Agent) =>
  z.object({
    label: requiredText('Label', 60),
    timeoutSeconds: z.number({ error: 'Timeout is required' }).int().min(5).max(3600),
    retries: z.number({ error: 'Retries is required' }).int().min(0).max(5),
    continueOnError: z.boolean(),
    parameters: z.object(
      Object.fromEntries(
        agent.parameters.map((p) => [
          p.name,
          p.required ? requiredText(p.label, 500) : z.string().max(500),
        ]),
      ),
    ),
  });

type Values = z.infer<ReturnType<typeof buildSchema>>;

function ActionForm({
  node,
  onApply,
  agent,
}: NodePropertiesFormProps<'action'> & { agent: Agent }) {
  const schema = useMemo(() => buildSchema(agent), [agent]);
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: node.data.label,
      timeoutSeconds: node.data.timeoutSeconds,
      retries: node.data.retries,
      continueOnError: node.data.continueOnError,
      parameters: Object.fromEntries(
        agent.parameters.map((p) => [p.name, node.data.parameters[p.name] ?? p.defaultValue ?? '']),
      ),
    },
  });

  return (
    <form
      id={PROPERTIES_FORM_ID}
      onSubmit={handleSubmit(onApply)}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="m-0 rounded-lg border border-line bg-surface-alt px-3 py-2.5 text-[13px] leading-relaxed text-fg-muted">
        Runs <strong className="text-fg">{agent.name}</strong> ({agent.scriptType}) —{' '}
        {agent.description}
      </p>
      <AppInput control={control} name="label" label="Step Label" required />
      {agent.parameters.length > 0 && (
        <fieldset className="m-0 flex flex-col gap-4 rounded-[10px] border border-line p-3.5 pt-2">
          <legend className="px-1 text-[12px] font-medium uppercase tracking-[0.05em] text-fg-muted">
            Parameters
          </legend>
          {agent.parameters.map((p) => (
            <AppInput
              key={p.name}
              control={control}
              name={`parameters.${p.name}`}
              label={p.label}
              required={p.required}
              placeholder={p.defaultValue}
              hint="Use {{stepLabel.output}} to reference an earlier step."
            />
          ))}
        </fieldset>
      )}
      <div className="grid grid-cols-2 gap-4">
        <AppNumberInput
          control={control}
          name="timeoutSeconds"
          label="Timeout (s)"
          required
          min={5}
          max={3600}
        />
        <AppNumberInput control={control} name="retries" label="Retries" required min={0} max={5} />
      </div>
      <Controller
        control={control}
        name="continueOnError"
        render={({ field }) => (
          <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
            <span className="text-[13px] text-fg-secondary">
              Continue the runbook if this step fails
            </span>
          </Checkbox>
        )}
      />
    </form>
  );
}

export function ActionPropertiesForm(props: NodePropertiesFormProps<'action'>) {
  const agents = agentHooks.useList();
  const agent = agents.data?.find((a) => a.id === props.node.data.agentId);

  if (agents.isLoading) return <LoadingState />;
  if (!agent) {
    return (
      <Alert
        type="error"
        showIcon
        title="The agent used by this step no longer exists. Delete the step or replace it."
      />
    );
  }
  return <ActionForm {...props} agent={agent} />;
}
