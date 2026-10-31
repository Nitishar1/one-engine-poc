import { Checkbox, Input } from 'antd';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, type Control, type FieldErrors } from 'react-hook-form';
import { AppButton } from '@/components/common/AppButton';
import type { AgentFormValues } from '../utils/agent.schemas';

interface AgentParametersFieldProps {
  control: Control<AgentFormValues>;
  errors: FieldErrors<AgentFormValues>;
}

const fieldError = (message?: string) =>
  message ? (
    <span role="alert" className="mt-1 block text-[12px] text-danger">
      {message}
    </span>
  ) : null;

/** Editable list of runtime parameters an agent accepts. */
export function AgentParametersField({ control, errors }: AgentParametersFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'parameters' });
  const rowErrors = errors.parameters;
  const add = () => append({ name: '', label: '', required: false, defaultValue: '' });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-fg">
          Parameters
          {fields.length > 0 && <span className="ml-1.5 text-fg-muted">({fields.length})</span>}
        </span>
        {fields.length > 0 && (
          <AppButton tone="secondary" size="small" icon={<Plus size={14} />} onClick={add}>
            Add parameter
          </AppButton>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-line-strong px-4 py-6 text-center">
          <SlidersHorizontal size={18} className="text-fg-muted" />
          <p className="m-0 text-[13px] text-fg-muted">
            No parameters. The agent runs without input.
          </p>
          <AppButton tone="secondary" size="small" icon={<Plus size={14} />} onClick={add}>
            Add parameter
          </AppButton>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-line">
          <div className="hidden grid-cols-[1fr_1fr_1fr_96px_32px] gap-2 border-b border-line bg-surface-alt px-3 py-2 text-[12px] font-medium text-fg-muted md:grid">
            <span>Name</span>
            <span>Label</span>
            <span>Default value</span>
            <span>Required</span>
            <span className="sr-only">Remove</span>
          </div>
          {fields.map((field, index) => {
            const err = rowErrors?.[index];
            return (
              <div
                key={field.id}
                className="oe-animate-in grid grid-cols-1 items-start gap-2 border-b border-line px-3 py-2.5 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_96px_32px]"
              >
                <Controller
                  control={control}
                  name={`parameters.${index}.name`}
                  render={({ field: f }) => (
                    <div>
                      <Input
                        {...f}
                        placeholder="ServiceName"
                        aria-label="Parameter name"
                        className="font-mono !text-[13px]"
                        status={err?.name ? 'error' : undefined}
                      />
                      {fieldError(err?.name?.message)}
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name={`parameters.${index}.label`}
                  render={({ field: f }) => (
                    <div>
                      <Input
                        {...f}
                        placeholder="Service name"
                        aria-label="Parameter label"
                        status={err?.label ? 'error' : undefined}
                      />
                      {fieldError(err?.label?.message)}
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name={`parameters.${index}.defaultValue`}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      value={f.value ?? ''}
                      placeholder="Optional"
                      aria-label="Default value"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`parameters.${index}.required`}
                  render={({ field: f }) => (
                    <Checkbox
                      checked={f.value}
                      onChange={(e) => f.onChange(e.target.checked)}
                      className="h-9 items-center"
                    >
                      Required
                    </Checkbox>
                  )}
                />
                <button
                  type="button"
                  aria-label="Remove parameter"
                  onClick={() => remove(index)}
                  className="oe-icon-btn is-danger mt-0.5"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {rowErrors?.root?.message && fieldError(rowErrors.root.message)}
    </div>
  );
}
