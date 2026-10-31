import { Input, Select } from 'antd';
import { Controller, type Control } from 'react-hook-form';
import type { RunbookFormValues } from '../schemas/runbook.schemas';

interface RunbookDetailsFormProps {
  control: Control<RunbookFormValues>;
  roles: string[];
  rolesLoading: boolean;
}

const labelClass = 'shrink-0 text-[12.5px] font-medium text-fg-muted';

/** Compact "Name / Roles" bar at the top of the builder surface. */
export function RunbookDetailsForm({ control, roles, rolesLoading }: RunbookDetailsFormProps) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-3">
              <label htmlFor="runbook-name" className={labelClass}>
                Name<span className="text-danger">*</span>
              </label>
              <Input
                id="runbook-name"
                {...field}
                placeholder="e.g. Restart IIS on web tier"
                status={fieldState.error ? 'error' : undefined}
                aria-invalid={Boolean(fieldState.error)}
                className="min-w-0 flex-1"
              />
            </div>
            {fieldState.error && (
              <span role="alert" className="text-[12.5px] text-danger md:pl-[52px]">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
      <Controller
        control={control}
        name="roles"
        render={({ field, fieldState }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-3">
              <label htmlFor="runbook-roles" className={labelClass}>
                Roles<span className="text-danger">*</span>
              </label>
              <Select
                id="runbook-roles"
                mode="multiple"
                placeholder="Who can run this runbook"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                loading={rolesLoading}
                options={roles.map((r) => ({ label: r, value: r }))}
                status={fieldState.error ? 'error' : undefined}
                className="min-w-0 flex-1"
                maxTagCount="responsive"
              />
            </div>
            {fieldState.error && (
              <span role="alert" className="text-[12.5px] text-danger md:pl-[52px]">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
}
