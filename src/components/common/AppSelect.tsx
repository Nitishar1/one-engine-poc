import { Select, type SelectProps } from 'antd';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { SelectOption } from '@/types/common.types';
import { FormField } from './FormField';

interface AppSelectProps<T extends FieldValues> extends Omit<
  SelectProps,
  'value' | 'onChange' | 'options'
> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  options: SelectOption<string | number>[] | SelectProps['options'];
  className?: string;
  hint?: string;
}

/** Ant Design select bound to React Hook Form. */
export function AppSelect<T extends FieldValues>({
  control,
  name,
  label,
  required,
  options,
  className,
  hint,
  ...selectProps
}: AppSelectProps<T>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          error={fieldState.error?.message}
          htmlFor={id}
          className={className}
          hint={hint}
        >
          <Select
            id={id}
            value={field.value === '' ? undefined : field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={options}
            status={fieldState.error ? 'error' : undefined}
            className="!w-full"
            showSearch={{ optionFilterProp: 'label' }}
            {...selectProps}
          />
        </FormField>
      )}
    />
  );
}
