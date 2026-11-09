import { Checkbox } from 'antd';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { SelectOption } from '@/types/common.types';
import { FormField } from './FormField';

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  className?: string;
}

/** Single yes / no checkbox bound to React Hook Form (e.g. "Is Admin"). */
export function AppCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  className,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
          <Checkbox
            id={`field-${name}`}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
          >
            <span className="text-[13px] font-medium text-fg">{label}</span>
          </Checkbox>
          {hint && <span className="text-[12.5px] text-fg-muted">{hint}</span>}
        </div>
      )}
    />
  );
}

interface CheckboxGroupProps<T extends FieldValues> extends BaseProps<T> {
  options: SelectOption[];
  required?: boolean;
}

/** List of checkboxes whose value is an array of the checked option values (e.g. roles). */
export function AppCheckboxGroup<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  className,
  options,
  required,
}: CheckboxGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          error={fieldState.error?.message}
          hint={hint}
          className={className}
        >
          <Checkbox.Group
            value={field.value ?? []}
            onChange={field.onChange}
            options={options}
            className="flex flex-col gap-2 rounded-[var(--oe-radius)] border border-line bg-surface-alt p-3"
          />
        </FormField>
      )}
    />
  );
}
