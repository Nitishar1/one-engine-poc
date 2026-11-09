import { Input, InputNumber } from 'antd';
import type { InputProps } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from './FormField';

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
}

type AppInputProps<T extends FieldValues> = BaseFieldProps<T> &
  (
    | ({ kind?: 'text' | 'password' } & Omit<InputProps, 'name' | 'value' | 'onChange'>)
    | ({ kind: 'textarea' } & Omit<TextAreaProps, 'name' | 'value' | 'onChange'>)
  );

/** Text / password / textarea input bound to React Hook Form. */
export function AppInput<T extends FieldValues>(props: AppInputProps<T>) {
  const { control, name, label, required, hint, className, kind = 'text', ...rest } = props;
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const common = {
          id,
          ...field,
          value: field.value ?? '',
          status: fieldState.error ? ('error' as const) : undefined,
        };
        let input;
        if (kind === 'textarea')
          input = <Input.TextArea {...common} {...(rest as TextAreaProps)} />;
        else if (kind === 'password')
          input = <Input.Password {...common} {...(rest as InputProps)} />;
        else input = <Input {...common} {...(rest as InputProps)} />;
        return (
          <FormField
            label={label}
            required={required}
            error={fieldState.error?.message}
            htmlFor={id}
            hint={hint}
            className={className}
          >
            {input}
          </FormField>
        );
      }}
    />
  );
}

interface AppNumberInputProps<T extends FieldValues> extends BaseFieldProps<T> {
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function AppNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  required,
  hint,
  className,
  ...rest
}: AppNumberInputProps<T>) {
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
          hint={hint}
          className={className}
        >
          <InputNumber
            id={id}
            className="!w-full"
            value={field.value}
            onChange={(v) => field.onChange(v ?? undefined)}
            onBlur={field.onBlur}
            status={fieldState.error ? 'error' : undefined}
            {...rest}
          />
        </FormField>
      )}
    />
  );
}
